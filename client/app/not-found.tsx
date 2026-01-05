import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        
        <h1 className="mb-4 text-6xl font-bold text-black">404</h1>
        <p className="mb-2 text-xl text-gray-900">Page not found</p>
        <p className="mb-8 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
