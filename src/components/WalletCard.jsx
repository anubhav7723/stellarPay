import { connectWallet } from "../services/stellar";
import { useWallet } from "../context/WalletContext";

function WalletCard() {
  const {
    walletAddress,
    setWalletAddress,
    walletName,
    setWalletName,
    setLastError,
  } = useWallet();

  async function handleConnect() {
    try {
      setLastError(null);
      const { address, name } = await connectWallet();
      setWalletAddress(address);
      setWalletName(name);
    } catch (err) {
      setLastError(err);
      alert(`[${err.name || "Error"}] ${err.message}`);
    }
  }

  function handleDisconnect() {
    setWalletAddress("");
    setWalletName("");
  }

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-2.5">
      {walletAddress ? (
        <div className="flex items-center gap-2.5 animate-fade-in z-10">
          {/* Brutalist Connected Status Block */}
          <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-[var(--bg-card)] border-2.5 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--border-color)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              {truncateAddress(walletAddress)}
            </span>
            <span className="text-[var(--text-primary)] border-1.5 border-[var(--border-color)] bg-[var(--accent-color)] text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--border-color)] hidden sm:inline-block">
              {walletName || "Wallet"}
            </span>
          </div>

          {/* Brutalist Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="p-2.5 border-2.5 border-[var(--border-color)] bg-red-500 hover:bg-red-600 text-white shadow-[3px_3px_0px_0px_var(--border-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            title="Disconnect Wallet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      ) : (
        /* Brutalist Connect Wallet Trigger Button */
        <button
          onClick={handleConnect}
          className="brutalist-button-secondary font-syne font-bold py-2.5 px-5 text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  );
}

export default WalletCard;
