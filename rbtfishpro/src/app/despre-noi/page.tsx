import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Picture } from "@/components/Picture";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Despre RbtFishPro",
  description: "RbtFishPro face boilies pentru pescuitul la crap: o gamă scurtă de patru rețete, pe baze Fishmeal și Birdfood, în 20 și 24 mm.",
  path: "/despre-noi",
});

export default function AboutPage() {
  return (
    <>
      <div className="wrap pt-24">
        <Breadcrumbs items={[{ name: "Despre noi", path: "/despre-noi" }]} />
        <h1 className="display mt-6 max-w-4xl text-[length:var(--step-4)]">Boilies pentru pescarii de crap</h1>
      </div>

      <section className="wrap mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <figure className="grain relative overflow-hidden rounded-[var(--radius-panel)]">
          <Picture
            base="/img/catch-night"
            widths={[480, 800, 1045]}
            width={1045}
            height={1040}
            sizes="(min-width: 1024px) 52vw, 100vw"
            alt="Pescar ținând un crap de 17 kg noaptea, la Balta Lazăr din Alexandria"
            className="h-auto w-full"
          />
          <figcaption className="absolute bottom-4 left-4 text-[length:var(--step--1)] text-lamp">Crap de 17 kg, Balta Lazăr din Alexandria</figcaption>
        </figure>
        <div className="space-y-6 text-[length:var(--step-1)]">
          <p>
            RbtFishPro face boilies pentru pescuitul la crap. Gama e scurtă intenționat: două baze, Fishmeal și Birdfood, patru rețete și două diametre — 20 și 24 mm.
          </p>
          <p className="text-mist-2">
            Pe eticheta Fishmeal scrie „Built for real fishermen” — făcut pentru pescari adevărați. Rețeta Fishmeal simplă e fără aromă, fără conservanți și fără arome artificiale.
          </p>
          <div className="space-y-3 rounded-[var(--radius-panel)] border border-dashed border-lamp/60 p-5 text-[length:var(--step-0)]">
            <p className="font-semibold text-lamp">De completat de RbtFishPro</p>
            <ul className="space-y-2">
              <li><Placeholder field="about.story">cine face boiliesurile și de când</Placeholder></li>
              <li><Placeholder field="about.production">unde și cum sunt produse (rulare, fierbere, uscare)</Placeholder></li>
              <li><Placeholder field="about.testing">pe ce ape au fost folosite — doar date reale</Placeholder></li>
              <li><Placeholder field="about.photo">fotografii reale din producție și cu ambalajul</Placeholder></li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/magazin" className="btn btn-primary">Vezi rețetele</Link>
            <Link href="/contact" className="btn btn-ghost">Contact</Link>
          </div>
        </div>
      </section>
      <div className="pb-24" />
    </>
  );
}
