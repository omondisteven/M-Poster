// src/QrResultsPage.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiOutlineCreditCard } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/QrResultsPage")({
  component: QrResultsPage,
});

function QrResultsPage(){
  const router = useRouter();
  const [transactionType, setTransactionType] = useState("");
  const [data, setData] = useState<any>({});
  const [phoneNumber, setPhoneNumber] = useState("254");
  const [amount, setAmount] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // In QrResultsPage.tsx
    useEffect(() => {
      const fetchData = async () => {
        if (router.query.data) {
          try {
            // Handle case where the URL might be a TinyURL that redirects to our page
            const queryData = router.query.data as string;
            
            // If it's a full URL (from TinyURL), extract the data parameter
            if (queryData.startsWith('http')) {
              const url = new URL(queryData);
              const dataParam = url.searchParams.get('data');
              if (dataParam) {
                const parsedData = JSON.parse(decodeURIComponent(dataParam));
                setTransactionType(parsedData.TransactionType);
                setData(parsedData);
                setAmount(parsedData.Amount || "");
                setPhoneNumber(parsedData.PhoneNumber || "254");
              }
            } else {
              // Regular direct access
              const parsedData = JSON.parse(decodeURIComponent(queryData));
              setTransactionType(parsedData.TransactionType);
              setData(parsedData);
              setAmount(parsedData.Amount || "");
              setPhoneNumber(parsedData.PhoneNumber || "254");
            }
          } catch (e) {
            console.error("Error parsing QR data:", e);
          }
        }
      };

      fetchData();
    }, [router.query]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (!value.startsWith("254")) {
      value = "254";
      setWarning("Phone number must start with '254'.");
    } else {
      setWarning(null);
    }

    if (value.length > 3 && /^0/.test(value.slice(3))) {
      setError("The digit after '254' cannot be zero.");
    } else {
      setError(null);
    }

    setPhoneNumber(value);
  };

  const handlePhoneNumberBlur = () => {
    if (phoneNumber.length !== 12) {
      setError("Phone number must be exactly 12 digits.");
    } else {
      setError(null);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePayBill = async () => {
    if (!phoneNumber.trim() || !data.PaybillNumber?.trim() || !data.AccountNumber?.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please fill in all the fields.");
      return;
    }

    try {
      const response = await fetch("/https://e-biz-mpesa-payment-app.vercel.app/stk_api/paybill_stk_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          amount: amount.toString(),
          accountnumber: data.AccountNumber.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Payment initiated successfully! Please enter your M-pesa PIN on your phone when prompted shortly");
      } else {
        toast.error(result?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Network error: Unable to initiate payment.");
    }
  };

  const handlePayTill = async () => {
    if (!phoneNumber.trim() || !data.TillNumber?.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please fill in all the fields.");
      return;
    }

    try {
      const response = await fetch("https://e-biz-mpesa-payment-app.vercel.app/stk_api/till_stk_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          amount: amount.toString(),
          accountnumber: data.TillNumber.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Payment initiated successfully! Please enter your M-pesa PIN on your phone when prompted shortly");
      } else {
        toast.error(result?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Network error: Unable to initiate payment.");
    }
  };

  const handleSendMoney = async () => {
    if (!phoneNumber.trim() || !data.RecepientPhoneNumber?.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please fill in all the fields.");
      return;
    }

    try {
      const response = await fetch("https://e-biz-mpesa-payment-app.vercel.app/stk_api/sendmoney_stk_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          amount: amount.toString(),
          recepientPhoneNumber: data.RecepientPhoneNumber.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Payment initiated successfully! Please enter your M-pesa PIN on your phone when prompted shortly");
      } else {
        toast.error(result?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Network error: Unable to initiate payment.");
    }
  };

  const handleWithdraw = async () => {
    if (!phoneNumber.trim() || !data.AgentId?.trim() || !data.StoreNumber?.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please fill in all the fields.");
      return;
    }

    try {
      const response = await fetch("https://e-biz-mpesa-payment-app.vercel.app/stk_api/agent_stk_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          amount: amount.toString(),
          accountnumber: data.StoreNumber.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Payment initiated successfully! Please enter your M-pesa PIN on your phone when prompted shortly");
      } else {
        toast.error(result?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Network error: Unable to initiate payment.");
    }
  };

  return (
    <div className="flex flex-col bg-gray-100">
      <h2 className="text-2xl font-bold text-center mb-4">
        {transactionType === 'Contact' ? 
          "E-BUSINESS CARD SCAN DETAILS" : 
          "M-PESA TRANSACTION SCAN DETAILS"}
      </h2>

      <div className="w-full border-t-2 border-gray-300 my-4"></div>

      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
        <p className="text-xl text-center">
          You are about to perform a <strong>{transactionType}</strong> transaction. Please confirm or cancel.
        </p>

        <br />
        {transactionType === "PayBill" && (
          <>
            <p>Paybill Number: {data.PaybillNumber}</p>
            <p>Account Number: {data.AccountNumber}</p>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              type="number"
            />
          </>
        )}

        {transactionType === "BuyGoods" && (
          <>
            <p>Till Number: {data.TillNumber}</p>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              type="number"
            />
          </>
        )}

        {transactionType === "SendMoney" && (
          <>
            <p>Recipient Phone Number: {data.RecepientPhoneNumber}</p>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              type="number"
            />
          </>
        )}

        {transactionType === "WithdrawMoney" && (
          <>
            <p>Agent ID: {data.AgentId}</p>
            <p>Store Number: {data.StoreNumber}</p>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              type="number"
            />
          </>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium">Payers Phone Number</label>
          <Input
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={handlePhoneNumberBlur}
            placeholder="Enter Phone Number"
          />
          {warning && <p className="text-yellow-600">{warning}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <br />

          <div className="flex justify-between items-center mt-4 space-x-4">
            <div>
              {transactionType === "PayBill" && (
                <Button
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-all"
                  onClick={handlePayBill}
                  disabled={!!error || !!warning || phoneNumber.length !== 12 || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                >
                  <HiOutlineCreditCard className="text-xl" />
                  <span>Pay Now</span>
                </Button>
              )}

              {transactionType === "BuyGoods" && (
                <Button
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-all"
                  onClick={handlePayTill}
                  disabled={!!error || !!warning || phoneNumber.length !== 12 || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                >
                  <HiOutlineCreditCard className="text-xl" />
                  <span>Pay Now</span>
                </Button>
              )}

              {transactionType === "SendMoney" && (
                <Button
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-all"
                  onClick={handleSendMoney}
                  disabled={!!error || !!warning || phoneNumber.length !== 12 || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                >
                  <HiOutlineCreditCard className="text-xl" />
                  <span>Send Now</span>
                </Button>
              )}

              {transactionType === "WithdrawMoney" && (
                <Button
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-all"
                  onClick={handleWithdraw}
                  disabled={!!error || !!warning || phoneNumber.length !== 12 || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
                >
                  <HiOutlineCreditCard className="text-xl" />
                  <span>Withdraw Now</span>
                </Button>
              )}
            </div>

            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              onClick={() => router.push("/")}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrResultsPage;