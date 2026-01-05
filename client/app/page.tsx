import {
  Vote,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Fuel,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type statType = {
  value: string;
  label: string;
};

const features: Feature[] = [
  {
    icon: Shield,
    title: "Secure & Transparent",
    description:
      "All votes are recorded immutably on-chain. Results can be verified by anyone.",
  },
  {
    icon: Users,
    title: "Decentralized",
    description:
      "No central authority controls the elections. Power belongs to the community.",
  },
  {
    icon: Zap,
    title: "Gas Efficient",
    description:
      "Optimized smart contracts ensure low transaction costs for voting.",
  },
];

const accountAbstractionFeatures: Feature[] = [
  {
    icon: Fuel,
    title: "Gas Sponsorship",
    description:
      "Vote without paying gas fees. We sponsor transaction costs so participation is free for voters.",
  },
  {
    icon: Wallet,
    title: "Smart Accounts",
    description:
      "ERC-4337 smart contract wallets enable gasless voting with enhanced security features.",
  },
  {
    icon: Shield,
    title: "Bundled Transactions",
    description:
      "Multiple operations in a single transaction. Batch your votes efficiently.",
  },
];

const stats: statType[] = [
  { value: "1,247", label: "Elections Created" },
  { value: "45K+", label: "Votes Cast" },
  { value: "12K+", label: "Active Voters" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-700">
              <Vote className="h-4 w-4" />
              <span>Decentralized Voting Protocol</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-black md:text-7xl">
              Vote with confidence.
            </h1>
            <h2 className="mt-2 text-5xl font-bold tracking-tight text-gray-400 md:text-7xl">
              On-chain transparency.
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Create and participate in secure, transparent elections powered by
              blockchain technology. Every vote is immutable and verifiable.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/elections"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Browse Elections
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/create"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 px-8 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                Create Election
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl font-bold text-black">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-black">Why Votium?</h2>
            <p className="mt-4 text-gray-600">
              Built for communities that value transparency and fairness
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-black">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Abstraction Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700">
              <Fuel className="h-4 w-4" />
              <span>Powered by ERC-4337</span>
            </div>
            <h2 className="text-4xl font-bold text-black">
              Gasless Voting Experience
            </h2>
            <p className="mt-4 text-gray-600">
              Using Account Abstraction, voters can participate without holding
              ETH for gas fees
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {accountAbstractionFeatures.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-8"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-black">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-gray-200 bg-gray-50 p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-black">
                  How it works
                </h4>
                <p className="mt-2 text-gray-600">
                  Connect your wallet, create a smart account, and vote on any
                  election. The protocol&apos;s Paymaster handles all gas costs
                  automatically—you just sign and vote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-black" />
              <span className="font-semibold text-black">Votium</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 Votium. Decentralized voting for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
