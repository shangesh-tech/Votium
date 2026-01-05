"use client";

import { useEffect, useState, useMemo } from "react";
import ElectionCard from "@/components/ElectionCard";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";

type ElectionView = {
  name: string;
  description: string;
  image: string;
  deadline: bigint;
  totalVotes: bigint;
  hasVoted: boolean;
  cancelled: boolean;
};

const contract = getContract({
  client,
  chain: defaultChain,
  address: process.env.NEXT_PUBLIC_VOTIUM_CONTRACT_ADDRESS!,
});

export default function Elections() {
  const [elections, setElections] = useState<ElectionView[] | null>(null);
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
          method: {
            name: "getElections",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [
              {
                name: "",
                type: "tuple[]",
                components: [
                  { name: "name", type: "string" },
                  { name: "description", type: "string" },
                  { name: "image", type: "string" },
                  { name: "deadline", type: "uint256" },
                  { name: "totalVotes", type: "uint256" },
                  { name: "hasVoted", type: "bool" },
                  { name: "cancelled", type: "bool" },
                ],
              },
            ],
          },
          params: [],
          from: account.address as `0x${string}`,
        });

        console.log("Elections found:", data);
        setElections(data as ElectionView[]);
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
                key={index}
                id={index + 1}
                name={election.name}
                description={election.description}
                image={election.image}
                deadline={Number(election.deadline)}
                totalVotes={Number(election.totalVotes)}
                hasVoted={election.hasVoted}
                cancelled={election.cancelled}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all duration-300">
            <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">
              Powered by
            </span>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="flex items-center gap-1.5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                  alt="Ethereum"
                  className="h-5 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Ethereum
                </span>
              </div>
              <span className="text-gray-300 px-1 font-light">×</span>
              <div className="flex items-center gap-1.5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://avatars.githubusercontent.com/u/108554348?s=280&v=4"
                  alt="base"
                  className="h-5 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Base
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
