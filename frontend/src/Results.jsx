import { useState, useEffect } from "react";
import { BALLOT_ADDRESS } from "./constants";
import BallotABI from "./abis/Ballot.json";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📊 Results: Starting results fetch...");
    console.log("📊 Results: BALLOT_ADDRESS =", BALLOT_ADDRESS);

    const fetchResults = async () => {
      try {
        setLoading(true);
        console.log("📊 Results: Fetching results...");
        const client = createPublicClient({
          chain: sepolia,
          transport: http(
            "https://sepolia.infura.io/v3/31a3c11aa7554ab592dfb8c62e4b11c5"
          ),
        });
        const bytecode = await client.getBytecode({ address: BALLOT_ADDRESS });
        console.log("📊 Results: Ballot bytecode present?", Boolean(bytecode));
        if (!bytecode) {
          console.warn(
            "📊 Results: No bytecode found at BALLOT_ADDRESS. Is Anvil freshly restarted and contracts redeployed?"
          );
        }

        // Get ALL parties from localStorage (for admin view, show all)
        const savedParties = JSON.parse(
          localStorage.getItem("party_requests") || "[]"
        );
        console.log("📊 Results: All parties in localStorage:", savedParties);
        console.log(
          "📊 Results: localStorage party_requests:",
          localStorage.getItem("party_requests")
        );

        // For admin view, show all parties regardless of status
        const partiesToCheck = savedParties;
        console.log("📊 Results: Parties to check:", partiesToCheck);
        console.log(
          "📊 Results: Number of parties to check:",
          partiesToCheck.length
        );

        if (partiesToCheck.length === 0) {
          console.warn("📊 Results: No parties found!");
        }

        const resultsData = [];

        // Fetch vote count for each party from blockchain
        for (const party of partiesToCheck) {
          try {
            console.log(`📊 Results: Fetching votes for party:`, party);
            const count = await client.readContract({
              address: BALLOT_ADDRESS,
              abi: BallotABI.abi,
              functionName: "voteCount",
              args: [party.userAddress],
            });
            const voteCount = Number(count || 0);
            console.log(`📊 Results: ${party.name} has ${voteCount} votes`);

            resultsData.push({
              name: party.name,
              address: party.userAddress,
              votes: voteCount,
            });
          } catch (error) {
            console.error(
              `📊 Results: Error fetching votes for ${party.name}:`,
              error
            );
            // Gracefully continue with 0 votes if the call returned no data
            resultsData.push({
              name: party.name,
              address: party.userAddress,
              votes: 0,
            });
          }
        }

        // Sort by votes (highest first)
        resultsData.sort((a, b) => b.votes - a.votes);

        console.log("📊 Results: Final results:", resultsData);
        setResults(resultsData);
        setLoading(false);
      } catch (error) {
        console.error("📊 Results: Error fetching results:", error);
        setLoading(false);
      }
    };

    fetchResults();

    // Listen for party updates and vote events
    const handleUpdate = () => {
      console.log("📊 Results: Party list updated, refreshing...");
      fetchResults();
    };

    const handleVoteCast = () => {
      console.log("📊 Results: Vote cast detected, refreshing...");
      setTimeout(fetchResults, 2000); // Wait 2 seconds for blockchain confirmation
    };

    window.addEventListener("party_requests_updated", handleUpdate);
    window.addEventListener("vote_cast", handleVoteCast);

    return () => {
      window.removeEventListener("party_requests_updated", handleUpdate);
      window.removeEventListener("vote_cast", handleVoteCast);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">📊 Election Results</h2>
        <p className="text-gray-600">Loading results from blockchain...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">📊 Election Results</h2>
        <p className="text-gray-600">No results yet. Waiting for votes...</p>
      </div>
    );
  }

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
  const winner = results[0];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Election Results</h2>

      {/* Winner Card */}
      {winner && winner.votes > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">
            🏆 Leading Party
          </h3>
          <p className="text-2xl font-bold text-yellow-900">{winner.name}</p>
          <p className="text-lg text-yellow-700">
            {winner.votes} votes (
            {totalVotes > 0
              ? ((winner.votes / totalVotes) * 100).toFixed(1)
              : 0}
            %)
          </p>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Party Name</th>
              <th className="px-4 py-3 text-right">Votes</th>
              <th className="px-4 py-3 text-right">Percentage</th>
              <th className="px-4 py-3">Vote Distribution</th>
            </tr>
          </thead>
          <tbody>
            {results.map((party, index) => {
              const percentage =
                totalVotes > 0 ? (party.votes / totalVotes) * 100 : 0;
              return (
                <tr
                  key={party.address}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-3 font-bold">{index + 1}</td>
                  <td className="px-4 py-3">{party.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {party.votes}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && `${percentage.toFixed(0)}%`}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Votes */}
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-700">
          <span className="font-bold">Total Votes Cast:</span> {totalVotes}
        </p>
      </div>
    </div>
  );
}
