"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Users, Clock } from "lucide-react";

// Mock data - in real app, use useEffect to fetch based on id
const mockResults = {
  id: 1,
  name: "Community Treasury Allocation",
  description: "Vote on how to allocate the Q1 2024 community treasury funds across different initiatives. This includes development grants, marketing campaigns, and community rewards.",
  image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60",
  deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
  totalVotes: 1247,
  hasVoted: true,
  cancelled: false,
  candidates: [
    { candidateId: 1, name: "Development Grants", voteCount: 456 },
    { candidateId: 2, name: "Marketing Campaign", voteCount: 342 },
    { candidateId: 3, name: "Community Rewards", voteCount: 289 },
    { candidateId: 4, name: "Reserve Fund", voteCount: 160 },
  ],
};

export default function Results({ params }: { params: { id: string } }) {
  const router = useRouter();

  const sortedCandidates = [...mockResults.candidates].sort(
    (a, b) => b.voteCount - a.voteCount
  );

  const winner = sortedCandidates[0];
  const now = Date.now();
  const deadlineMs = mockResults.deadline * 1000;
  const isEnded = now > deadlineMs;
  
  const endDate = new Date(mockResults.deadline * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
                src={mockResults.image}
                alt={mockResults.name}
                className="aspect-video w-full object-cover"
              />
            </div>
            
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-black md:text-4xl">
                  {mockResults.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                  {isEnded ? "Ended" : "Active"}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{isEnded ? `Ended ${endDate}` : "Voting in progress"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{mockResults.totalVotes.toLocaleString()} total votes</span>
                </div>
              </div>
              
              <p className="mt-6 text-gray-700 leading-relaxed">{mockResults.description}</p>
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
                  const percentage = (candidate.voteCount / mockResults.totalVotes) * 100;
                  const isWinner = index === 0 && isEnded;
                  
                  return (
                    <div key={candidate.candidateId} className="space-y-2">
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
                        {candidate.voteCount.toLocaleString()} votes
                      </p>
                    </div>
                  );
                })}
                
                {isEnded && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600">Winner</p>
                    <p className="mt-1 font-semibold text-black">{winner.name}</p>
                    <p className="text-sm text-gray-600">
                      with {((winner.voteCount / mockResults.totalVotes) * 100).toFixed(1)}% of votes
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
