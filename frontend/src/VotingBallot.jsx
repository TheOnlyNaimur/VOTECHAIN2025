import { useState, useEffect } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { BALLOT_ADDRESS } from "./constants";
import BallotABI from "./abis/Ballot.json";
import { CheckCircle2, Vote, Loader2 } from "lucide-react";

export function VotingBallot() {
  const { address } = useAccount();
  const [parties, setParties] = useState([]);
  const {
    writeContract,
    isPending,
    isSuccess,
    data: hash,
  } = useWriteContract();

  // Load approved parties from our local "database"
  useEffect(() => {
    const savedParties = JSON.parse(
      localStorage.getItem("party_requests") || "[]"
    );
    setParties(savedParties.filter((p) => p.status === "approved"));
  }, []);

  const handleVote = (partyAddress) => {
    writeContract({
      address: BALLOT_ADDRESS,
      abi: BallotABI.abi,
      functionName: "vote",
      args: [partyAddress], // Pass the party's wallet address
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center p-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 animate-in zoom-in-95">
        <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6" />
        <h2 className="text-4xl font-black text-gray-900">Vote Recorded!</h2>
        <p className="text-gray-500 mt-4 font-mono text-sm break-all">
          TX: {hash}
        </p>
        <p className="mt-6 text-emerald-600 font-bold">
          Thank you for participating in Bangladesh Digital VoteChain 2025.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-gray-900 tracking-tight">
          Cast Your Ballot
        </h2>
        <p className="text-gray-500 mt-4 text-lg">
          Select one authorized candidate to represent your constituency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parties.map((party, index) => (
          <button
            key={index}
            disabled={isPending}
            onClick={() => handleVote(party.userAddress)}
            className="group bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] text-left hover:border-emerald-500 hover:shadow-2xl transition-all flex justify-between items-center"
          >
            <div>
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                {party.name}
              </h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">
                {party.symbol}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Vote size={28} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
