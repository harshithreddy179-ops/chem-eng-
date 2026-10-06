"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="frame flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-lg text-slate-600">We couldn&rsquo;t load this page. Please try again.</p>
      <button type="button" onClick={reset} className="btn-solid mt-6">
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
