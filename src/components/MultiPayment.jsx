import { useState } from "react";
import { sendPayment } from "../services/stellar";
import { recordPayment, updateStatus } from "../services/contract";
import { useWallet } from "../context/WalletContext";

const STROOPS_PER_XLM = 10_000_000;

function emptyRow() {
  return { key: crypto.randomUUID(), recipient: "", amount: "", status: "idle" };
}

function MultiPayment() {
  const [rows, setRows] = useState([emptyRow()]);
  const [sending, setSending] = useState(false);

  const {
    walletAddress,
    setTransactionStatus,
    setTransactionHash,
    refreshBalance,
    setRefreshBalance,
    setLastError,
  } = useWallet();

  function updateRow(key, field, value) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(key) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function setRowState(key, patch) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function handleSendAll() {
    if (!walletAddress) {
      alert("Connect a wallet first.");
      return;
    }

    const valid = rows.filter((r) => r.recipient.trim() && Number(r.amount) > 0);
    if (valid.length === 0) {
      alert("Add at least one recipient and amount.");
      return;
    }

    setSending(true);
    setLastError(null);

    for (const row of valid) {
      let paymentId = null;
      try {
        setRowState(row.key, { status: "recording" });

        // 1. Log the payment intent on-chain (status = Pending).
        const amountStroops = Math.round(Number(row.amount) * STROOPS_PER_XLM);
        const recorded = await recordPayment(
          walletAddress,
          row.recipient.trim(),
          amountStroops,
          `Payment to ${row.recipient.slice(0, 6)}`
        );
        paymentId = recorded.paymentId;

        // 2. Submit the actual classic XLM transfer.
        setRowState(row.key, { status: "sending" });
        setTransactionStatus(`Sending payment to ${row.recipient.slice(0, 8)}...`);
        setTransactionHash("");

        const response = await sendPayment(walletAddress, row.recipient.trim(), row.amount);

        // 3. Mark it Completed in the contract.
        await updateStatus(walletAddress, paymentId, true);

        setRowState(row.key, { status: "completed" });
        setTransactionStatus("✅ Payment Sent Successfully");
        setTransactionHash(response.hash);
        setRefreshBalance(!refreshBalance);
      } catch (err) {
        console.error(err);
        setLastError(err);
        setRowState(row.key, { status: "failed" });
        setTransactionStatus(`❌ ${err.name || "Transaction Failed"}: ${err.message}`);

        // Best-effort: mark it Failed in the contract if it was recorded.
        if (paymentId) {
          try {
            await updateStatus(walletAddress, paymentId, false);
          } catch (innerErr) {
            console.error("Could not mark payment as failed:", innerErr);
          }
        }
      }
    }

    setSending(false);
  }

  return (
    <div className="mt-8 bg-slate-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-5">Payment Tracker — Multi-Address Send</h2>

      {rows.map((row) => (
        <div key={row.key} className="mb-4 border border-slate-600 rounded-lg p-3">
          <label className="block text-sm mb-2">Recipient Address</label>
          <input
            type="text"
            placeholder="Enter Stellar Address"
            value={row.recipient}
            onChange={(e) => updateRow(row.key, "recipient", e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 outline-none focus:border-blue-500 mb-3"
          />

          <label className="block text-sm mb-2">Amount (XLM)</label>
          <input
            type="number"
            placeholder="0.00"
            value={row.amount}
            onChange={(e) => updateRow(row.key, "amount", e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 outline-none focus:border-blue-500"
          />

          <div className="flex justify-between items-center mt-2">
            <StatusBadge status={row.status} />
            <button
              onClick={() => removeRow(row.key)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addRow}
        className="w-full mb-4 bg-slate-600 hover:bg-slate-500 py-2 rounded-lg text-sm"
      >
        + Add Recipient
      </button>

      <button
        onClick={handleSendAll}
        disabled={sending}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-lg font-medium"
      >
        {sending ? "Processing..." : "Send All Payments"}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    idle: ["Idle", "bg-slate-600"],
    recording: ["Recording on-chain...", "bg-yellow-600"],
    sending: ["Pending", "bg-yellow-600"],
    completed: ["✅ Completed", "bg-green-600"],
    failed: ["❌ Failed", "bg-red-600"],
  };
  const [label, color] = map[status] || map.idle;
  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>;
}

export default MultiPayment;
