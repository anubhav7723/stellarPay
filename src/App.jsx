import WalletCard from "./components/WalletCard";
import BalanceCard from "./components/BalanceCard";
import SendPayment from "./components/SendPayment";
import StatusCard from "./components/StatusCard";

function App() {

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-8">

      <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center">
          ⭐ StellarPay
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Send XLM on Stellar Testnet
        </p>

        <WalletCard />

        <BalanceCard />

        <SendPayment />

        <StatusCard />

      </div>

    </div>
  );

}

export default App;