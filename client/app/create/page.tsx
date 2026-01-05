"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { upload } from "thirdweb/storage";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [sectionId, setSectionId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    if (!sectionId) {
      toast.error("Section ID is required");
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
      // Upload image to IPFS
      setIsUploading(true);
      toast.loading("Uploading image to IPFS...", { id: "upload" });
      
      const uploadedUri = await upload({
        client,
        files: [selectedFile],
      });
      
      console.log("Upload response:", uploadedUri);
      // The upload function returns the URI directly as a string
      const imageUrl = typeof uploadedUri === 'string' ? uploadedUri : uploadedUri[0];
      console.log("Image URL:", imageUrl);
      
      if (!imageUrl || imageUrl.length < 10) {
        throw new Error("Invalid IPFS URL returned");
      }
      
      toast.success("Image uploaded successfully!", { id: "upload" });
      setIsUploading(false);

      // Create election transaction
      const transaction = prepareContractCall({
        contract,
        method:
          "function createElection(string _name, string _description, string _image, string _sectionId, string[] _candidatesNames, uint256 _deadline)",
        params: [name, description, imageUrl, sectionId, candidates, BigInt(deadline)],
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
      setIsUploading(false);
      toast.dismiss("upload");
      toast.error("Failed to upload image or prepare transaction");
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
                <label className="text-sm font-medium text-black">
                  Cover Image
                </label>
                {!selectedFile ? (
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Plus className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Image will be uploaded to IPFS automatically
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="sectionId"
                  className="text-sm font-medium text-black"
                >
                  Section ID
                </label>
                <input
                  id="sectionId"
                  type="text"
                  placeholder='e.g., "S69" or "All"'
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Section identifier for voter eligibility
                </p>
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
                disabled={isPending || isUploading}
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading to IPFS...
                  </>
                ) : isPending ? (
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
