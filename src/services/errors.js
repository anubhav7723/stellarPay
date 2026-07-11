// Custom error types so the UI can branch on `err.name` and show a
// specific, helpful message for each of the 3 required error scenarios.

export class WalletNotFoundError extends Error {
  constructor(message = "No compatible wallet extension was found. Please install Freighter, xBull, or Albedo.") {
    super(message);
    this.name = "WalletNotFoundError";
  }
}

export class UserRejectedError extends Error {
  constructor(message = "The transaction request was rejected in your wallet.") {
    super(message);
    this.name = "UserRejectedError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor(message = "Insufficient XLM balance to cover this payment and the network fee.") {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

/**
 * Inspects a raw error thrown by the wallet / Horizon / Soroban RPC and
 * maps it to one of our 3 known error types when possible, otherwise
 * returns the original error unchanged.
 */
export function classifyError(err) {
  const msg = `${err?.message || err}`.toLowerCase();

  if (
    msg.includes("not installed") ||
    msg.includes("not found") ||
    msg.includes("no wallet") ||
    msg.includes("wallet is not available") ||
    msg.includes("freighter is not installed")
  ) {
    return new WalletNotFoundError();
  }

  if (
    msg.includes("reject") ||
    msg.includes("declined") ||
    msg.includes("user declined") ||
    msg.includes("cancelled") ||
    msg.includes("canceled") ||
    msg.includes("user closed")
  ) {
    return new UserRejectedError();
  }

  if (
    msg.includes("underfunded") ||
    msg.includes("insufficient") ||
    msg.includes("op_underfunded") ||
    msg.includes("balance")
  ) {
    return new InsufficientBalanceError();
  }

  return err;
}
