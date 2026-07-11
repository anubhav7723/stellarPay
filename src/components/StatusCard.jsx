import { useState } from "react";
import { useWallet } from "../context/WalletContext";

function StatusCard() {
  const { transactionStatus, transactionHash } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    if (!transactionHash) return;
    navigator.clipboard.writeText(transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusAlertStyle = () => {
    if (!transactionStatus) return "";
    if (transactionStatus.includes("✅") || transactionStatus.includes("Successfully")) {
      return "bg-emerald-100 border-emerald-600 text-emerald-900 shadow-[2.5px_2.5px_0px_0px_var(--border-color)]";
    }
    if (transactionStatus.includes("❌") || transactionStatus.includes("Failed")) {
      return "bg-rose-100 border-rose-600 text-rose-900 shadow-[2.5px_2.5px_0px_0px_var(--border-color)]";
    }
    return "bg-amber-100 border-amber-500 text-amber-900 shadow-[2.5px_2.5px_0px_0px_var(--border-color)] animate-pulse";
  };

  return (
    <div className="border-2.5 border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl p-5.5 shadow-[4px_4px_0px_0px_var(--border-color)] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_var(--border-color)] transition-all duration-200 h-full">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          // Status Monitor
        </h3>

        {!transactionStatus ? (
          <div className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] bg-[var(--input-bg)] p-4.5 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--text-secondary)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
            </svg>
            <span>Awaiting transaction init...</span>
          </div>
        ) : (
          <div className={`p-4 border-2 rounded-lg text-xs font-mono font-bold uppercase ${getStatusAlertStyle()}`}>
            {transactionStatus}
          </div>
        )}
      </div>

      {transactionHash && (
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--border-color)]">
          <span className="text-xs font-mono font-bold text-[var(--accent-secondary)] uppercase tracking-wider block">
            Transaction Hash
          </span>
          <div className="font-mono text-[10px] sm:text-xs text-[var(--text-primary)] break-all bg-[var(--input-bg)] p-3.5 border-2 border-[var(--border-color)] rounded-lg mt-2 flex items-center justify-between gap-2 shadow-[2.5px_2.5px_0px_0px_var(--border-color)]">
            <span className="select-all font-bold">{transactionHash}</span>
            <button
              onClick={handleCopyHash}
              className="p-1.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-all cursor-pointer flex-shrink-0 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--border-color)]"
              title="Copy Hash"
            >
              {copied ? (
                <span className="text-[10px] text-emerald-500 font-extrabold px-0.5">copied!</span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusCard;