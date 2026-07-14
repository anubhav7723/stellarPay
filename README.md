# ⭐ StellarPay — Neo-Brutalist Cyberpunk dApp

A production-ready React dApp built on the **Stellar Testnet** using the **Neo-Brutalist Cyberpunk** design language. StellarPay allows users to batch-transfer XLM and custom token assets, route payments on-chain via inter-contract calls to the Stellar Asset Contract (SAC), manage a local address book, and inspect live blockchain logs.

---

##  Features of StellarPay

In addition to core multi-wallet integrations and audit logging, StellarPay implements production-ready architecture:

1. **Advanced Smart Contract Routing (Inter-Contract SAC Calls)**:
   - Supports routing payments directly through the `send_payment` contract function.
   - The contract uses inter-contract communication, instantiating `soroban_sdk::token::Client` to invoke `transfer` on a specified token contract (e.g., Native XLM or custom SAC tokens) directly on-chain.
2. **Stellar Asset Trustline Scanner**:
   - Automatically queries the Horizon RPC for the user's active trustlines.
   - Displays a dynamic token asset list (XLM, USDC, EURC, etc.) and their balances.
   - Lets users choose which token they wish to send via a dropdown in the payment form, dynamically resolving the contract address.
3. **Local Address Book (Contacts Manager)**:
   - A built-in local contact book that persists aliases (e.g. `"Alice's Wallet"`) to `localStorage`.
   - Autocompletes recipient address input fields with a click.
   - Automatically resolves public keys to names (e.g. `"Alice"`) in the transaction history ledger.
4. **TACTILE UI (Neo-Brutalist Cyberpunk Style)**:
   - Headings styled with **Unbounded**, body text with **Space Grotesk**, and technical keys with **JetBrains Mono**.
   - Solid blocky shadows (`box-shadow: 4px 4px 0px #1a1a1a`), physical border lines (`border-2.5`), and active button states that simulate a mechanical click depression.
5. **CI/CD Pipeline Configuration**:
   - Continuous Integration workflow configured in `.github/workflows/ci.yml` that builds and runs Rust contract unit tests (`cargo test`) and compiles the React application (`npm run build`) on every commit.

---

##  Tech Stack

- React + Vite + Tailwind CSS (Vanilla CSS bindings in `src/index.css`)
- `@stellar/stellar-sdk` (Classic Horizon + Soroban RPC execution)
- `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo, Hana)
- Rust Smart Contract (`soroban-sdk` v22.0.0)

---

##  Project Structure

```
.github/
  workflows/
    ci.yml                # GitHub Actions CI/CD Pipeline
contracts/
  payment-tracker/        # Soroban smart contract (Rust)
    src/lib.rs            # contains record_payment and send_payment (SAC inter-contract)
    src/test.rs           # contains 4 unit tests (including mock SAC tests)
src/
  components/
    WalletCard.jsx        # Compact wallet connector header
    BalanceCard.jsx       # Multi-token trustline scanner portfolio
    MultiPayment.jsx      # Batch send form (supports direct routing & autocomplete)
    PaymentList.jsx       # Live transaction history ledger (resolves contact names)
    AddressBook.jsx       # Add/edit/delete local contact book
    StatusCard.jsx        # Network monitor alerts
  services/
    stellar.js            # Horizon ledger queries + getBalances trustline fetches
    contract.js           # contract writes: recordPayment, updateStatus, sendPaymentDirect
```

---

## ⚙️ Prerequisites

- Node.js 20+
- Rust toolchain (`stable` channel, target `wasm32-unknown-unknown`)
- A Stellar wallet (e.g. [Freighter](https://www.freighter.app/)) set to **Testnet** and funded via [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test).

---

## Setup & Run

### 1. Clone & Install
```bash
git clone https://github.com/your-username/stellarPay.git
cd stellarPay
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_CONTRACT_ID=CBFG55XRLD2V4UMPUL2HOLPVCFHZQ7QOQSUCRCHY5ACHE6OO775IBTPH
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Testing the Smart Contract

The contract includes **4 automated unit tests** (with zero warnings) verifying:
1. Basic on-chain audit recording (`record_payment`).
2. Status updating from pending to completed (`update_status`).
3. Payment ID increments.
4. **Inter-contract token transfer** simulation using a mock Stellar Asset Contract (SAC) in the test environment.

Run the tests:
```bash
cd contracts/payment-tracker
cargo test
```

---

## Building & Deploying the Smart Contract

To rebuild and redeploy the contract to Testnet:

1. **Build the WASM binary**:
   ```bash
   stellar contract build
   ```
2. **Deploy WASM to Testnet**:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32/release/payment_tracker.wasm \
     --source deployer \
     --network testnet
   ```
3. Copy the contract address printed in the output and update `VITE_CONTRACT_ID` in your `.env`.

---

##  Error Handling Matrix

We proactively check and classify three core Web3 failure modes:

| Error Type | Visual Indicator | Cause |
|---|---|---|
| `WalletNotFoundError` | Outlined alert box | No compatible extension active in the browser |
| `UserRejectedError` | Outline warning block | User rejected the signing request in Freighter/xBull |
| `InsufficientBalanceError` | Monospace error highlight | Proactive balance checks or Horizon's `op_underfunded` status |

---

## Submission Links & Deployment Details

- **Live Demo Link**: [Deploy on Vercel / Netlify](https://your-live-demo-link.vercel.app) *(Replace with your live URL)*
- **Demo Video Link**: [Watch the 1-2 minute Demo Video](https://your-youtube-or-loom-link.com) *(Replace with your demo video URL)*
- **Contract Deployment Address**: `CBFG55XRLD2V4UMPUL2HOLPVCFHZQ7QOQSUCRCHY5ACHE6OO775IBTPH`
- **Transaction Hash**: `de3727add3e4789ccd7713cc1af3e1d5135f91e906cc955c3c6aaabfac264c16`
- **Verification Link**: [View on Stellar.expert Testnet Explorer](https://stellar.expert/explorer/testnet/tx/de3727add3e4789ccd7713cc1af3e1d5135f91e906cc955c3c6aaabfac264c16)

---

## Verification & Presentation Screenshots

*(Add your verification screenshots below. Remember to push these image files to your repository's `/screenshots` folder!)*

### 1. Mobile Responsive UI Layout
![Mobile Responsive UI Layout](/screenshots/mobile-responsive-ui.png)

### 2. CI/CD Pipeline Running Successfully in GitHub Actions
![CI/CD Pipeline Running Successfully](/screenshots/cicd-pipeline.png)

### 3. Contract Tests Passing (4 Passed)
![Contract Tests Passing](/screenshots/contract-tests.png)

### 4. Frontend Unit Tests Passing (3 Passed)
![Frontend Tests Passing](/screenshots/frontend-tests.png)

---

## 🧑‍💻 Author

- **Author**: Anubhav

