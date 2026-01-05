"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { resolveScheme } from "thirdweb/storage";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

type Candidate = {
  candidateId: bigint;
  name: string;
  voteCount: bigint;
};

type ElectionWithCandidates = {
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

export default function ElectionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  
  const [election, setElection] = useState<ElectionWithCandidates | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");

  const now = useMemo(() => Date.now(), [election]);
  const deadlineMs = election ? Number(election.deadline) * 1000 : 0;
  const isEnded = now > deadlineMs;

  useEffect(() => {
    if (!account?.address || !id) {
      setIsLoading(false);
      return;
    }

    const fetchElection = async () => {
      try {
        setIsLoading(true);
        const data = await readContract({
          contract,
          method: {
            name: "getElectionWithCandidates",
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
        console.error("Error fetching election:", err);
        toast.error("Failed to load election");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [account?.address, id]);

  const formatTimeLeft = () => {
    if (isEnded) return "Voting has ended";
    const diff = deadlineMs - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${minutes}m remaining`;
  };

  const handleVote = async () => {
    if (!selectedCandidate || !account) {
      toast.error("Please select a candidate");
      return;
    }
    if (!sectionId) {
      toast.error("Please enter your section ID");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method: "function vote(uint256 _electionId, uint256 _candidateId, string _sectionId)",
        params: [BigInt(id), BigInt(selectedCandidate), sectionId],
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Vote submitted successfully!");
          window.location.reload();
        },
        onError: (error) => {
          console.error("Error voting:", error);
          toast.error("Failed to submit vote");
        },
      });
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Failed to prepare transaction");
    }
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
              Please connect your wallet to view and vote in elections
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
            <p className="text-gray-600">Loading election...</p>
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
              Election Not Found
            </h1>
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
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isEnded || election.cancelled
                    ? "bg-gray-100 text-gray-800" 
                    : "bg-black text-white"
                }`}>
                  {election.cancelled ? "Cancelled" : isEnded ? "Ended" : "Active"}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{isEnded ? `Ended ${endDate}` : formatTimeLeft()}</span>
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
                  {election.hasVoted ? (
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
                {election.hasVoted || isEnded || election.cancelled ? (
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      {election.cancelled 
                        ? "This election has been cancelled."
                        : election.hasVoted && !isEnded 
                        ? "Thank you for participating! Your vote has been securely recorded on the blockchain."
                        : "This election has ended. View the final results."
                      }
                    </p>
                    <button
                      onClick={() => router.push(`/results/${id}`)}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Results
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 space-y-2">
                      <label
                        htmlFor="sectionId"
                        className="text-sm font-medium text-black"
                      >
                        Your Section ID
                      </label>
                      <input
                        id="sectionId"
                        type="text"
                        placeholder='Enter your section ID (e.g., "S69")'
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <p className="mb-4 text-sm text-gray-600">
                      Select a candidate below to cast your vote. Note: Votes are permanent and cannot be changed.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {election.candidates.map((candidate) => (
                        <label
                          key={Number(candidate.candidateId)}
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
                      disabled={!selectedCandidate || isPending}
                      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Vote"
                      )}
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
