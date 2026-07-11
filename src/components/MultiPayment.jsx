import { useState } from "react";
import { sendPayment } from "../services/stellar";
import { recordPayment, updateStatus } from "../services/contract";
import { useWallet } from "../context/WalletContext";

const STROOPS_PER_XLM = 10_000_000;

function emptyRow() {
  return { key: crypto.randomUUID(), recipient: "", amount: "", status: "idle" };
}

// Generate unique avatar background and initials from address string
export function getAddressAvatar(address) {
  if (!address || address.length < 5) {
    return {
      initials: "??",
      gradient: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)", // muted slate gray
    };
  }

  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  const presets = [
    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // orange
    "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)", // purple
    "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // cyan
    "linear-gradient(135deg, #10b981 0%, #047857 100%)", // emerald
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // pink
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // blue
    "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", // yellow
    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", // red
  ];

  const gradient = presets[index % presets.length];
  const initials = address.slice(0, 1) + address.slice(4, 5).toUpperCase();
  return { initials, gradient };
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

  const getRowAvatar = (addr) => {
    return getAddressAvatar(addr.trim());
  };

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
      alert("Please connect your wallet first.");
      return;
    }

    const valid = rows.filter((r) => r.recipient.trim() && Number(r.amount) > 0);
    if (valid.length === 0) {
      alert("Please enter at least one recipient address and amount.");
      return;
    }

    setSending(true);
    setLastError(null);

    for (const row of valid) {
      let paymentId = null;
      try {
        setRowState(row.key, { status: "recording" });

        const amountStroops = Math.round(Number(row.amount) * STROOPS_PER_XLM);
        const recorded = await recordPayment(
          walletAddress,
          row.recipient.trim(),
          amountStroops,
          `Payment to ${row.recipient.slice(0, 6)}`
        );
        paymentId = recorded.paymentId;

        setRowState(row.key, { status: "sending" });
        setTransactionStatus(`Sending payment to ${row.recipient.slice(0, 8)}...`);
        setTransactionHash("");

        const response = await sendPayment(walletAddress, row.recipient.trim(), row.amount);

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
    <div className="space-y-6">
      <div className="space-y-5">
        {rows.map((row, index) => {
          const avatar = getRowAvatar(row.recipient);
          return (
            <div
              key={row.key}
              className="border-2.5 border-[var(--border-color)] bg-[var(--bg-card)] p-5 rounded-xl relative transition-all shadow-[4px_4px_0px_0px_var(--border-color)]"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-dashed border-[var(--border-color)]">
                <span className="text-xs font-mono font-bold text-[var(--accent-secondary)] uppercase tracking-wider">
                  // Recipient #{index + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.key)}
                    className="px-2.5 py-1 border-2 border-[var(--border-color)] bg-red-500 text-white rounded text-[10px] uppercase font-syne font-bold tracking-wider cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Recipient Input with Dynamic Avatar */}
                <div className="flex items-end gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold border-2.5 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--border-color)]"
                    style={{ background: avatar.gradient }}
                    title={`Identicon for ${row.recipient || "empty address"}`}
                  >
                    {avatar.initials}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GBG2...4XZP"
                      value={row.recipient}
                      onChange={(e) => updateRow(row.key, "recipient", e.target.value)}
                      className="w-full p-3.5 rounded-lg brutalist-input outline-none text-sm font-mono font-semibold"
                      disabled={sending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => updateRow(row.key, "amount", e.target.value)}
                    className="w-full p-3.5 rounded-lg brutalist-input outline-none text-sm font-semibold"
                    disabled={sending}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-[var(--border-color)]">
                <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-wider">Status</span>
                <StatusBadge status={row.status} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          onClick={addRow}
          disabled={sending}
          className="flex-1 brutalist-button font-syne py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Recipient</span>
        </button>

        <button
          onClick={handleSendAll}
          disabled={sending}
          className="flex-2 brutalist-button-accent font-syne py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Send All Payments</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    idle: ["Ready", "bg-slate-100 border-[var(--border-color)] text-slate-800 shadow-[1px_1px_0px_0px_var(--border-color)]"],
    recording: ["Recording on-chain...", "bg-amber-100 border-[var(--border-color)] text-amber-800 shadow-[1px_1px_0px_0px_var(--border-color)] animate-pulse"],
    sending: ["Sending XLM...", "bg-sky-100 border-[var(--border-color)] text-sky-800 shadow-[1px_1px_0px_0px_var(--border-color)] animate-pulse"],
    completed: ["Completed", "bg-emerald-100 border-[var(--border-color)] text-emerald-800 shadow-[1px_1px_0px_0px_var(--border-color)]"],
    failed: ["Failed", "bg-rose-100 border-[var(--border-color)] text-rose-800 shadow-[1px_1px_0px_0px_var(--border-color)]"],
  };
  const [label, colorClass] = map[status] || map.idle;
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 border-2 font-bold ${colorClass}`}>
      {label}
    </span>
  );
}

export default MultiPayment;
