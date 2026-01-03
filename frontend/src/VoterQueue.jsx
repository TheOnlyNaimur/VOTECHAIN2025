import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { USER_REGISTRY_ADDRESS } from "./constants";
import UserRegistryABI from "./abis/UserRegistry.json";
import { Check, X, User, Fingerprint, Loader2 } from "lucide-react";

export function VoterQueue() {
  const [requests, setRequests] = useState([]);
  const [pendingApproval, setPendingApproval] = useState(null); // Track which voter is being approved

  // Initialize the blockchain write hook
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Load from local database on start and listen for updates
  useEffect(() => {
    const loadData = () => {
      const data = JSON.parse(localStorage.getItem("voter_requests") || "[]");
      console.log("VoterQueue loaded:", data); // DEBUG
      setRequests(data);
    };

    loadData();

    // Listen for custom events from RegisterVoter component
    const handleCustomEvent = () => {
      console.log("Custom event fired: voter_requests_updated"); // DEBUG
      loadData();
    };
    window.addEventListener("voter_requests_updated", handleCustomEvent);

    // Also listen for storage changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === "voter_requests" || e.key === null) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("voter_requests_updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle blockchain confirmation - ONLY update status when blockchain confirms
  useEffect(() => {
    if (isConfirmed && pendingApproval) {
      console.log(
        "✅ Blockchain confirmed! Updating status for:",
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
      localStorage.setItem("voter_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("voter_requests_updated"));
      setPendingApproval(null);
    }
  }, [isConfirmed, pendingApproval, requests]);

  const handleAction = (voterAddr, action) => {
    if (action === "approve") {
      // Get the voter's full data from stored request
      const voter = requests.find((r) => r.userAddress === voterAddr);

      if (voter) {
        // Track this approval
        setPendingApproval({ address: voterAddr, newStatus: "approved" });
        // Register voter on blockchain with their info
        writeContract({
          address: USER_REGISTRY_ADDRESS,
          abi: UserRegistryABI.abi,
          functionName: "registerAsVoter",
          args: [voterAddr, voter.name, voter.email, voter.phone, voter.nid], // Pass user address first
        });
      }
    } else if (action === "reject") {
      // Rejection is local only, no blockchain involved
      const updated = requests.map((req) => {
        if (req.userAddress === voterAddr) {
          return { ...req, status: "rejected" };
        }
        return req;
      });
      setRequests(updated);
      localStorage.setItem("voter_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("voter_requests_updated"));
    }
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="mt-12 w-full animate-in fade-in duration-700">
      <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
        <Fingerprint className="text-purple-600" /> Pending Approval Queue (
        {pending.length})
      </h3>

      {pending.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-16 text-center text-gray-400 font-bold">
          Inbox is clear.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((req, i) => (
            <div
              key={i}
              className="bg-white border p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <User className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-gray-900">
                      {req.name}
                    </h4>
                    <p className="text-[10px] font-mono text-purple-600">
                      {req.userAddress}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => handleAction(req.userAddress, "reject")}
                    className="p-3 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => handleAction(req.userAddress, "approve")}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
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
              <div className="grid grid-cols-3 gap-4 border-t pt-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    NID
                  </p>
                  <p className="font-bold text-gray-700">{req.nid}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Phone
                  </p>
                  <p className="font-bold text-gray-700">{req.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Email
                  </p>
                  <p className="font-bold text-gray-700">{req.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
