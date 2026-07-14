import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getBalance, getBalances } from "../services/stellar";

function BalanceCard() {
  const { walletAddress, refreshBalance } = useWallet();
  const [balance, setBalance] = useState("0");
  const [balances, setBalances] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      if (!walletAddress) {
        setBalance("0");
        setBalances([]);
        return;
      }
      // Fetch primary XLM balance
      const bal = await getBalance(walletAddress);
      setBalance(bal);

      // Scan all trustlines / portfolio balances
      const allBalances = await getBalances(walletAddress);
      setBalances(allBalances);
    }
    fetchBalance();
  }, [walletAddress, refreshBalance]);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-2.5 border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl p-5.5 shadow-[4px_4px_0px_0px_var(--border-color)] flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_var(--border-color)] transition-all duration-200">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          // Stellar Balance Card
        </h3>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono font-bold text-[var(--accent-secondary)] uppercase tracking-wider block">
              Connected wallet address
            </span>
            {walletAddress ? (
              <div className="font-mono text-xs text-[var(--text-primary)] break-all bg-[var(--input-bg)] p-3.5 border-2 border-[var(--border-color)] rounded-lg mt-2 flex items-center justify-between gap-2 shadow-[2.5px_2.5px_0px_0px_var(--border-color)]">
                <span className="select-all font-bold">{walletAddress}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-all cursor-pointer flex-shrink-0 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--border-color)]"
                  title="Copy Address"
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
            ) : (
              <p className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-2 bg-[var(--input-bg)] p-3.5 border-2 border-dashed border-[var(--border-color)] rounded-lg">
                Wallet not connected. Activate in header.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-dashed border-[var(--border-color)]">
        <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-wider block">
          Available balance
        </span>
        <h2 className="text-4xl font-mono font-extrabold text-[var(--text-primary)] mt-1.5 flex items-baseline gap-1.5">
          <span>{balance}</span>
          <span className="text-sm uppercase tracking-widest font-bold text-[var(--accent-color)]">XLM</span>
        </h2>

        {/* Custom Trustlines Portfolio Section */}
        {walletAddress && balances.filter((b) => b.code !== "XLM").length > 0 && (
          <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--border-color)]">
            <span className="text-xs uppercase font-mono font-bold text-[var(--accent-secondary)] tracking-wider block mb-3">
              // Custom Trustlines Detected
            </span>
            <div className="space-y-2">
              {balances
                .filter((b) => b.code !== "XLM")
                .map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[var(--input-bg)] px-3.5 py-2.5 border-2 border-[var(--border-color)] rounded-lg shadow-[2px_2px_0px_0px_var(--border-color)] font-mono"
                  >
                    <span className="text-xs font-bold text-[var(--text-primary)]">{b.code}</span>
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Dashboard Stats Widget Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-[var(--input-bg)] p-3 border-2 border-[var(--border-color)] rounded-lg text-center shadow-[2px_2px_0px_0px_var(--border-color)]">
            <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Network</span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] mt-1 block">
              {walletAddress ? "Testnet" : "None"}
            </span>
          </div>
          <div className="bg-[var(--input-bg)] p-3 border-2 border-[var(--border-color)] rounded-lg text-center shadow-[2px_2px_0px_0px_var(--border-color)]">
            <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Status</span>
            {walletAddress ? (
              <span className="text-xs font-syne font-extrabold text-emerald-500 mt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Active</span>
              </span>
            ) : (
              <span className="text-xs font-syne font-extrabold text-[var(--text-secondary)] mt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] inline-block"></span>
                <span>Off</span>
              </span>
            )}
          </div>
          <div className="bg-[var(--input-bg)] p-3 border-2 border-[var(--border-color)] rounded-lg text-center shadow-[2px_2px_0px_0px_var(--border-color)]">
            <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Asset</span>
            <span className="text-xs font-mono font-bold text-[var(--accent-color)] mt-1 block">
              {walletAddress ? "XLM" : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;