"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="frame flex min-h-[80vh] flex-col justify-center pt-32">
      <p className="eyebrow text-bronze">Something went wrong</p>
      <h1 className="mt-8 font-display text-display-lg font-light uppercase">A momentary fault</h1>
      <p className="mt-6 max-w-md font-display text-xl italic text-ivory-400">The archive could not be read just now. Please try again.</p>
      <button type="button" onClick={reset} className="btn-luxe mt-10 self-start">
        Try again
      </button>
    </div>
  );
}
