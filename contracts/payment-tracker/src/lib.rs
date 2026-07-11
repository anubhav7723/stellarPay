#![no_std]

//! Payment Tracker contract
//!
//! Logs multi-address payments made on the Stellar network, tracks their
//! status (Pending -> Completed / Failed), and emits events so a frontend
//! can subscribe and update in real time.
//!
//! Flow used by the frontend:
//! 1. `record_payment` is called right before / after a classic XLM payment
//!    is submitted, storing the intent with status = Pending and emitting
//!    a `pay_new` event.
//! 2. Once the classic payment is confirmed on the ledger, `update_status`
//!    is called to flip the record to Completed (or Failed), emitting a
//!    `pay_upd` event.
//! 3. `get_payment` / `get_payment_count` let the frontend read state back
//!    to render a live table.

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaymentStatus {
    Pending,
    Completed,
    Failed,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub id: u32,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub memo: String,
    pub status: PaymentStatus,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Count,
    Payment(u32),
}

const PAYMENT_NEW: Symbol = symbol_short!("pay_new");
const PAYMENT_UPD: Symbol = symbol_short!("pay_upd");

#[contract]
pub struct PaymentTracker;

#[contractimpl]
impl PaymentTracker {
    /// Record a new tracked payment. Must be signed/authorized by `sender`.
    /// Returns the new payment's id.
    pub fn record_payment(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        memo: String,
    ) -> u32 {
        sender.require_auth();

        let mut count: u32 = env.storage().instance().get(&DataKey::Count).unwrap_or(0);
        count += 1;

        let payment = Payment {
            id: count,
            sender: sender.clone(),
            recipient,
            amount,
            memo,
            status: PaymentStatus::Pending,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Payment(count), &payment);
        env.storage().instance().set(&DataKey::Count, &count);

        env.events().publish((PAYMENT_NEW, sender), count);

        count
    }

    /// Flip a payment's status once the underlying classic transfer is
    /// confirmed (or has failed). Must be signed/authorized by the original
    /// sender.
    pub fn update_status(env: Env, id: u32, completed: bool) {
        let mut payment: Payment = env
            .storage()
            .persistent()
            .get(&DataKey::Payment(id))
            .expect("payment not found");

        payment.sender.require_auth();

        payment.status = if completed {
            PaymentStatus::Completed
        } else {
            PaymentStatus::Failed
        };

        env.storage().persistent().set(&DataKey::Payment(id), &payment);
        env.events().publish((PAYMENT_UPD, payment.sender.clone()), id);
    }

    /// Read a single payment record.
    pub fn get_payment(env: Env, id: u32) -> Payment {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(id))
            .expect("payment not found")
    }

    /// Total number of payments recorded so far.
    pub fn get_payment_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }
}

mod test;
