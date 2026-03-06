import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-amber-500 mb-4">404</h1>
        <p className="text-zinc-400 text-lg mb-6">Page not found</p>
        <Link
          href="/"
          className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}