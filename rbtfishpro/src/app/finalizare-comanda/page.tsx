import { connection } from "next/server";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/config/site";
import { sinkFor } from "@/lib/server/deliver";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Finalizare comandă", description: "Finalizează comanda de boilies RbtFishPro.", path: "/finalizare-comanda", noindex: true });

export default async function CheckoutPage() {
  await connection(); // read the order configuration at request time, not at build time
  const ordersOpen = (site.catalog.pricesConfirmed || process.env.ALLOW_PLACEHOLDER_ORDERS === "true") && sinkFor("orders") !== null;
  return (
    <div className="wrap pb-24 pt-24">
      <Breadcrumbs items={[{ name: "Coș", path: "/cos" }, { name: "Finalizare comandă", path: "/finalizare-comanda" }]} />
      <h1 className="display mb-10 mt-6 text-[length:var(--step-4)]">Finalizare comandă</h1>
      <CheckoutForm ordersOpen={ordersOpen} />
    </div>
  );
}
