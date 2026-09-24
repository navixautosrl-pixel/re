import type { Metadata } from "next";
import { ogImages } from "@/lib/basePath";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { CartProvider } from "./_lib/CartContext";
import { ShopNavbar } from "./_sections/Navbar";
import { ShopHero } from "./_sections/Hero";
import { ShopProductGrid } from "./_sections/ProductGrid";
import { ShopCartDrawer } from "./_sections/CartDrawer";
import { ShopAboutContactFooter } from "./_sections/AboutContactFooter";

export const metadata: Metadata = {
  title: { absolute: "Haven — Demo magazin online · CreareWebsitePro" },
  description: "Haven — demo de magazin online: catalog de produse, filtre și coș de cumpărături. Exemplu construit de CreareWebsitePro. Nu este o afacere reală.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo/shop" },
  openGraph: { title: "Haven — Demo magazin online · CreareWebsitePro", description: "Haven — demo de magazin online: catalog de produse, filtre și coș de cumpărături. Exemplu construit de CreareWebsitePro. Nu este o afacere reală.", url: "/demo/shop" , images: ogImages },
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
