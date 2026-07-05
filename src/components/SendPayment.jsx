import { useState } from "react";
import { sendPayment } from "../services/stellar";
import { useWallet } from "../context/WalletContext";

function SendPayment() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");

    const {
    setTransactionStatus,
    setTransactionHash,
    refreshBalance,
    setRefreshBalance,
    } = useWallet();

    async function handleSend() {

    if (!recipient.trim()) {
        alert("Please enter recipient address.");
        return;
    }
    if (!amount || Number(amount) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    try {

        setTransactionStatus("Sending transaction...");
        setTransactionHash("");

        const response = await sendPayment(
        recipient,
        amount
        );

        setTransactionStatus("✅ Payment Sent Successfully");
        setTransactionHash(response.hash);
        setRefreshBalance(!refreshBalance);

        setRecipient("");
        setAmount("");

    } catch (err) {

        console.error(err);

        setTransactionStatus("❌ Transaction Failed");

        alert(err.message);

    }

    }
    return (

        <div className="mt-8 bg-slate-700 rounded-xl p-5">

        <h2 className="text-lg font-semibold mb-5">
            Send Payment
        </h2>

        <div className="mb-4">

            <label className="block text-sm mb-2">
            Recipient Address
            </label>

            <input
            type="text"
            placeholder="Enter Stellar Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 outline-none focus:border-blue-500"
            />

        </div>

        <div className="mb-5">

            <label className="block text-sm mb-2">
            Amount (XLM)
            </label>

            <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 outline-none focus:border-blue-500"
            />

        </div>

        <button
        onClick={handleSend}
        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium"
        >
        Send XLM
        </button>

        </div>

    );

}

export default SendPayment;