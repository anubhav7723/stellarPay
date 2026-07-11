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
