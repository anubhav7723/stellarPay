# ⭐ StellarPay — Payment Tracker

A React dApp built on the **Stellar Testnet** that lets users send payments to
multiple addresses through a choice of wallets, while a **Soroban smart
contract** logs every payment and tracks its status (`Pending` →
`Completed` / `Failed`) in real time.

Built for the **Stellar Journey to Mastery** challenge.
- 🟢 White Belt (Level 1): single-wallet XLM payments — see `git tag white-belt`
- 🟡 Yellow Belt (Level 2): multi-wallet, deployed contract, event-driven status tracking — **this submission**

---

## Features (Yellow Belt)

- **Multi-wallet support** via [StellarWalletsKit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) — Freighter, xBull, Albedo, Hana
- **3 handled error types**: wallet not found/installed, user rejected signing, insufficient balance (see `src/services/errors.js`)
- **Soroban smart contract** (`contracts/payment-tracker`) deployed to Testnet, logging payments on-chain
- **Contract read + write** from the frontend (`src/services/contract.js`): `record_payment`, `update_status`, `get_payment`, `get_payment_count`
- **Real-time synchronization**: the payment history table polls the contract every 5s and updates automatically as statuses change
- **Multi-address sending**: add any number of recipient rows and send them in one batch, each tracked independently
- **Transaction status visibility**: per-row status badges (Pending/Completed/Failed) + a global status card with the Stellar Explorer-verifiable tx hash

---

## Tech Stack

- React + Vite + Tailwind CSS
- `@stellar/stellar-sdk` (classic payments + Soroban RPC calls)
- `@creit.tech/stellar-wallets-kit` (multi-wallet)
- Soroban smart contract in Rust (`soroban-sdk`)

---

## Project Structure

```
contracts/
  payment-tracker/        # Soroban smart contract (Rust)
    src/lib.rs
    src/test.rs
src/
  components/
    WalletCard.jsx         # multi-wallet connect/disconnect
    BalanceCard.jsx
    MultiPayment.jsx        # multi-address send form + contract write calls
    PaymentList.jsx          # live on-chain payment history (polls contract)
    StatusCard.jsx
  context/
    WalletContext.jsx
  services/
    walletKit.js            # StellarWalletsKit setup
    stellar.js               # classic XLM payments + balance
    contract.js               # Soroban contract read/write calls
    errors.js                  # 3 required error types + classifier
```

---

## Prerequisites

- Node.js 18+
- One of: [Freighter](https://www.freighter.app/), [xBull](https://xbull.app/), [Albedo](https://albedo.link/), or [Hana](https://hanawallet.io/) wallet extension
- Wallet set to **Testnet** and funded via [Stellar Testnet Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
- Rust + Soroban tooling (only needed if you want to rebuild/redeploy the contract yourself — see below)

---

## Frontend Setup

```bash
git clone https://github.com/your-username/stellarPay.git
cd stellarPay
npm install
cp .env.example .env
```

Open `.env` and set `VITE_CONTRACT_ID` to the deployed contract address
(see below, or use the one already deployed for this submission — listed
in "Deployment Info").

```bash
npm run dev
```

Open the app, click **Connect Wallet**, and pick a wallet from the
StellarWalletsKit modal.

---

## Building & Deploying the Contract (optional — already deployed)

If you want to build and deploy the contract yourself instead of using the
address in "Deployment Info" below:

### 1. Install Rust and the wasm target

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32v1-none
```

### 2. Install the Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

(or `brew install stellar-cli` on macOS)

### 3. Create/fund a deployer identity on Testnet

```bash
stellar keys generate deployer --network testnet --fund
stellar keys address deployer
```

### 4. Build the contract

```bash
stellar contract build
```

This produces `target/wasm32v1-none/release/payment_tracker.wasm`.

### 5. Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/payment_tracker.wasm \
  --source deployer \
  --network testnet
```

This prints the deployed **contract address** (starts with `C...`). Put it
in `.env` as `VITE_CONTRACT_ID`.

### 6. (optional) Try it from the CLI

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- record_payment \
  --sender <deployer-address> \
  --recipient <any-testnet-address> \
  --amount 1000000 \
  --memo "test payment"
```

### 7. Run tests

```bash
cd contracts/payment-tracker
cargo test
```

---

## How Status Tracking Works

1. User fills in one or more recipient/amount rows and clicks **Send All Payments**.
2. For each row, the frontend calls the contract's `record_payment` — this writes a `Pending` record on-chain and emits a `pay_new` event.
3. The frontend submits the actual classic XLM payment operation, signed by whichever wallet was chosen through StellarWalletsKit.
4. Once the classic payment confirms, the frontend calls `update_status` to flip the record to `Completed` (or `Failed`, with the failure reason surfaced via one of the 3 error types).
5. `PaymentList.jsx` independently polls `get_payment_count` / `get_payment` every 5 seconds and re-renders — so the table reflects the current on-chain state even if you refresh the page or another tab records a payment.

---

## Error Handling

`src/services/errors.js` defines and classifies 3 error types surfaced throughout the UI:

| Error | Trigger |
|---|---|
| `WalletNotFoundError` | No compatible wallet extension is installed |
| `UserRejectedError` | User declines the sign request in their wallet |
| `InsufficientBalanceError` | Amount + reserve exceeds available XLM balance (checked proactively before submission, and also caught from Horizon's `op_underfunded`) |

---

## Deployment Info

> Fill these in after you deploy — required for submission.

- **Deployed contract address:** `TODO_PASTE_CONTRACT_ID_HERE`
- **Sample transaction hash (contract call):** `TODO_PASTE_TX_HASH_HERE`
  - Verify at: `https://stellar.expert/explorer/testnet/tx/TODO_PASTE_TX_HASH_HERE`
- **Live demo:** _(optional)_ `TODO_DEPLOY_URL`

---

## Screenshots

### Wallet options (StellarWalletsKit modal)

`TODO: screenshots/wallet-options.png`

### Multi-address payment tracker

`TODO: screenshots/payment-tracker.png`

### Live on-chain payment history

`TODO: screenshots/payment-history.png`

---

## Future Improvements

- Streaming events via `getEvents` instead of polling
- Address book / saved recipients
- CSV import for bulk payment tracking
- Pagination for payment history

---

## Author

**Anubhav**

Built for the **Stellar Journey to Mastery — Yellow Belt** challenge.
