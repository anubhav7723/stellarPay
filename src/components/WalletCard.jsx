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
      // Opens the StellarWalletsKit modal: user picks Freighter, xBull,
      // Albedo, Hana, etc.
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

  return (

    <div className="mt-8">

      {walletAddress ? (

        <div>
          <p className="text-center text-sm text-gray-400 mb-2">
            Connected with <span className="text-green-400">{walletName || "wallet"}</span>
          </p>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg"
          >
            Disconnect Wallet
          </button>
        </div>

      ) : (

        <button
          onClick={handleConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg"
        >
          Connect Wallet
        </button>

      )}

    </div>

  );

}

export default WalletCard;
