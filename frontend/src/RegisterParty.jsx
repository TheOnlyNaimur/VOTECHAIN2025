import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Flag, CheckCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

export function RegisterParty() {
  const { address } = useAccount();
  const [partyData, setPartyData] = useState({ name: "", symbol: "" });
  const [myStatus, setMyStatus] = useState(null); // Track current user's status

  // Check status on mount and when localStorage updates
  useEffect(() => {
    const checkStatus = () => {
      const existing = JSON.parse(
        localStorage.getItem("party_requests") || "[]"
      );
      const myRequest = existing.find((r) => r.userAddress === address);
      setMyStatus(myRequest || null);
    };

    checkStatus();
    window.addEventListener("party_requests_updated", checkStatus);
    return () =>
      window.removeEventListener("party_requests_updated", checkStatus);
  }, [address]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Party form submitted with data:", partyData);

    if (!partyData.name || !partyData.symbol) {
      alert("Please fill all fields");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("party_requests") || "[]");
    const existingEntry = existing.find((r) => r.userAddress === address);

    if (existingEntry && existingEntry.status !== "rejected") {
      alert(
        `Party registration already submitted. Status: ${existingEntry.status}`
      );
      return;
    }

    // Just save to localStorage - NO blockchain call
    // Admin will register on blockchain when approving
    const newRequest = {
      ...partyData,
      userAddress: address,
      status: "pending",
      type: "party",
    };

    const filtered = existing.filter((r) => r.userAddress !== address);
    localStorage.setItem(
      "party_requests",
      JSON.stringify([...filtered, newRequest])
    );
    console.log(
      "✅ Party application saved locally! Admin will register on blockchain.",
      newRequest
    );
    window.dispatchEvent(new Event("party_requests_updated"));
  };

  // Show status if already submitted
  if (myStatus) {
    if (myStatus.status === "pending") {
      return (
        <div className="bg-yellow-50 p-10 rounded-[3rem] border border-yellow-200 text-center">
          <Clock size={64} className="mx-auto text-yellow-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Awaiting Approval
          </h2>
          <p className="text-gray-600 mt-2">
            Your party nomination for <strong>{myStatus.name}</strong> (
            {myStatus.symbol}) is under review.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            The admin will approve your request shortly.
          </p>
        </div>
      );
    }

    if (myStatus.status === "approved") {
      return (
        <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-200 text-center">
          <CheckCircle2 size={64} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Party Approved! 🎉
          </h2>
          <p className="text-gray-600 mt-2">
            <strong>{myStatus.name}</strong> ({myStatus.symbol}) is now
            registered on the blockchain.
          </p>
          <p className="text-emerald-600 font-bold mt-4">
            You can now receive votes in the election!
          </p>
        </div>
      );
    }

    if (myStatus.status === "rejected") {
      return (
        <div className="bg-red-50 p-10 rounded-[3rem] border border-red-200 text-center">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Registration Rejected
          </h2>
          <p className="text-gray-600 mt-2">
            Your party nomination for <strong>{myStatus.name}</strong> was not
            approved.
          </p>
          <button
            onClick={() => {
              // Clear rejected status to allow resubmission
              const existing = JSON.parse(
                localStorage.getItem("party_requests") || "[]"
              );
              const filtered = existing.filter(
                (r) => r.userAddress !== address
              );
              localStorage.setItem("party_requests", JSON.stringify(filtered));
              window.dispatchEvent(new Event("party_requests_updated"));
            }}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700"
          >
            Submit New Application
          </button>
        </div>
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-8 rounded-[2rem] border"
    >
      <h2 className="text-2xl font-black flex items-center gap-3">
        <Flag size={28} /> Register Political Party
      </h2>

      <input
        required
        className="w-full bg-gray-50 border p-4 rounded-2xl"
        placeholder="Party Name"
        value={partyData.name}
        onChange={(e) => setPartyData({ ...partyData, name: e.target.value })}
      />
      <input
        required
        className="w-full bg-gray-50 border p-4 rounded-2xl"
        placeholder="Symbol"
        value={partyData.symbol}
        onChange={(e) => setPartyData({ ...partyData, symbol: e.target.value })}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all"
      >
        <CheckCircle size={20} />
        Submit for Nomination
      </button>
    </form>
  );
}
