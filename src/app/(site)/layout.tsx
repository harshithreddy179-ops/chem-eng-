import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingCalculator } from "@/components/calculator/FloatingCalculator";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
      <FloatingCalculator />
    </>
  );
}
