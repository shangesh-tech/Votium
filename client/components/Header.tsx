import { Vote, Wallet } from "lucide-react";
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-black" />
          <span className="text-lg font-semibold text-black">Votium</span>
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <Link 
            href="/" 
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black"
          >
            Home
          </Link>
          <Link 
            href="/elections" 
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black"
          >
            Elections
          </Link>
          <Link 
            href="/create" 
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black"
          >
            Create
          </Link>
        </nav>

        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      </div>
    </header>
  );
}