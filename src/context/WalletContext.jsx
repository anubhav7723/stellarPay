import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export function WalletProvider({ children }) {

  const [walletAddress, setWalletAddress] = useState("");
  const [walletName, setWalletName] = useState("");

  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const [refreshBalance, setRefreshBalance] = useState(false);

  // Last classified error (WalletNotFoundError / UserRejectedError /
  // InsufficientBalanceError / generic) so any component can surface it.
  const [lastError, setLastError] = useState(null);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,

        walletName,
        setWalletName,

        transactionStatus,
        setTransactionStatus,

        transactionHash,
        setTransactionHash,

        refreshBalance,
        setRefreshBalance,

        lastError,
        setLastError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
