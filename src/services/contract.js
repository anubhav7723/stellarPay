import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  Account,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

import { signWithKit } from "./walletKit";
import { classifyError } from "./errors";

// Set this after `stellar contract deploy` — see README.
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";

const server = new rpc.Server("https://soroban-testnet.stellar.org");

async function submitInvocation(method, args, sourceAddress) {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(sourceAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);

  const signed = await signWithKit(prepared.toXDR(), sourceAddress);
  if (signed.error) {
    throw new Error(signed.error.message || "Signing failed");
  }

  const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET);
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error("Contract call was rejected by the network before submission.");
  }

  let getResponse = await server.getTransaction(sendResponse.hash);
  let attempts = 0;
  while (getResponse.status === "NOT_FOUND" && attempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    getResponse = await server.getTransaction(sendResponse.hash);
    attempts += 1;
  }

  if (getResponse.status !== "SUCCESS") {
    throw new Error("Contract transaction failed to confirm on-chain.");
  }

  return { hash: sendResponse.hash, returnValue: getResponse.returnValue };
}

/** Log a payment intent on-chain (status = Pending). */
export async function recordPayment(sourceAddress, recipient, amountStroops, memo) {
  try {
    const args = [
      new Address(sourceAddress).toScVal(),
      new Address(recipient).toScVal(),
      nativeToScVal(BigInt(amountStroops), { type: "i128" }),
      nativeToScVal(memo, { type: "string" }),
    ];
    const result = await submitInvocation("record_payment", args, sourceAddress);
    return { ...result, paymentId: scValToNative(result.returnValue) };
  } catch (err) {
    throw classifyError(err);
  }
}

/** Flip a payment's status to Completed / Failed once the transfer confirms. */
export async function updateStatus(sourceAddress, id, completed) {
  try {
    const args = [
      nativeToScVal(id, { type: "u32" }),
      nativeToScVal(completed, { type: "bool" }),
    ];
    return await submitInvocation("update_status", args, sourceAddress);
  } catch (err) {
    throw classifyError(err);
  }
}

/** Read-only simulate call, no signature/fee required. */
async function readContract(method, args) {
  const contract = new Contract(CONTRACT_ID);
  // Any syntactically valid account works for a read-only simulation.
  const dummyAccount = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0"
  );
  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  return scValToNative(sim.result.retval);
}

export async function getPaymentCount() {
  return readContract("get_payment_count", []);
}

export async function getPayment(id) {
  return readContract("get_payment", [nativeToScVal(id, { type: "u32" })]);
}

/** Fetch the most recent `limit` payments, newest first. */
export async function getRecentPayments(limit = 10) {
  const count = await getPaymentCount();
  const ids = [];
  for (let i = count; i > 0 && ids.length < limit; i--) {
    ids.push(i);
  }
  const payments = await Promise.all(ids.map((id) => getPayment(id)));
  return payments;
}

/** Poll Soroban RPC for recent contract events (real-time sync helper). */
export async function getRecentEvents(startLedger) {
  const events = await server.getEvents({
    startLedger,
    filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
  });
  return events.events;
}
