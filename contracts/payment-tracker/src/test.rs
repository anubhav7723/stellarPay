#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Env;

#[test]
fn test_record_and_read_payment() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PaymentTracker, ());
    let client = PaymentTrackerClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "invoice #1");

    let id = client.record_payment(&sender, &recipient, &1_000_0000i128, &memo);
    assert_eq!(id, 1);
    assert_eq!(client.get_payment_count(), 1);

    let payment = client.get_payment(&id);
    assert_eq!(payment.sender, sender);
    assert_eq!(payment.recipient, recipient);
    assert_eq!(payment.amount, 1_000_0000i128);
    assert_eq!(payment.status, PaymentStatus::Pending);
}

#[test]
fn test_update_status() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PaymentTracker, ());
    let client = PaymentTrackerClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "invoice #2");

    let id = client.record_payment(&sender, &recipient, &500_0000i128, &memo);
    client.update_status(&id, &true);

    let payment = client.get_payment(&id);
    assert_eq!(payment.status, PaymentStatus::Completed);
}

#[test]
fn test_multiple_payments_increment_id() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PaymentTracker, ());
    let client = PaymentTrackerClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let r1 = Address::generate(&env);
    let r2 = Address::generate(&env);
    let memo = String::from_str(&env, "batch");

    let id1 = client.record_payment(&sender, &r1, &100i128, &memo);
    let id2 = client.record_payment(&sender, &r2, &200i128, &memo);

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_payment_count(), 2);
}

#[test]
fn test_send_payment_via_sac() {
    let env = Env::default();
    env.mock_all_auths();

    // Register our contract
    let contract_id = env.register(PaymentTracker, ());
    let client = PaymentTrackerClient::new(&env, &contract_id);

    // Register a mock Stellar Asset Contract (SAC)
    let admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    let token_admin = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Mint mock tokens to sender
    let amount = 1000_i128;
    token_admin.mint(&sender, &amount);
    assert_eq!(token_client.balance(&sender), 1000);
    assert_eq!(token_client.balance(&recipient), 0);

    // Call send_payment to perform the transfer on-chain via the tracker contract
    let memo = String::from_str(&env, "SAC test payment");
    let id = client.send_payment(&token_address, &sender, &recipient, &amount, &memo);

    // Assert payment tracker counts and states
    assert_eq!(id, 1);
    assert_eq!(client.get_payment_count(), 1);

    let payment = client.get_payment(&id);
    assert_eq!(payment.sender, sender);
    assert_eq!(payment.recipient, recipient);
    assert_eq!(payment.amount, amount);
    assert_eq!(payment.status, PaymentStatus::Completed);

    // Assert token balances changed
    assert_eq!(token_client.balance(&sender), 0);
    assert_eq!(token_client.balance(&recipient), 1000);
}

