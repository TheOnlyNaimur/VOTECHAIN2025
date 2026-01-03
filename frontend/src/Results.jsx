import { useState, useEffect } from "react";
import { BALLOT_ADDRESS, PARTY_REGISTRY_ADDRESS } from "./constants";
import BallotABI from "./abis/Ballot.json";
import PartyRegistryABI from "./abis/PartyRegistry.json";
import { Trophy, Users, Flag } from "lucide-react";

export function Results() {
  const [results, setResults] = useState([]);

  // Load parties from localStorage and fetch vote counts
  useEffect(() => {
    const fetchResults = async () => {
      const savedParties = JSON.parse(
        localStorage.getItem("party_requests") || "[]"
      );
      const approvedParties = savedParties.filter(
        (p) => p.status === "approved"
      );

      if (approvedParties.length === 0) {
        setResults([]);
        return;
      }

      const resultsData = [];
      for (const party of approvedParties) {
        try {
          // Read vote count from blockchain
          const response = await fetch("http://127.0.0.1:8545", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_call",
              params: [
                {
                  to: BALLOT_ADDRESS,
                  data: `0x0121b93f000000000000000000000000${party.userAddress.slice(
                    2
                  )}`,
                },
                "latest",
              ],
              id: 1,
            }),
          });
          const data = await response.json();
          const voteCount = parseInt(data.result, 16);

          resultsData.push({
            ...party,
            votes: voteCount,
          });
        } catch (error) {
          console.error(`Error fetching votes for ${party.name}:`, error);
          resultsData.push({
            ...party,
            votes: 0,
          });
        }
      }

      // Sort by votes descending
      resultsData.sort((a, b) => b.votes - a.votes);
      setResults(resultsData);
    };

    fetchResults();
  }, []);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
  const winner = results.length > 0 ? results[0] : null;

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-3">
          Election Results
        </h2>
        <p className="text-gray-500 text-lg flex items-center justify-center gap-2">
          <Users size={20} /> Total Votes Cast: {totalVotes}
        </p>
      </div>

      {winner && winner.votes > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 p-10 rounded-[3rem] mb-8 text-center">
          <Trophy size={64} className="mx-auto text-yellow-600 mb-4" />
          <h3 className="text-3xl font-black text-yellow-900 mb-2">
            Current Leader
          </h3>
          <h4 className="text-4xl font-black text-gray-900">{winner.name}</h4>
          <p className="text-yellow-600 font-bold text-xl mt-2">
            {winner.votes} votes (
            {totalVotes > 0
              ? ((winner.votes / totalVotes) * 100).toFixed(1)
              : 0}
            %)
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((party, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-100 p-6 rounded-[2rem] hover:border-emerald-300 transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-gray-400">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">
                    {party.name}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {party.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-emerald-600">
                  {party.votes}
                </p>
                <p className="text-xs text-gray-400 font-bold">
                  {totalVotes > 0
                    ? ((party.votes / totalVotes) * 100).toFixed(1)
                    : 0}
                  % of votes
                </p>
              </div>
            </div>
            {/* Vote bar */}
            <div className="mt-4 bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalVotes > 0 ? (party.votes / totalVotes) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center p-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <Flag size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-bold text-lg">
            No parties registered yet
          </p>
        </div>
      )}
    </div>
  );
}
