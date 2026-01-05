"use client";

import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { resolveScheme } from "thirdweb/storage";
import { client } from "@/lib/client";

interface ElectionCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  deadline: number;
  totalVotes: number;
  hasVoted: boolean;
  cancelled: boolean;
}

const ElectionCard = ({
  id,
  name,
  description,
  image,
  deadline,
  totalVotes,
  hasVoted,
  cancelled,
}: ElectionCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>(image);
  
  useEffect(() => {
    const resolveImage = async () => {
      if (image) {
        try {
          if (image.startsWith('ipfs://')) {
            const resolved = await resolveScheme({
              client,
              uri: image,
            });
            setImageUrl(resolved);
          } else if (image.startsWith('http')) {
            // Already an HTTP URL
            setImageUrl(image);
          } else {
            // Assume it's an IPFS hash and construct the URL
            setImageUrl(`https://ipfs.io/ipfs/${image}`);
          }
        } catch (error) {
          console.error("Error resolving image:", error);
          setImageUrl(image); // Fallback to original
        }
      }
    };
    resolveImage();
  }, [image]);
  
  const now = Date.now();
  const deadlineMs = deadline * 1000;
  const isEnded = now > deadlineMs;
  
  const getStatus = () => {
    if (cancelled) return { label: "Cancelled", className: "bg-red-100 text-red-800" };
    if (isEnded) return { label: "Ended", className: "bg-gray-100 text-gray-800" };
    return { label: "Active", className: "bg-black text-white" };
  };

  const status = getStatus();

  const formatTimeLeft = () => {
    if (isEnded || cancelled) return "Ended";
    const diff = deadlineMs - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>
      
      <div className="p-5 pb-2">
        <h3 className="line-clamp-1 text-lg font-semibold text-black">{name}</h3>
      </div>
      
      <div className="px-5 pb-3">
        <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTimeLeft()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 pt-0">
        <Link
          href={`/election/${id}`}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
            isEnded 
              ? "bg-gray-100 text-black hover:bg-gray-200" 
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isEnded ? "View Results" : hasVoted ? "View Election" : "Vote Now"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ElectionCard;
