import { useState } from "react";
import { useAccount } from "wagmi";
import { Flag, CheckCircle } from "lucide-react";

export function RegisterParty() {
  const { address } = useAccount();

  const [partyData, setPartyData] = useState({ name: "", symbol: "" });

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
