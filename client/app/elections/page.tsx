"use client";

import { useEffect, useState, useMemo } from "react";
import ElectionCard from "@/components/ElectionCard";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";

type Candidate = {
  candidateId: bigint;
  name: string;
  voteCount: bigint;
};

type Election = {
  creatorAddress: string;
  cancelled: boolean;
  sectionId: string;
  name: string;
  description: string;
  image: string;
  candidates: Candidate[];
  deadline: bigint;
  totalVotes: bigint;
};

const contract = getContract({
  client,
  chain: defaultChain,
  address: process.env.NEXT_PUBLIC_VOTIUM_CONTRACT_ADDRESS!,
});

export default function Elections() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "active" | "ended">(
    "all"
  );
  const [isReadingElections, setIsReading] = useState(true);

  const account = useActiveAccount();

  const filteredElections = useMemo(() => {
    if (!elections) return null;
    
    const now = Date.now();
    
    return elections
      .filter((election) =>
        searchQuery
          ? election.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
      .filter((election) => {
        if (userFilter === "all") {
          return true;
        }
        
        const deadlineMs = Number(election.deadline) * 1000;
        
        if (userFilter === "active") {
          return now < deadlineMs && !election.cancelled;
        } else if (userFilter === "ended") {
          return now >= deadlineMs || election.cancelled;
        }
        
        return true;
      });
  }, [elections, searchQuery, userFilter]);

  useEffect(() => {
    if (!account?.address) {
      setIsReading(false);
      return;
    }

    const checkPortfolio = async () => {
      try {
        setIsReading(true);

        const data = await readContract({
          contract,
          method:
            "function getMyElections() view returns ((address creatorAddress, bool cancelled, bytes32 sectionId, string name, string description, string image, tuple(uint256 candidateId, string name, uint256 voteCount)[] candidates, uint256 deadline, uint256 totalVotes)[])",
          params: [],
          from: account.address as `0x${string}`,
        });

        console.log("Elections found:", data);
        setElections(data as Election[]);
      } catch (err: any) {
        console.log("No Elections exist:", err.message);
        setElections(null);
      } finally {
        setIsReading(false);
      }
    };

    checkPortfolio();
  }, [account?.address]);

    if (isReadingElections) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading your elections...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-500">
            Please connect your wallet to view/create your elections
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Elections</h1>
            <p className="mt-1 text-gray-600">
              Browse and participate in active elections
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create Election
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setUserFilter("all")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                userFilter === "all"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUserFilter("active")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                userFilter === "active"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setUserFilter("ended")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                userFilter === "ended"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Ended
            </button>
          </div>
        </div>

        {!filteredElections || filteredElections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Filter className="mb-4 h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-black">
              No elections found
            </h2>
            <p className="mt-2 text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredElections.map((election, index) => (
              <ElectionCard
                key={election.sectionId}
                id={index + 1}
                name={election.name}
                description={election.description}
                image={election.image}
                deadline={Number(election.deadline)}
                totalVotes={Number(election.totalVotes)}
                hasVoted={false}
                cancelled={election.cancelled}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
