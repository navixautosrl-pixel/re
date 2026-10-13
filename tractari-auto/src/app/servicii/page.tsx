import Link from "next/link";
import { VEHICLES } from "@/config/pricing";
import { VehicleArt } from "@/components/Vehicles";
import { CallButtons } from "@/components/CallButtons";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { LandingCards } from "@/components/LandingCards";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Servicii tractări auto și transport pe platformă",
  description: "Tractări și transport pe platformă pentru motociclete, autoturisme, SUV-uri, microbuze și autoutilitare până la 7,5 tone, inclusiv mașini avariate.",
  path: "/servicii/",
});

const SERVICES = [
  { t: "Tractare după avarie sau pană", d: "Mașina nu mai pornește sau a fost implicată într-un accident: o încărcăm pe platformă și o ducem la service sau acasă." },
  { t: "Transport auto pe platformă", d: "Mașini cumpărate din alt oraș, mutări, drumuri la dealer sau la ITP — fără kilometri în plus pe bordul mașinii." },
  { t: "Mașini avariate, cu roți blocate", d: "Încărcare cu echipament suplimentar. Bifează opțiunea în calculator: taxa de manipulare cu căruciorul este de 60 de lei pentru fiecare roată blocată." },
];

export default function Services() {
  return (
    <div className="pb-20 pt-24 md:pt-28">
      <div className="wrap">
        <h1 className="max-w-[18ch] text-[length:var(--step-4)]">Ce transportăm</h1>
        <p className="mt-4 max-w-[55ch] text-[length:var(--step-1)] text-ink-2">Pe platformă, de la motociclete la autoutilitare de 7,5 tone. Prețul îl afli din <Link href="/calculator/" className="link">calculator</Link>.</p>

        <div className="mt-12"><LandingCards group="serviciu" headingLevel="h2" /></div>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 80} className="rounded-[var(--radius-l)] bg-card p-6 ring-1 ring-rule">
              <h2 className="text-[length:var(--step-1)]">{s.t}</h2>
              <p className="mt-3 text-ink-2">{s.d}</p>
            </Reveal>
          ))}
        </ul>

        <h2 className="mt-20 text-[length:var(--step-3)]">Vehicule</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {VEHICLES.map((v, i) => (
            <Reveal as="li" key={v.id} delay={i * 60}>
              <Link href={`/calculator/?vehicul=${v.id}`} className="veh-card group block rounded-[var(--radius-l)] bg-card p-5 ring-1 ring-rule transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(20,30,50,.5)]">
                <VehicleArt id={v.id} className="h-20 w-full" />
                <span className="mt-3 block text-[length:var(--step-1)] font-[800]">{v.name}</span>
                <span className="block text-[length:var(--step--1)] text-ink-2">{v.weight}</span>
                <span className="mt-2 block font-[700] text-sign">Calculează prețul</span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <h2 className="mt-20 text-[length:var(--step-3)]">Cum lucrăm: dispecerat non-stop</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-l)] bg-card p-6 ring-1 ring-rule">
            <h3 className="text-[length:var(--step-1)] font-[800] tracking-normal">Platforme partenere</h3>
            <p className="mt-2 text-ink-2">Suntem dispecerat și colaborăm cu mai multe firme de transport pe platformă. Când suni, trimitem cea mai apropiată platformă disponibilă în acel moment.</p>
          </div>
          <div className="rounded-[var(--radius-l)] bg-card p-6 ring-1 ring-rule">
            <h3 className="text-[length:var(--step-1)] font-[800] tracking-normal">Timpul de sosire</h3>
            <p className="mt-2 text-ink-2">Depinde de zonă, de trafic și de locul de unde pleacă platforma. Ți-l spunem la telefon, înainte să confirmi comanda.</p>
          </div>
          <div className="rounded-[var(--radius-l)] bg-card p-6 ring-1 ring-rule">
            <h3 className="text-[length:var(--step-1)] font-[800] tracking-normal">Plata</h3>
            <p className="mt-2 text-ink-2">Numerar (cash) la finalul transportului sau transfer bancar. Factura se emite la cerere, pe persoană fizică sau firmă.</p>
          </div>
        </div>
        <CallButtons className="mt-12" size="lg" />
      </div>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Servicii", path: "/servicii/" }])} />
    </div>
  );
}
