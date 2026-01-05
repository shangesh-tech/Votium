"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Users, Clock, Loader2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { resolveScheme } from "thirdweb/storage";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";

type Candidate = {
  candidateId: bigint;
  name: string;
  voteCount: bigint;
};

type ElectionViewResult = {
  name: string;
  description: string;
  image: string;
  deadline: bigint;
  totalVotes: bigint;
  candidates: Candidate[];
  hasVoted: boolean;
  cancelled: boolean;
};

const contract = getContract({
  client,
  chain: defaultChain,
  address: process.env.NEXT_PUBLIC_VOTIUM_CONTRACT_ADDRESS!,
});

export default function Results({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const account = useActiveAccount();
  
  const [election, setElection] = useState<ElectionViewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!account?.address || !id) {
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await readContract({
          contract,
          method: {
            name: "getElectionByIdWithResult",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "_electionId", type: "uint256" }],
            outputs: [
              {
                name: "",
                type: "tuple",
                components: [
                  { name: "name", type: "string" },
                  { name: "description", type: "string" },
                  { name: "image", type: "string" },
                  { name: "deadline", type: "uint256" },
                  { name: "totalVotes", type: "uint256" },
                  {
                    name: "candidates",
                    type: "tuple[]",
                    components: [
                      { name: "candidateId", type: "uint32" },
                      { name: "voteCount", type: "uint32" },
                      { name: "name", type: "string" }
                    ]
                  },
                  { name: "hasVoted", type: "bool" },
                  { name: "cancelled", type: "bool" }
                ]
              }
            ]
          },
          params: [BigInt(id)],
          from: account.address as `0x${string}`,
        });

        const electionData = {
          name: data.name,
          description: data.description,
          image: data.image,
          deadline: data.deadline,
          totalVotes: data.totalVotes,
          candidates: data.candidates.map(c => ({
            candidateId: BigInt(c.candidateId),
            voteCount: BigInt(c.voteCount),
            name: c.name
          })),
          hasVoted: data.hasVoted,
          cancelled: data.cancelled
        };
        setElection(electionData);
        
        // Resolve IPFS URL to HTTP only if it's an IPFS URI
        if (data.image) {
          if (data.image.startsWith('ipfs://')) {
            const resolved = await resolveScheme({
              client,
              uri: data.image,
            });
            setImageUrl(resolved);
          } else if (data.image.startsWith('http')) {
            // Already an HTTP URL
            setImageUrl(data.image);
          } else {
            // Assume it's an IPFS hash and construct the URL
            setImageUrl(`https://ipfs.io/ipfs/${data.image}`);
          }
        }
      } catch (err: any) {
        console.error("Error fetching results:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [account?.address, id]);

  const sortedCandidates = useMemo(() => {
    if (!election) return [];
    return [...election.candidates].sort(
      (a, b) => Number(b.voteCount) - Number(a.voteCount)
    );
  }, [election]);

  const winner = sortedCandidates[0];
  
  // Check if it's a tie (all candidates have same vote count)
  const isTie = useMemo(() => {
    if (!election || election.candidates.length === 0) return false;
    const firstVoteCount = election.candidates[0].voteCount;
    return election.candidates.every(c => c.voteCount === firstVoteCount);
  }, [election]);
  
  const deadlineMs = election ? Number(election.deadline) * 1000 : 0;
  const isEnded = currentTime > deadlineMs;
  
  const formatTimeLeft = () => {
    if (isEnded) return "Ended";
    const diff = deadlineMs - currentTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };
  
  const endDate = election
    ? new Date(Number(election.deadline) * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-500">
              Please connect your wallet to view election results
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
              <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Election In Progress
            </h1>
            <p className="text-gray-600 mb-6">
              This election is currently ongoing. Results will be available once the voting period ends.
            </p>
            {deadlineMs > 0 && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Time Remaining</p>
                <p className="text-3xl font-bold text-black">
                  {formatTimeLeft()}
                </p>
              </div>
            )}
            <button
              onClick={() => router.push("/elections")}
              className="inline-flex items-center gap-2 text-black hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl">
              <img
                src={imageUrl || election.image}
                alt={election.name}
                className="aspect-video w-full object-cover"
              />
            </div>
            
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-black md:text-4xl">
                  {election.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                  {election.cancelled ? "Cancelled" : isEnded ? "Ended" : "Active"}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{isEnded ? `Ended ${endDate}` : "Voting in progress"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{Number(election.totalVotes).toLocaleString()} total votes</span>
                </div>
              </div>
              
              <p className="mt-6 text-gray-700 leading-relaxed">{election.description}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-black">
                  <Trophy className="h-5 w-5" />
                  {isEnded ? "Final Results" : "Current Results"}
                </h3>
              </div>
              
              <div className="space-y-4 p-6">
                {sortedCandidates.map((candidate, index) => {
                  const percentage = Number(election.totalVotes) > 0
                    ? (Number(candidate.voteCount) / Number(election.totalVotes)) * 100
                    : 0;
                  const isWinner = index === 0 && isEnded && !isTie;
                  
                  return (
                    <div key={Number(candidate.candidateId)} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isWinner && (
                            <span className="text-lg">🏆</span>
                          )}
                          <span className={`font-medium text-sm ${isWinner ? "text-black" : "text-gray-700"}`}>
                            {candidate.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-black">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-black transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {Number(candidate.voteCount).toLocaleString()} votes
                      </p>
                    </div>
                  );
                })}
                
                {isEnded && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {isTie ? "Result" : "Winner"}
                    </p>
                    {isTie ? (
                      <div>
                        <p className="text-xl font-bold text-gray-900 mb-1">🤝 Tie</p>
                        <p className="text-sm text-gray-500">
                          All candidates have equal votes
                        </p>
                      </div>
                    ) : winner ? (
                      <div>
                        <p className="text-xl font-bold text-black mb-1">
                          🏆 {winner.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          with {Number(election.totalVotes) > 0 
                            ? ((Number(winner.voteCount) / Number(election.totalVotes)) * 100).toFixed(1)
                            : 0}% of votes
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {!isEnded && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Election In Progress
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Time remaining: {formatTimeLeft()}
                    </p>
                    <p className="text-xs text-blue-600">
                      Results may change until voting ends
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
