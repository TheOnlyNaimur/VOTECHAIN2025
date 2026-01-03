import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { PARTY_REGISTRY_ADDRESS } from "./constants";
import PartyRegistryABI from "./abis/PartyRegistry.json";
import { Flag, Check, X, Loader2 } from "lucide-react";

export function PartyQueue() {
  const [requests, setRequests] = useState([]);
  const [pendingApproval, setPendingApproval] = useState(null); // Track which party is being approved
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const loadData = () => {
      const data = JSON.parse(localStorage.getItem("party_requests") || "[]");
      setRequests(data);
    };

    loadData();

    // Listen for custom events from RegisterParty component
    const handleCustomEvent = () => loadData();
    window.addEventListener("party_requests_updated", handleCustomEvent);

    // Also listen for storage changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === "party_requests" || e.key === null) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("party_requests_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle blockchain confirmation - ONLY update status when blockchain confirms
  useEffect(() => {
    if (isConfirmed && pendingApproval) {
      console.log(
        "✅ Blockchain confirmed! Updating status for party:",
        pendingApproval.address
      );
      // Only NOW update status to approved
      const updated = requests.map((req) => {
        if (req.userAddress === pendingApproval.address) {
          return { ...req, status: pendingApproval.newStatus };
        }
        return req;
      });
      setRequests(updated);
      localStorage.setItem("party_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("party_requests_updated"));
      setPendingApproval(null);
    }
  }, [isConfirmed, pendingApproval, requests]);

  const handleAction = (party, action) => {
    if (action === "approve") {
      // Track this approval
      setPendingApproval({ address: party.userAddress, newStatus: "approved" });
      // Register party on blockchain with their info
      writeContract({
        address: PARTY_REGISTRY_ADDRESS,
        abi: PartyRegistryABI.abi,
        functionName: "registerAsParty",
        args: [party.userAddress, party.name, party.symbol], // Pass party address first, then name and regNumber
      });
    } else if (action === "reject") {
      // Rejection is local only, no blockchain involved
      const updated = requests.map((r) =>
        r.userAddress === party.userAddress ? { ...r, status: "rejected" } : r
      );
      setRequests(updated);
      localStorage.setItem("party_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("party_requests_updated"));
    }
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
        <Flag className="text-blue-600" size={24} /> Party Nominations (
        {pending.length})
      </h3>

      <div className="space-y-4">
        {pending.map((p, i) => (
          <div
            key={i}
            className="bg-white border p-6 rounded-[2rem] shadow-sm flex justify-between items-center"
          >
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{p.name}</h4>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                {p.symbol}
              </p>
              <p className="text-[10px] font-mono text-gray-400 mt-1">
                {p.userAddress}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={() => handleAction(p, "reject")}
                className="p-3 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
              >
                <X />
              </button>
              <button
                disabled={isPending}
                onClick={() => handleAction(p, "approve")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
                {isPending ? "Confirming..." : "Approve"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
