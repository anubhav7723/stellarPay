import { connectWallet } from "../services/stellar";
import { useWallet } from "../context/WalletContext";

function WalletCard() {

  const { walletAddress, setWalletAddress } = useWallet();

  async function handleConnect() {

    try {

      const address = await connectWallet();

      setWalletAddress(address);

    } catch (err) {

      alert(err.message);

    }

  }

  function handleDisconnect() {

    setWalletAddress("");

  }

  return (

    <div className="mt-8">

      {walletAddress ? (

        <button
          onClick={handleDisconnect}
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg"
        >
          Disconnect Wallet
        </button>

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