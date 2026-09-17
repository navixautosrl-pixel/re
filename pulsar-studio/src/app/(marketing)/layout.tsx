import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
