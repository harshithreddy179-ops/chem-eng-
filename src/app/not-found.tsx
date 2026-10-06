import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="frame flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <p className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text font-display text-8xl font-bold text-transparent">404</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-lg text-slate-600">This page doesn&rsquo;t exist or has been moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-solid">
          <Home className="h-4 w-4" /> Go home
        </Link>
        <Link href="/archive" className="btn-luxe">
          <BookOpen className="h-4 w-4" /> Study Material
        </Link>
      </div>
    </main>
  );
}
