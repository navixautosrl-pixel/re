import { CartView } from "@/components/CartView";
import { pageMeta } from "@/lib/seo";
import { t } from "@/i18n/ro";

export const metadata = pageMeta({ title: "Coș", description: "Coșul de cumpărături RbtFishPro.", path: "/cos", noindex: true });

export default function CartPage() {
  return (
    <div className="wrap pb-24 pt-28">
      <h1 className="display mb-10 text-[length:var(--step-4)]">{t.cart.title}</h1>
      <CartView />
    </div>
  );
}
