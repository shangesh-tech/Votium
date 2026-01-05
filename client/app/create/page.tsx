"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { defaultChain } from "@/lib/chains";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

const contract = getContract({
  client,
  chain: defaultChain,
  address: process.env.NEXT_PUBLIC_VOTIUM_CONTRACT_ADDRESS!,
});

export default function CreateElection() {
  const router = useRouter();
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);

  const addCandidate = () => {
    if (candidates.length < 6) {
      setCandidates([...candidates, ""]);
    }
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, value: string) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Validation
    if (!name || name.length > 30) {
      toast.error("Name must be 1-30 characters");
      return;
    }
    if (!description || description.length > 200) {
      toast.error("Description must be 1-200 characters");
      return;
    }
    if (!image) {
      toast.error("Image URL is required");
      return;
    }
    if (!deadline || Number(deadline) <= 0) {
      toast.error("Deadline must be greater than 0 minutes");
      return;
    }
    if (candidates.some((c) => !c.trim())) {
      toast.error("All candidate names are required");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method:
          "function createElection(string _name, string _description, string _image, string[] _candidatesNames, uint256 _deadline)",
        params: [name, description, image, candidates, BigInt(deadline)],
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Election created successfully!");
          router.push("/elections");
        },
        onError: (error) => {
          console.error("Error creating election:", error);
          toast.error("Failed to create election");
        },
      });
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Failed to prepare transaction");
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-500">
              Please connect your wallet to create an election
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-black">
              Create Election
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Set up a new decentralized election
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-black"
                >
                  Election Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Community Treasury Vote"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  {name.length}/30 characters
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-black"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Describe what this election is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="flex min-h-20 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500">
                  {description.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="image"
                  className="text-sm font-medium text-black"
                >
                  Cover Image URL
                </label>
                <input
                  id="image"
                  type="text"
                  placeholder="https://... or ipfs://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deadline"
                  className="text-sm font-medium text-black"
                >
                  Duration (minutes)
                </label>
                <input
                  id="deadline"
                  type="number"
                  placeholder="e.g., 1440 (24 hours)"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={1}
                  className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">
                    Candidates (2-6)
                  </label>
                  <button
                    type="button"
                    onClick={addCandidate}
                    disabled={candidates.length >= 6}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-gray-100 px-4 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Candidate ${index + 1}`}
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        disabled={candidates.length <= 2}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-black disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Election"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
