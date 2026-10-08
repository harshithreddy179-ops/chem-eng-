import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingCalculator } from "@/components/calculator/FloatingCalculator";
import { NavProgress } from "@/components/layout/NavProgress";
import { Suspense } from "react";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <NavProgress />
      </Suspense>
      <SiteHeader />
      <main id="main" className="relative min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
      <FloatingCalculator />
    </>
  );
}
