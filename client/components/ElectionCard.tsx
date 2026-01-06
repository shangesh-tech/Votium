"use client";

import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { resolveScheme } from "thirdweb/storage";
import { client } from "@/lib/client";

function useTimeLeft(deadlineMs: number, cancelled: boolean) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = Date.now();
      const diff = deadlineMs - now;

      if (diff <= 0 || cancelled) {
        setTimeLeft("Ended");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      setTimeLeft(`${hours}h ${minutes}m left`);
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadlineMs, cancelled]);

  return timeLeft;
}

interface ElectionCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  deadline: number; // in seconds
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
  const [imageUrl, setImageUrl] = useState(
    "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"
  );

  // Resolve IPFS image
  useEffect(() => {
    const resolveImage = async () => {
      if (image?.startsWith("ipfs://")) {
        const resolved = await resolveScheme({ client, uri: image });
        setImageUrl(resolved);
      }
    };
    resolveImage();
  }, [image]);

  const deadlineMs = deadline * 1000;

  const timeLeft = useTimeLeft(deadlineMs, cancelled);

  const isEnded = timeLeft === "Ended";

  const getStatus = () => {
    if (cancelled) return { label: "Cancelled", className: "bg-red-100 text-red-800" };
    if (isEnded) return { label: "Ended", className: "bg-gray-100 text-gray-800" };
    return { label: "Active", className: "bg-black text-white" };
  };

  const status = getStatus();

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="p-5 pb-2">
        <h3 className="line-clamp-1 text-lg font-semibold text-black">{name}</h3>
      </div>

      {/* Description & meta */}
      <div className="px-5 pb-3">
        <p className="line-clamp-2 text-sm text-gray-600">{description}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* Action button */}
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
