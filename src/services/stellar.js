import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";

import { kit, openWalletModal, signWithKit } from "./walletKit";
import { classifyError, InsufficientBalanceError } from "./errors";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

// Minimum XLM every account must keep as its base reserve (testnet default).
const MIN_RESERVE = 1;

/**
 * Opens the StellarWalletsKit modal so the user can pick Freighter, xBull,
 * Albedo, Hana, etc. Returns { id, name, address }.
 */
export async function connectWallet() {
  try {
    return await openWalletModal();
  } catch (err) {
    throw classifyError(err);
  }
}

export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (asset) => asset.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (err) {
    console.error(err);
    return "0";
  }
}

/**
 * Sends a single classic XLM payment, signed via the wallet the user
 * selected through StellarWalletsKit.
 */
export async function sendPayment(sourceAddress, destination, amount) {
  try {
    // --- Error type 1 check happens implicitly: if no wallet was ever
    // connected, sourceAddress is empty and callers should guard for it.

    const sourceAccount = await server.loadAccount(sourceAddress);

    const nativeBalance = sourceAccount.balances.find(
      (b) => b.asset_type === "native"
    );
    const available = parseFloat(nativeBalance?.balance || "0") - MIN_RESERVE;

    // --- Error type 2: insufficient balance, checked proactively so the
    // user gets a clear message instead of a cryptic Horizon rejection.
    if (Number(amount) > available) {
      throw new InsufficientBalanceError(
        `You need ${amount} XLM but only ${available.toFixed(2)} XLM is available (after the 1 XLM reserve).`
      );
    }

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: String(amount),
        })
      )
      .setTimeout(30)
      .build();

    // --- Error type 3: the user rejects the signing prompt in their
    // wallet extension. signWithKit / classifyError surfaces this as
    // UserRejectedError.
    const signed = await signWithKit(transaction.toXDR(), sourceAddress);
    if (signed.error) {
      throw new Error(signed.error.message || "Signing failed");
    }

    const signedTx = TransactionBuilder.fromXDR(
      signed.signedTxXdr,
      Networks.TESTNET
    );

    const response = await server.submitTransaction(signedTx);
    return response;
  } catch (err) {
    throw classifyError(err);
  }
}

export { kit };
