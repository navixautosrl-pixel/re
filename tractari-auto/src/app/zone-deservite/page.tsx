import { site } from "@/config/site";
import { LandingCards } from "@/components/LandingCards";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Zone deservite: Chiajna, Militari, A1, Centura",
  description: "Tractări auto non-stop în Chiajna, Militari, pe A1 București–Pitești, pe Centura București și în zonele din jur: Ilfov și sectoarele 1–6.",
  path: "/zone-deservite/",
});

export default function Zone() {
  return (
    <div className="wrap pb-20 pt-24 md:pt-28">
      <h1 className="text-[length:var(--step-4)]">Zone deservite</h1>
      <p className="mt-4 max-w-[55ch] text-[length:var(--step-1)] text-ink-2">{site.serviceArea}. Alege zona pentru detalii, exemple de preț și ce faci până ajunge platforma.</p>
      <div className="mt-10"><LandingCards group="zona" headingLevel="h2" /></div>
      <h2 className="mt-16 text-[length:var(--step-3)]">Localități din Ilfov</h2>
      <div className="mt-6"><LandingCards group="localitate" /></div>
      <h2 className="mt-16 text-[length:var(--step-3)]">Sectoarele Bucureștiului</h2>
      <div className="mt-6"><LandingCards group="sector" /></div>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Zone", path: "/zone-deservite/" }])} />
    </div>
  );
}
