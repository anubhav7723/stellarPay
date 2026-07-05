import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getBalance } from "../services/stellar";

function BalanceCard() {

  const { walletAddress, refreshBalance, } = useWallet();
  
  const [balance, setBalance] = useState("0");

  useEffect(() => {

    async function fetchBalance() {

      if (!walletAddress) {
        setBalance("0");
        return;
      }

      const bal = await getBalance(walletAddress);

      setBalance(bal);

    }

    fetchBalance();

  }, [walletAddress, refreshBalance]);

  return (

    <div className="mt-8 bg-slate-700 rounded-xl p-5">

      <h2 className="text-xl font-semibold">
        Wallet
      </h2>

      <p className="text-gray-300 mt-3">
        Address
      </p>

      <p className="break-all text-sm">
        {walletAddress || "Not Connected"}
      </p>

      <p className="text-gray-300 mt-5">
        Balance
      </p>

      <h2 className="text-3xl font-bold text-green-400">
        {balance} XLM
      </h2>

    </div>

  );

}

export default BalanceCard;