import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica cookie" };

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Politica cookie"
      sections={[
        { heading: "1. Ce cookie-uri folosim", note: "Doar cookie-uri strict necesare (reținerea preferinței de consimțământ) — niciun cookie de analytics/marketing în acest moment." },
        { heading: "2. Actualizări", note: "Dacă se adaugă analytics/marketing pe viitor, această pagină va fi actualizată și consimțământul cerut din nou." },
      ]}
    />
  );
}
