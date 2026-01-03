import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { USER_REGISTRY_ADDRESS } from "./constants";
import UserRegistryABI from "./abis/UserRegistry.json";
import {
  ShieldCheck,
  Loader2,
  Search,
  CheckCircle2,
  LayoutGrid,
  Users,
  Flag,
  Trophy,
} from "lucide-react";

// Components
import { VoterQueue } from "./VoterQueue";
import { PartyQueue } from "./PartyQueue";
import { Results } from "./Results";

export function AdminPanel() {
  const [voterAddress, setVoterAddress] = useState("");
  const [activeTab, setActiveTab] = useState("voters"); // State to switch views

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleApprove = (e) => {
    e.preventDefault();
    writeContract({
      address: USER_REGISTRY_ADDRESS,
      abi: UserRegistryABI.abi,
      functionName: "approveUser",
      args: [voterAddress],
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-24">
      {/* Page Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">
            Authority Portal
          </h2>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={16} /> National Election Commission
          </div>
        </div>
        <div className="bg-gray-100 p-2 rounded-xl text-gray-400">
          <LayoutGrid size={20} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 bg-gray-50 p-2 rounded-[2rem] border border-gray-100">
        <button
          onClick={() => setActiveTab("voters")}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === "voters"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Users size={20} /> Voter Approval
        </button>
        <button
          onClick={() => setActiveTab("parties")}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === "parties"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Flag size={20} /> Party Nominations
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold transition-all ${
            activeTab === "results"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Trophy size={20} /> Results
        </button>
      </div>

      {/* Manual Search (Visible on Voters tab) */}
      {activeTab === "voters" && (
        <div className="bg-white border border-gray-100 p-10 rounded-[3rem] shadow-xl shadow-gray-200/40 mb-12">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">
            Manual Voter Override
          </h3>
          <form onSubmit={handleApprove} className="space-y-6">
            <div className="relative group">
              <Search
                className="absolute left-6 top-5 text-gray-300 group-focus-within:text-purple-500 transition-colors"
                size={20}
              />
              <input
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white transition-all text-gray-900 font-mono text-sm placeholder-gray-300"
                placeholder="Paste wallet address (0x...) to approve manually"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || isConfirming || !voterAddress}
              className="w-full bg-gray-900 hover:bg-purple-600 disabled:bg-gray-200 text-white font-bold py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
            >
              {isPending || isConfirming ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 size={20} />
              )}
              {isPending
                ? "Processing..."
                : isConfirming
                ? "Confirming..."
                : "Approve Address"}
            </button>
          </form>
          {isConfirmed && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Transaction Confirmed!
            </div>
          )}
        </div>
      )}

      {/* Live Queues */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "voters" ? (
          <VoterQueue />
        ) : activeTab === "parties" ? (
          <PartyQueue />
        ) : (
          <Results />
        )}
      </div>
    </div>
  );
}
