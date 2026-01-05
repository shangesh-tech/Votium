"use client";

import { useState } from "react";
import ElectionCard from "@/components/ElectionCard";
import { Search, Plus, Filter } from "lucide-react";
import Link from "next/link";

const mockElections = [
  {
    id: 1,
    name: "Community Treasury Allocation",
    description:
      "Vote on how to allocate the Q1 2024 community treasury funds across different initiatives.",
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
    totalVotes: 1247,
    hasVoted: false,
    cancelled: false,
  },
  {
    id: 2,
    name: "Protocol Upgrade Proposal",
    description:
      "Decide whether to implement the new staking mechanism proposed by the core team.",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
    totalVotes: 892,
    hasVoted: true,
    cancelled: false,
  },
  {
    id: 3,
    name: "New Partnership Vote",
    description:
      "Vote on the proposed partnership with external DeFi protocols.",
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60",
    deadline: Math.floor(Date.now() / 1000) - 86400,
    totalVotes: 2341,
    hasVoted: true,
    cancelled: false,
  },
  {
    id: 4,
    name: "Governance Model Update",
    description:
      "Proposal to update the governance voting weights and delegation system.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    totalVotes: 156,
    hasVoted: false,
    cancelled: false,
  },
];

export default function Elections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const now = Date.now();
  const filteredElections = mockElections
    .filter((election) =>
      searchQuery
        ? election.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((election) => {
      if (filter === "all") {
        return true;
      }
      if (filter === "active") {
        const deadlineMs = election.deadline * 1000;
        return now < deadlineMs && !election.cancelled;
      } else if (filter === "ended") {
        const deadlineMs = election.deadline * 1000;
        return now >= deadlineMs || election.cancelled;
      }
    });

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
              onClick={() => setFilter("all")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === "active"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("ended")}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === "ended"
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Ended
            </button>
          </div>
        </div>

        {filteredElections.length === 0 ? (
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
            {filteredElections.map((election) => (
              <ElectionCard key={election.id} {...election} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
