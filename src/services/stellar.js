import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Transaction,
} from "@stellar/stellar-sdk";

import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export async function connectWallet() {
  const connected = await isConnected();

  if (!connected.isConnected) {
    throw new Error("Freighter Wallet is not installed.");
  }

  await requestAccess();

  const address = await getAddress();

  return address.address;
}

export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);

    const nativeBalance = account.balances.find(
      (asset) => asset.asset_type === "native"
    );

    return nativeBalance.balance;
  } catch (err) {
    console.error(err);
    return "0";
  }
}

export async function sendPayment(destination, amount) {
  try {
    const { address } = await getAddress();

    const sourceAccount = await server.loadAccount(address);

    const transaction = new TransactionBuilder(
      sourceAccount,
      {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      }
    )
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount,
        })
      )
      .setTimeout(30)
      .build();

    const signed = await signTransaction(
      transaction.toXDR(),
      {
        networkPassphrase: Networks.TESTNET,
        address,
      }
    );
    if (signed.error) {
      throw new Error(signed.error.message);
    }

    const signedTx = TransactionBuilder.fromXDR(
      signed.signedTxXdr,
      Networks.TESTNET
    );

    const response = await server.submitTransaction(
      signedTx
    );

    return response;

  } catch (err) {
    throw err;
  }
}