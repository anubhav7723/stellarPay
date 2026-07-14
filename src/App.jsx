import { useState, useEffect } from "react";
import WalletCard from "./components/WalletCard";
import BalanceCard from "./components/BalanceCard";
import MultiPayment from "./components/MultiPayment";
import PaymentList from "./components/PaymentList";
import StatusCard from "./components/StatusCard";
import AddressBook from "./components/AddressBook";
import { CONTRACT_ID } from "./services/contract";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [activeTab, setActiveTab] = useState("send"); // "send" | "history" | "wallet" | "addressbook"
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCopyContractId = () => {
    if (!CONTRACT_ID) return;
    navigator.clipboard.writeText(CONTRACT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden">
      
      {/* Background Cyber-Aurora Blobs for organic visual depth */}
      <div className="absolute top-[8%] -left-[12%] w-[340px] h-[340px] bg-gradient-to-tr from-orange-400 to-violet-600 rounded-full aurora-blob animate-float-1 pointer-events-none"></div>
      <div className="absolute bottom-[15%] -right-[12%] w-[380px] h-[380px] bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full aurora-blob animate-float-2 pointer-events-none"></div>
      
      {/* Header Area (Neo-Brutalist Outlines) */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b-2.5 border-[var(--border-color)] z-10">
        <div className="flex items-center gap-3.5">
          {/* Logo representation */}
          <div className="p-3 border-2.5 border-[var(--border-color)] bg-[var(--accent-color)] shadow-[3px_3px_0px_0px_var(--border-color)] text-[#1a1a1a]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tighter">
              StellarPay
            </h1>
            <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-secondary)] font-mono flex items-center gap-1.5 mt-1">
              <span>Stellar Soroban</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]"></span>
              <span>Testnet</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Brutalist Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 bg-[var(--bg-card)] border-2.5 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--border-color)] text-[var(--text-primary)] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_var(--border-color)]"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 11-7.07 7.07 5 5 0 017.07-7.07z" />
              </svg>
            )}
          </button>

          {/* Wallet Component in Header */}
          <WalletCard />
        </div>
      </header>

      {/* Tabs Navigation (Outlined pills with solid offset highlight) */}
      <nav className="w-full max-w-4xl mb-8 z-10 overflow-x-auto whitespace-nowrap">
        <div className="flex bg-[var(--bg-tab-bar)] p-1.5 border-2.5 border-[var(--border-color)] rounded-xl w-fit shadow-[4px_4px_0px_0px_var(--border-color)]">
          <button
            onClick={() => setActiveTab("send")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "send"
                ? "bg-[var(--accent-color)] text-[#1a1a1a] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-card)]/40"
            }`}
          >
            Send Payment
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-[var(--accent-color)] text-[#1a1a1a] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-card)]/40"
            }`}
          >
            Ledger History
          </button>
          <button
            onClick={() => setActiveTab("addressbook")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "addressbook"
                ? "bg-[var(--accent-color)] text-[#1a1a1a] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-card)]/40"
            }`}
          >
            Address Book
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-[var(--accent-color)] text-[#1a1a1a] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-card)]/40"
            }`}
          >
            Wallet Context
          </button>
        </div>
      </nav>

      {/* Main Container Card (Solid Brutalist Outline & Offset Shadow) */}
      <main className="w-full max-w-4xl brutalist-card rounded-2xl p-6 md:p-8 mb-8 z-10">
        {activeTab === "send" && (
          <div>
            <div className="mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Send New Payment</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Lock and broadcast tokens on the Soroban smart contract payment router.
              </p>
            </div>
            <MultiPayment />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <div className="mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
              <h2 className="text-2xl font-bold uppercase tracking-tight">On-Chain Ledger</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Real-time transactions audited by the Soroban network.
              </p>
            </div>
            <PaymentList />
          </div>
        )}

        {activeTab === "addressbook" && (
          <div>
            <div className="mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Address Book</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Save contact aliases for Stellar public keys to make batch sending and transaction history human-readable.
              </p>
            </div>
            <AddressBook />
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Wallet details</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Manage your connection, view active balance, and track execution transactions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BalanceCard />
              <StatusCard />
            </div>
          </div>
        )}
      </main>

      {/* Footer / Contract ID Display (Floating Brutalist pill) */}
      <footer className="w-full max-w-4xl text-center mt-auto py-6 border-t-2.5 border-[var(--border-color)] z-10">
        {CONTRACT_ID ? (
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-card)] border-2.5 border-[var(--border-color)] shadow-[4px_4px_0px_0px_var(--border-color)] transition-all">
            <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-wider">
              Contract ID:
            </span>
            <span className="font-mono text-xs text-[var(--text-primary)] break-all select-all font-bold">
              {CONTRACT_ID}
            </span>
            <button
              onClick={handleCopyContractId}
              className="mt-1 sm:mt-0 p-1.5 border-1.5 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              title="Copy Contract ID"
            >
              {copied ? (
                <span className="text-[10px] text-emerald-500 font-extrabold px-1">Copied!</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <p className="text-xs font-mono font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-4 py-2 rounded-xl inline-block shadow-[3px_3px_0px_0px_var(--border-color)]">
            Contract ID not configured. Please define VITE_CONTRACT_ID in your .env file.
          </p>
        )}
      </footer>

    </div>
  );
}

export default App;
