import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingCalculator } from "@/components/calculator/FloatingCalculator";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter />
      <FloatingCalculator />
    </>
  );
}
