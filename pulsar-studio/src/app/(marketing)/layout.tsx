import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { LiveChat } from "@/components/shared/LiveChat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {/* Doar pe paginile reale: pe /demo/* ar acoperi butoanele proprii
          ale demo-urilor (coșul din magazin stă în același colț). */}
      <LiveChat />
    </>
  );
}
