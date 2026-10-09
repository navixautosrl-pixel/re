"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { bySlug } from "@/data/products";

/**
 * Water-temperature guide. Rules come from general carp-fishing practice
 * (.claude/skills/boilies-expert/knowledge.md, "consens practic" tier) — labelled
 * as orientative, never as a test result or a promise of catches.
 */
const BANDS = [
  {
    id: "rece",
    label: "Sub 10 °C",
    title: "Apă rece",
    picks: ["boilies-birdfood-scopex", "boilies-birdfood-capsuni"],
    size: "20 mm",
    text: "Crapul mănâncă puțin și în ferestre scurte. Bazele dulci, mai ușor de digerat, sunt alegerea obișnuită. Nădire foarte puțină: câteva boilies lângă montură, nu kilograme.",
  },
  {
    id: "primavara",
    label: "10–15 °C",
    title: "Apa se încălzește",
    picks: ["boilies-fishmeal-squid-pruna", "boilies-birdfood-scopex"],
    size: "20 mm",
    text: "Activitatea crește de la o zi la alta — tendința contează cât temperatura. Merge oricare dintre baze; nădire moderată, crescută treptat.",
  },
  {
    id: "vara",
    label: "15–24 °C",
    title: "Sezonul plin",
    picks: ["boilies-fishmeal", "boilies-fishmeal-squid-pruna"],
    size: "20 sau 24 mm",
    text: "Digestie rapidă: bazele de pește sunt alegerea obișnuită. Cantitatea de nadă poate crește, după câți pești sunt în zonă.",
  },
  {
    id: "canicula",
    label: "Peste 25 °C",
    title: "Caniculă",
    picks: ["boilies-fishmeal"],
    size: "24 mm, dacă e mult pește mărunt",
    text: "Oxigen mai puțin în apă; peștii se hrănesc mai ales noaptea și dimineața. Nădire moderată — nada nemâncată se strică repede pe căldură.",
  },
] as const;

export function BaitGuide() {
  const [band, setBand] = useState<(typeof BANDS)[number]["id"]>("vara");
  const id = useId();
  const b = BANDS.find((x) => x.id === band)!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14">
      <fieldset>
        <legend className="field-label mb-3">Temperatura apei, la adâncimea unde pescuiești</legend>
        <div className="grid grid-cols-2 gap-2">
          {BANDS.map((x) => (
            <label
              key={x.id}
              className="flex min-h-16 cursor-pointer flex-col justify-center rounded-[var(--radius-btn)] border-[1.5px] border-white/20 px-4 py-2 transition-colors hover:border-mist-2 has-checked:border-cyan has-checked:bg-cyan has-checked:text-night has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-cyan"
            >
              <input type="radio" name={`${id}-band`} value={x.id} checked={band === x.id} onChange={() => setBand(x.id)} className="sr-only" />
              <span className="tabular display-2 text-[1.5rem]">{x.label}</span>
              <span className="text-[length:var(--step--1)] font-semibold opacity-80">{x.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="rounded-[var(--radius-panel)] border border-white/10 bg-night-2 p-6 sm:p-8">
        <h3 className="display-2 text-[length:var(--step-2)]">{b.title}: <span className="text-cyan">{b.label}</span></h3>
        <p className="mt-3 text-mist-2">{b.text}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Rețete potrivite</dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {b.picks.map((s) => (
                  <li key={s}><Link className="link" href={`/produse/${s}`}>{bySlug(s)!.name}</Link></li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Diametru</dt>
            <dd className="mt-1 text-mist-2">{b.size}</dd>
          </div>
        </dl>
        <p className="mt-6 border-t border-white/10 pt-4 text-[length:var(--step--1)] text-mist-2">
          Orientativ, din practica generală a pescuitului la crap. Nu e un rezultat de test al produselor și nu garantează capturi.
        </p>
      </div>
    </div>
  );
}
