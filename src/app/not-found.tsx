import Link from "next/link";

export default function NotFound() {
  return (
    <main className="frame flex min-h-dvh flex-col justify-center py-24">
      <p className="eyebrow text-bronze">Error 404</p>
      <h1 className="mt-8 font-display text-display-xl font-light uppercase">
        Not in
        <br />
        <em className="italic text-ivory-300">the archive</em>
      </h1>
      <p className="mt-8 max-w-md font-display text-xl italic text-ivory-400">
        The page you were looking for has moved, or was never filed here.
      </p>
      <div className="mt-12 flex flex-wrap gap-5">
        <Link href="/" className="btn-solid">
          Return home
        </Link>
        <Link href="/archive" className="btn-luxe">
          Open the archive
        </Link>
      </div>
    </main>
  );
}
