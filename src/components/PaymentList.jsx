import { useEffect, useState } from "react";
import { getRecentPayments } from "../services/contract";
import { CONTRACT_ID } from "../services/contract";

const POLL_INTERVAL_MS = 5000;

const STATUS_STYLES = {
  Pending: "bg-yellow-600",
  Completed: "bg-green-600",
  Failed: "bg-red-600",
};

function formatXLM(stroops) {
  return (Number(stroops) / 10_000_000).toFixed(2);
}

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

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

  if (!CONTRACT_ID) {
    return (
      <div className="mt-8 bg-slate-700 rounded-xl p-5 text-sm text-gray-400">
        Set <code>VITE_CONTRACT_ID</code> in your <code>.env</code> after deploying the
        contract to see live on-chain payment history here.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-slate-700 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">On-Chain Payment History</h2>
        <span className="text-xs text-gray-400">auto-refreshing every 5s</span>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {payments.length === 0 ? (
        <p className="text-sm text-gray-400">No payments recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-slate-800 rounded-lg p-3 text-sm"
            >
              <div>
                <p className="font-mono text-xs text-gray-300">
                  {p.recipient.slice(0, 6)}...{p.recipient.slice(-4)}
                </p>
                <p className="text-gray-400">{formatXLM(p.amount)} XLM</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.status?.tag || p.status] || "bg-slate-600"}`}
              >
                {p.status?.tag || p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentList;
