import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-8">
      <h1 className="text-primary text-6xl font-black">404 - Page Not Found</h1>
      <Link
        href="/"
        className="text-primary text-2xl underline hover:text-primary/50 transition duration-300 font-semibold"
      >
        <h2>Return to Home</h2>
      </Link>
    </div>
  );
}
