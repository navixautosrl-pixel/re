import { OrderConfirmation } from "@/components/OrderConfirmation";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Comandă trimisă", description: "Confirmarea comenzii RbtFishPro.", path: "/comanda-trimisa", noindex: true });

export default function OrderSentPage() {
  return (
    <div className="wrap pb-24 pt-28">
      <OrderConfirmation />
    </div>
  );
}
