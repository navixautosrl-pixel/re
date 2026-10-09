import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { Placeholder } from "@/components/Placeholder";

/** Answers use only facts from the packaging/poster, general carp-fishing practice (labelled as such) or site config. */
export type Faq = { q: string; a: ReactNode; home?: boolean };

export const FAQ: Faq[] = [
  {
    q: "Ce boilies are RbtFishPro?",
    home: true,
    a: (
      <>
        Patru rețete pe două baze: <Link className="link" href="/produse/boilies-fishmeal">Fishmeal</Link> (fără aromă, fără conservanți),{" "}
        <Link className="link" href="/produse/boilies-fishmeal-squid-pruna">Fishmeal cu squid și prună</Link>,{" "}
        <Link className="link" href="/produse/boilies-birdfood-scopex">Birdfood Scopex</Link> și{" "}
        <Link className="link" href="/produse/boilies-birdfood-capsuni">Birdfood Căpșună</Link>. Fiecare se găsește în 20 sau 24 mm.
      </>
    ),
  },
  {
    q: "Care e diferența dintre Fishmeal și Birdfood?",
    home: true,
    a: "Fishmeal are la bază făină de pește; Birdfood are la bază amestecuri de tip hrană pentru păsări, de obicei cu arome dulci. În practica pescuitului la crap, fishmeal-ul e folosit mai ales în apa caldă, iar birdfood-ul tot anul și mai ales când apa e rece. E o regulă orientativă, nu o garanție.",
  },
  {
    q: "Ce diametru aleg: 20 sau 24 mm?",
    home: true,
    a: "20 mm e diametrul folosit cel mai des la crap. 24 mm e mai greu de luat de peștele mărunt, deci e util pe ape cu mult caras sau plătică. Ambele diametre au aceeași rețetă.",
  },
  {
    q: "Boiliesurile Fishmeal au conservanți sau arome artificiale?",
    a: "Varianta Fishmeal simplă este, conform ambalajului, fără aromă, fără conservanți și fără arome artificiale. Pentru celelalte rețete, lista completă de ingrediente se publică pe pagina fiecărui produs.",
  },
  {
    q: "Pot fi consumate de oameni?",
    a: "Nu. Boiliesurile sunt momeală pentru pescuit și sunt inapte consumului uman, așa cum scrie pe ambalaj.",
  },
  {
    q: "Cum comand?",
    home: true,
    a: (
      <>
        Alegi rețeta și diametrul în <Link className="link" href="/magazin">magazin</Link>, adaugi în coș și completezi datele de livrare. Primești pe ecran numărul comenzii, iar
        RbtFishPro o confirmă împreună cu costul livrării și plata.
      </>
    ),
  },
  {
    q: "Cum pot plăti?",
    a: (
      <>
        {site.payment.methods.map((m) => m.label).join(" sau ")}. Plata cu cardul online nu este disponibilă.{" "}
        {site.payment.methods.some((m) => !m.confirmed) && <Placeholder field="payment.confirm">confirmarea metodelor de plată</Placeholder>}
      </>
    ),
  },
  {
    q: "Cât costă livrarea și în cât timp ajunge comanda?",
    a: (
      <>
        {site.shipping.flatFee != null ? `Livrarea costă ${site.shipping.flatFee} lei.` : <Placeholder field="shipping.fee">costul livrării</Placeholder>}{" "}
        {site.shipping.leadTime ?? <Placeholder field="shipping.leadTime">termenul de livrare și curierul</Placeholder>} Detalii în{" "}
        <Link className="link" href="/livrare-si-retur">Livrare și retur</Link>.
      </>
    ),
  },
  {
    q: "Pot returna produsele?",
    a: (
      <>
        Ca persoană fizică, ai dreptul să te retragi dintr-un contract la distanță în 14 zile, conform OUG 34/2014; condițiile exacte pentru momeli (produse
        sigilate, desigilate) sunt în <Link className="link" href="/livrare-si-retur">Livrare și retur</Link>.
      </>
    ),
  },
];
