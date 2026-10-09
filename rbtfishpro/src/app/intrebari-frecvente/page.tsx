import Link from "next/link";
import { FAQ } from "@/data/faq";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/Faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Întrebări frecvente despre boilies RbtFishPro",
  description: "Diferența dintre Fishmeal și Birdfood, ce diametru alegi, comandă, plată, livrare și retur pentru boilies RbtFishPro.",
  path: "/intrebari-frecvente",
});

export default function FaqPage() {
  return (
    <div className="wrap pb-24 pt-24">
      <Breadcrumbs items={[{ name: "Întrebări frecvente", path: "/intrebari-frecvente" }]} />
      <h1 className="display mt-6 text-[length:var(--step-4)]">Întrebări frecvente</h1>
      <div className="mt-10 max-w-4xl">
        <FaqList items={FAQ} headingLevel="h2" />
        <p className="mt-10 text-mist-2">
          Nu ai găsit răspunsul? <Link href="/contact" className="link">Scrie-ne</Link>.
        </p>
      </div>
    </div>
  );
}
