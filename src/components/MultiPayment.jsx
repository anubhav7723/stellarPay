import { useState, useEffect } from "react";
import { sendPayment, getBalances } from "../services/stellar";
import { recordPayment, updateStatus, sendPaymentDirect } from "../services/contract";
import { useWallet } from "../context/WalletContext";
import { getAddressAvatar } from "../utils/avatar";

const STROOPS_PER_XLM = 10_000_000;

function emptyRow() {
  return { key: crypto.randomUUID(), recipient: "", amount: "", status: "idle" };
}


function MultiPayment() {
  const [rows, setRows] = useState([emptyRow()]);
  const [sending, setSending] = useState(false);
  
  // Custom Level 3 States
  const [routingMethod, setRoutingMethod] = useState("direct"); // "direct" | "classic"
  const [availableTokens, setAvailableTokens] = useState([{ code: "XLM", contractId: "CAS3J7GYCCKCRSS7Z3G3DYSUG3DHLBI2CDIGEO7Z4SHE6G46DQTU6R66", balance: "0" }]);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [customTokenContract, setCustomTokenContract] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(null); // Row key

  const {
    walletAddress,
    setTransactionStatus,
    setTransactionHash,
    refreshBalance,
    setRefreshBalance,
    setLastError,
  } = useWallet();

  // Load contacts and wallet token trustlines
  useEffect(() => {
    // 1. Load contacts
    const savedContacts = localStorage.getItem("stellarpay_contacts");
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load trustlines for token selector
    async function loadWalletTokens() {
      if (!walletAddress) return;
      const balances = await getBalances(walletAddress);
      if (balances && balances.length > 0) {
        setAvailableTokens(balances);
      }
    }
    loadWalletTokens();
  }, [walletAddress, refreshBalance]);

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

  // Auto-fill address from contacts
  const handleSelectContact = (rowKey, contactAddress) => {
    updateRow(rowKey, "recipient", contactAddress);
    setShowContactPicker(null);
  };

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

    // Resolve token address for direct routing
    const currentToken = availableTokens[selectedTokenIndex] || {};
    const tokenContractId = currentToken.code === "XLM" 
      ? currentToken.contractId 
      : (customTokenContract || currentToken.contractId);

    if (routingMethod === "direct" && !tokenContractId) {
      alert("Please specify a valid Token Contract ID for the custom asset.");
      setSending(false);
      return;
    }

    for (const row of valid) {
      let paymentId = null;
      try {
        if (routingMethod === "direct") {
          // Direct On-Chain Contract routing
          setRowState(row.key, { status: "sending" });
          setTransactionStatus(`Direct routing ${row.amount} ${currentToken.code || "XLM"} directly via contract...`);
          setTransactionHash("");

          const amountStroops = Math.round(Number(row.amount) * STROOPS_PER_XLM);
          const result = await sendPaymentDirect(
            walletAddress,
            tokenContractId,
            row.recipient.trim(),
            amountStroops,
            `Direct ${currentToken.code || "XLM"} Contract route`
          );

          setRowState(row.key, { status: "completed" });
          setTransactionStatus("✅ Direct Payment Sent Successfully");
          setTransactionHash(result.hash);
        } else {
          // Classic logging path (Level 2)
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
        }
        setRefreshBalance(!refreshBalance);
      } catch (err) {
        console.error(err);
        setLastError(err);
        setRowState(row.key, { status: "failed" });
        setTransactionStatus(`❌ ${err.name || "Transaction Failed"}: ${err.message}`);

        if (paymentId && routingMethod === "classic") {
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

  const currentToken = availableTokens[selectedTokenIndex] || {};

  return (
    <div className="space-y-6">
      
      {/* Route Method and Asset Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-app)]/30 rounded-xl mb-4">
        
        {/* Routing Selector */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
            Routing Mechanism
          </label>
          <div className="flex border-2 border-[var(--border-color)] rounded-lg p-1 bg-[var(--bg-card)]">
            <button
              onClick={() => setRoutingMethod("direct")}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded cursor-pointer ${
                routingMethod === "direct"
                  ? "bg-[var(--accent-secondary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Direct routing
            </button>
            <button
              onClick={() => setRoutingMethod("classic")}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded cursor-pointer ${
                routingMethod === "classic"
                  ? "bg-[var(--accent-color)] text-[#1a1a1a]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Audit Logging
            </button>
          </div>
        </div>

        {/* Token Selector */}
        {routingMethod === "direct" && (
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
              Select Token Asset
            </label>
            <select
              value={selectedTokenIndex}
              onChange={(e) => setSelectedTokenIndex(Number(e.target.value))}
              className="w-full p-2.5 border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-sm rounded-lg font-bold outline-none text-[var(--text-primary)] cursor-pointer"
            >
              {availableTokens.map((t, idx) => (
                <option key={idx} value={idx}>
                  {t.code} (Bal: {parseFloat(t.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Custom Token Contract input */}
      {routingMethod === "direct" && currentToken.code !== "XLM" && (
        <div className="p-4 border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl shadow-[3px_3px_0px_0px_var(--border-color)]">
          <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
            Stellar Asset Contract Address
          </label>
          <input
            type="text"
            placeholder="e.g. C..."
            value={customTokenContract || currentToken.contractId || ""}
            onChange={(e) => setCustomTokenContract(e.target.value)}
            className="w-full p-3 rounded-lg brutalist-input outline-none text-sm font-mono font-semibold"
          />
        </div>
      )}

      {/* Recipient Form List */}
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
                <div className="flex gap-2">
                  {/* Contacts Autocomplete trigger */}
                  {contacts.length > 0 && (
                    <button
                      onClick={() => setShowContactPicker(showContactPicker === row.key ? null : row.key)}
                      className="px-2.5 py-1 border-2 border-[var(--border-color)] bg-[var(--bg-tab-bar)] rounded text-[10px] uppercase font-syne font-bold tracking-wider cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-[var(--text-primary)]"
                    >
                      Contacts
                    </button>
                  )}
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.key)}
                      className="px-2.5 py-1 border-2 border-[var(--border-color)] bg-red-500 text-white rounded text-[10px] uppercase font-syne font-bold tracking-wider cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Picker List Dropdown */}
              {showContactPicker === row.key && (
                <div className="border-2 border-[var(--border-color)] bg-[var(--bg-app)] p-3 rounded-lg mb-4 shadow-[2px_2px_0px_0px_var(--border-color)] max-h-[150px] overflow-y-auto space-y-1.5 z-20 relative">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
                    Select Contact:
                  </span>
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectContact(row.key, c.address)}
                      className="p-2 border border-[var(--border-color)] bg-[var(--bg-card)] rounded hover:bg-[var(--accent-color)]/20 cursor-pointer font-bold text-xs flex justify-between items-center transition-all"
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                        {c.address.slice(0, 6)}...{c.address.slice(-4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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
                    Amount ({currentToken.code || "XLM"})
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
    sending: ["Sending Transfer...", "bg-sky-100 border-[var(--border-color)] text-sky-800 shadow-[1px_1px_0px_0px_var(--border-color)] animate-pulse"],
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
