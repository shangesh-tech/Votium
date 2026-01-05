"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Users, Clock, Loader2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

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
          method:
            "function getElectionByIdWithResult(uint256 _electionId) view returns ((string name, string description, string image, uint256 deadline, uint256 totalVotes, tuple(uint32 candidateId, uint32 voteCount, string name)[] candidates, bool hasVoted, bool cancelled))",
          params: [BigInt(id)],
          from: account.address as `0x${string}`,
        });

        setElection(data as ElectionViewResult);
      } catch (err: any) {
        console.error("Error fetching results:", err);
        toast.error("Failed to load results. Election may not have ended yet.");
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
  const now = useMemo(() => Date.now(), [election]);
  const deadlineMs = election ? Number(election.deadline) * 1000 : 0;
  const isEnded = now > deadlineMs;
  
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Results Not Available
            </h1>
            <p className="text-gray-600 mb-4">
              This election may not have ended yet or doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/elections")}
              className="text-black underline hover:text-gray-700"
            >
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
                src={election.image}
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
                  const isWinner = index === 0 && isEnded;
                  
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
                
                {isEnded && winner && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600">Winner</p>
                    <p className="mt-1 font-semibold text-black">{winner.name}</p>
                    <p className="text-sm text-gray-600">
                      with {Number(election.totalVotes) > 0 
                        ? ((Number(winner.voteCount) / Number(election.totalVotes)) * 100).toFixed(1)
                        : 0}% of votes
                    </p>
                  </div>
                )}
                
                {!isEnded && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                    <p className="text-sm text-blue-800">
                      Voting is still in progress. Results may change.
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
