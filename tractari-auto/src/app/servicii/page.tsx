import Link from "next/link";
import { VEHICLES } from "@/config/pricing";
import { VehicleArt } from "@/components/Vehicles";
import { CallButtons } from "@/components/CallButtons";
import { Placeholder } from "@/components/Placeholder";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Servicii: tractări auto și transport pe platformă",
  description: "Tractări și transport pe platformă pentru motociclete, autoturisme, SUV-uri, microbuze și autoutilitare până la 7,5 tone, inclusiv mașini avariate.",
  path: "/servicii/",
});

const SERVICES = [
  { t: "Tractare după avarie sau pană", d: "Mașina nu mai pornește sau a fost implicată într-un accident: o încărcăm pe platformă și o ducem la service sau acasă." },
  { t: "Transport auto pe platformă", d: "Mașini cumpărate din alt oraș, mutări, drumuri la dealer sau la ITP — fără kilometri în plus pe bordul mașinii." },
  { t: "Mașini avariate, cu roți blocate", d: "Încărcare cu echipament suplimentar. Bifează opțiunea în calculator; suplimentul se confirmă la telefon." },
];

export default function Services() {
  return (
    <div className="pb-20 pt-24 md:pt-28">
      <div className="wrap">
        <h1 className="max-w-[18ch] text-[length:var(--step-4)]">Ce transportăm</h1>
        <p className="mt-4 max-w-[55ch] text-[length:var(--step-1)] text-ink-2">Pe platformă, de la motociclete la autoutilitare de 7,5 tone. Prețul îl afli din <Link href="/calculator/" className="link">calculator</Link>.</p>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 80} className="rounded-[var(--radius-l)] bg-card p-6 ring-1 ring-rule">
              <h2 className="text-[length:var(--step-2)]">{s.t}</h2>
              <p className="mt-3 text-ink-2">{s.d}</p>
            </Reveal>
          ))}
        </ul>

        <h2 className="mt-20 text-[length:var(--step-3)]">Vehicule</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {VEHICLES.map((v, i) => (
            <Reveal as="li" key={v.id} delay={i * 60}>
              <Link href={`/calculator/?vehicul=${v.id}`} className="group block rounded-[var(--radius-l)] bg-card p-5 ring-1 ring-rule transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(20,30,50,.5)]">
                <VehicleArt id={v.id} className="h-16 w-full transition-transform duration-300 group-hover:-translate-x-1.5" />
                <span className="mt-3 block text-[length:var(--step-1)] font-[800]">{v.name}</span>
                <span className="block text-[length:var(--step--1)] text-ink-2">{v.weight}</span>
                <span className="mt-2 block font-[700] text-sign">Calculează prețul</span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 rounded-[var(--radius-l)] border-2 border-dashed border-[#b7791f] p-6">
          <p className="font-[750]">De completat de firmă</p>
          <ul className="mt-3 space-y-2">
            <li><Placeholder field="services.fleet">platformele din flotă (capacitate, lungime)</Placeholder></li>
            <li><Placeholder field="services.photos">fotografii reale cu platformele și tractări făcute</Placeholder></li>
            <li><Placeholder field="services.extra">alte servicii reale (ex. transport utilaje, internațional)</Placeholder></li>
          </ul>
        </div>
        <CallButtons className="mt-12" size="lg" />
      </div>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Servicii", path: "/servicii/" }])} />
    </div>
  );
}
