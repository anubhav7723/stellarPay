import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export function WalletProvider({ children }) {

  const [walletAddress, setWalletAddress] = useState("");

  const [transactionStatus, setTransactionStatus] = useState("");

  const [transactionHash, setTransactionHash] = useState("");

  const [refreshBalance, setRefreshBalance] = useState(false);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,

        transactionStatus,
        setTransactionStatus,

        transactionHash,
        setTransactionHash,

        refreshBalance,
        setRefreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}