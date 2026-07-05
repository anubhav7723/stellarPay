import { useWallet } from "../context/WalletContext";

function StatusCard() {

  const {
    transactionStatus,
    transactionHash,
  } = useWallet();

  return (

    <div className="mt-8 bg-slate-700 rounded-xl p-5">

      <h2 className="text-lg font-semibold">
        Transaction Status
      </h2>

      {!transactionStatus && (

        <p className="mt-3 text-gray-300">
          Waiting for transaction...
        </p>

      )}

      {transactionStatus && (

        <>
          <p className="mt-3">
            {transactionStatus}
          </p>

          {transactionHash && (

            <div className="mt-4">

              <p className="font-semibold">
                Transaction Hash
              </p>

              <p className="text-sm break-all">
                {transactionHash}
              </p>

            </div>

          )}

        </>

      )}

    </div>

  );

}

export default StatusCard;