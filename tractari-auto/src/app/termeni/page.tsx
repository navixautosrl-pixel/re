import { PRICING } from "@/config/pricing";
import { LegalPage, Operator } from "@/components/LegalPage";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = { ...pageMeta({ title: "Termeni și condiții", description: "Condițiile serviciului de tractare.", path: "/termeni/" }), robots: { index: false } };

export default function Terms() {
  return (
    <LegalPage title="Termeni și condiții">
      <h2>Prestator</h2>
      <p><Operator />.</p>
      <h2>Prețul</h2>
      <p>Prețul din calculator este estimativ și se confirmă la telefon înainte de plecare. Staționarea: {PRICING.freeWaitMinutes} de minute gratuit, apoi {PRICING.waitPerHour} lei pe oră.</p>
      <h2>Plata și răspunderea</h2>
      <p><Placeholder field="terms.payment">metode de plată, factură, asigurarea mărfii transportate, răspunderea pentru daune</Placeholder></p>
      <h2>Reclamații</h2>
      <p>La datele de contact de mai sus sau la ANPC (anpc.ro).</p>
    </LegalPage>
  );
}
