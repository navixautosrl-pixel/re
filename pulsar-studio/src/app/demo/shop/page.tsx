import type { Metadata } from "next";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { CartProvider } from "./_lib/CartContext";
import { ShopNavbar } from "./_sections/Navbar";
import { ShopHero } from "./_sections/Hero";
import { ShopProductGrid } from "./_sections/ProductGrid";
import { ShopCartDrawer } from "./_sections/CartDrawer";
import { ShopAboutContactFooter } from "./_sections/AboutContactFooter";

export const metadata: Metadata = {
  title: { absolute: "Haven — Demo magazin online · Pulsar Studio" },
  description: "Demo concept: magazin online funcțional, construit de Pulsar Studio. Nu este o afacere reală.",
  robots: { index: false, follow: false },
};

export default function ShopDemoPage() {
  return (
    <div id="demo-scope" className="demo-shop font-sans" style={{ background: "var(--s-bg)", color: "var(--s-fg)" }}>
      <CartProvider>
        <ShopNavbar />
        <main id="main">
          <ShopHero />
          <ShopProductGrid />
          <ShopAboutContactFooter />
        </main>
        <ShopCartDrawer />
      </CartProvider>
      <DemoBadge dark={false} topClassName="top-28" />
    </div>
  );
}
