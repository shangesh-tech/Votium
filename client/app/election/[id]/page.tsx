"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, CheckCircle2, BarChart3 } from "lucide-react";

// Mock data - in real app, use useEffect to fetch based on id
const mockElection = {
  id: 1,
  name: "Community Treasury Allocation",
  description: "Vote on how to allocate the Q1 2024 community treasury funds across different initiatives. This includes development grants, marketing campaigns, and community rewards.",
  image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60",
  deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
  totalVotes: 1247,
  hasVoted: false,
  cancelled: false,
  candidates: [
    { candidateId: 1, name: "Development Grants", voteCount: 456 },
    { candidateId: 2, name: "Marketing Campaign", voteCount: 342 },
    { candidateId: 3, name: "Community Rewards", voteCount: 289 },
    { candidateId: 4, name: "Reserve Fund", voteCount: 160 },
  ],
};

export default function ElectionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(mockElection.hasVoted);
  const [showSuccess, setShowSuccess] = useState(false);

  const now = Date.now();
  const deadlineMs = mockElection.deadline * 1000;
  const isEnded = now > deadlineMs;

  const formatTimeLeft = () => {
    if (isEnded) return "Voting has ended";
    const diff = deadlineMs - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${minutes}m remaining`;
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      alert("Please select a candidate");
      return;
    }
    
    setHasVoted(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const endDate = new Date(mockElection.deadline * 1000).toLocaleDateString("en-US", {
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

        {showSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Vote submitted successfully! (Demo mode)
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl">
              <img
                src={mockElection.image}
                alt={mockElection.name}
                className="aspect-video w-full object-cover"
              />
            </div>
            
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-black md:text-4xl">
                  {mockElection.name}
                </h1>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isEnded 
                    ? "bg-gray-100 text-gray-800" 
                    : "bg-black text-white"
                }`}>
                  {isEnded ? "Ended" : "Active"}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{isEnded ? `Ended ${endDate}` : formatTimeLeft()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{mockElection.totalVotes.toLocaleString()} total votes</span>
                </div>
              </div>
              
              <p className="mt-6 text-gray-700 leading-relaxed">{mockElection.description}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-black">
                  {hasVoted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Vote Recorded
                    </>
                  ) : (
                    "Cast Your Vote"
                  )}
                </h3>
              </div>
              
              <div className="p-6">
                {hasVoted || isEnded ? (
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      {hasVoted && !isEnded 
                        ? "Thank you for participating! Your vote has been securely recorded on the blockchain."
                        : "This election has ended. View the final results."
                      }
                    </p>
                    <button
                      onClick={() => router.push(`/results/${params.id}`)}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Results
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {mockElection.candidates.map((candidate: any) => (
                        <label
                          key={candidate.candidateId}
                          className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-gray-50 ${
                            selectedCandidate === candidate.candidateId.toString()
                              ? "border-black bg-gray-50 ring-2 ring-black ring-offset-2"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="candidate"
                            value={candidate.candidateId.toString()}
                            checked={selectedCandidate === candidate.candidateId.toString()}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                          />
                          <span className="flex-1 font-medium text-black">
                            {candidate.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleVote}
                      disabled={!selectedCandidate}
                      className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
                    >
                      Submit Vote
                    </button>
                    
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Your vote is permanent and cannot be changed
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
