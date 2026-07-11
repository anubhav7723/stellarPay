import { useEffect, useState } from "react";
import { getRecentPayments } from "../services/contract";
import { CONTRACT_ID } from "../services/contract";
import { getAddressAvatar } from "./MultiPayment";

const POLL_INTERVAL_MS = 5000;

function formatXLM(stroops) {
  return (Number(stroops) / 10_000_000).toFixed(2);
}

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!CONTRACT_ID) return;

    let cancelled = false;

    async function poll() {
      try {
        const recent = await getRecentPayments(10);
        if (!cancelled) {
          setPayments(recent);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleCopyAddress = (addr, id) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!CONTRACT_ID) {
    return (
      <div className="bg-amber-100 dark:bg-amber-950/20 border-2.5 border-[var(--border-color)] p-5 rounded-xl shadow-[4px_4px_0px_0px_var(--border-color)] text-sm leading-relaxed flex items-start gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-800 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-amber-900 dark:text-amber-400">
          <span className="font-bold">Missing Contract Configuration:</span> Set{" "}
          <code className="font-mono bg-white dark:bg-black/40 border border-[var(--border-color)] px-1.5 py-0.5 rounded">VITE_CONTRACT_ID</code> in your{" "}
          <code className="font-mono bg-white dark:bg-black/40 border border-[var(--border-color)] px-1.5 py-0.5 rounded">.env</code> file after deploying your Soroban contract to check ledger logs.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[var(--border-color)]">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          // Live ledger ({payments.length} items)
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--accent-secondary)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Sync Active</span>
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-950/20 border-2 border-red-500 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-mono font-bold shadow-[2px_2px_0px_0px_var(--border-color)]">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-10 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-app)]/30 rounded-xl">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-55 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xs uppercase tracking-wider font-bold">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => {
            const status = p.status?.tag || p.status || "Pending";
            const avatar = getAddressAvatar(p.recipient);
            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-card)] border-2.5 border-[var(--border-color)] rounded-xl p-4.5 transition-all shadow-[3px_3px_0px_0px_var(--border-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_var(--border-color)]"
              >
                <div className="flex items-center gap-3">
                  {/* Identicon avatar with outline */}
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]"
                    style={{ background: avatar.gradient }}
                    title={`Identicon for ${p.recipient}`}
                  >
                    {avatar.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {p.recipient.slice(0, 8)}...{p.recipient.slice(-6)}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(p.recipient, p.id)}
                        className="p-1 border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--border-color)]"
                        title="Copy Address"
                      >
                        {copiedId === p.id ? (
                          <span className="text-[9px] text-emerald-500 font-extrabold px-0.5">copied!</span>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {p.memo && (
                      <p className="text-xs text-[var(--text-secondary)] font-mono mt-1 font-bold">
                        // memo: "{p.memo}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-dashed border-[var(--border-color)]">
                  <span className="text-sm font-mono font-extrabold text-[var(--text-primary)]">
                    {formatXLM(p.amount)} XLM
                  </span>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 border-[var(--border-color)] text-amber-900 shadow-[1px_1px_0px_0px_var(--border-color)]",
    Completed: "bg-emerald-100 border-[var(--border-color)] text-emerald-900 shadow-[1px_1px_0px_0px_var(--border-color)]",
    Failed: "bg-rose-100 border-[var(--border-color)] text-rose-900 shadow-[1px_1px_0px_0px_var(--border-color)]",
  };
  const styleClass = styles[status] || "bg-slate-100 border-[var(--border-color)] text-slate-800 shadow-[1px_1px_0px_0px_var(--border-color)]";
  return (
    <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2.5 py-1 border-2 font-bold ${styleClass}`}>
      {status}
    </span>
  );
}

export default PaymentList;
