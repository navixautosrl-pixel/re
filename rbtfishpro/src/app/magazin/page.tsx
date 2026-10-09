import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShopClient, ShopView } from "@/components/ShopClient";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Boilies pentru crap — magazin online",
  description: "Cumpără boilies RbtFishPro pentru pescuitul la crap: Fishmeal și Birdfood, patru rețete, în 20 sau 24 mm. Caută, filtrează după bază și adaugă în coș.",
  path: "/magazin",
});

export default function ShopPage() {
  return (
    <div className="wrap pb-24 pt-24">
      <Breadcrumbs items={[{ name: "Magazin", path: "/magazin" }]} />
      <header className="mt-6 mb-10 max-w-3xl">
        <h1 className="display text-[length:var(--step-4)]">Boilies pentru crap</h1>
        <p className="mt-4 text-[length:var(--step-1)] text-mist-2">
          Patru rețete pe două baze, fiecare în 20 sau 24 mm.{" "}
          {site.catalog.pricesConfirmed ? "" : "Prețurile afișate sunt exemple până la confirmarea listei de prețuri."}
        </p>
      </header>
      {/* Without JS (or before hydration) the full catalogue is server-rendered. */}
      <Suspense fallback={<ShopView />}>
        <ShopClient />
      </Suspense>
    </div>
  );
}
