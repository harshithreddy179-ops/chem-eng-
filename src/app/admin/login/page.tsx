import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  if (await getAdminContext()) redirect("/admin");

  const notice = !isSupabaseConfigured
    ? "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README)."
    : sp.error === "unauthorized"
      ? "This account is not authorised to administer the archive."
      : undefined;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(179,148,105,0.16),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="eyebrow hover:text-ivory">
          ← The Chemical Archive
        </Link>
        <h1 className="mt-10 font-display text-6xl font-light uppercase leading-[0.9]">
          Admin
          <br />
          <em className="italic text-bronze-300">portal</em>
        </h1>
        <p className="mb-12 mt-5 font-display text-lg italic text-ivory-400">Authorised editors only.</p>
        <LoginForm next={sp.next} notice={notice} />
      </div>
    </main>
  );
}
