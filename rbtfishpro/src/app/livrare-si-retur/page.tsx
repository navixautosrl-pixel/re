import Link from "next/link";
import { site } from "@/config/site";
import { LegalPage, Operator } from "@/components/LegalPage";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Livrare și retur", description: "Condițiile de livrare și retur pentru comenzile RbtFishPro.", path: "/livrare-si-retur", noindex: true });

export default function Delivery() {
  const s = site.shipping;
  return (
    <LegalPage title="Livrare și retur" path="/livrare-si-retur" updated="9 octombrie 2026">
      <h2>Livrare</h2>
      <ul>
        <li>Zonă: România.</li>
        <li>Curier: {s.carriers ?? <Placeholder field="shipping.carriers">firma de curierat</Placeholder>}</li>
        <li>Cost: {s.flatFee != null ? `${s.flatFee} lei` : <Placeholder field="shipping.fee">costul livrării</Placeholder>}{s.freeOver != null ? `, gratuit peste ${s.freeOver} lei` : ""}</li>
        <li>Termen: {s.leadTime ?? <Placeholder field="shipping.leadTime">termenul de livrare</Placeholder>}</li>
      </ul>
      <h2>Dreptul de retragere (retur)</h2>
      <p>
        Dacă ești consumator, te poți retrage din contract în 14 zile de la primirea produselor, fără a preciza motivul (OUG nr. 34/2014). Anunță-ne în scris la
        datele de contact ale operatorului: <Operator />. Poți folosi modelul de formular din Anexa 1 la OUG 34/2014, dar nu este obligatoriu.
      </p>
      <p>
        Banii pentru produse și costul livrării standard se returnează în cel mult 14 zile de la data la care am fost informați, putând fi amânați până primim
        produsele înapoi. Costul direct al returnării produselor{" "}
        <Placeholder field="returns.cost">este suportat de client / de vânzător — de stabilit</Placeholder>.
      </p>
      <p>
        <Placeholder field="returns.exceptions">excepții aplicabile (de ex. produse desigilate) — de stabilit cu juristul, conform art. 16 din OUG 34/2014</Placeholder>
      </p>
      <h2>Produse neconforme sau deteriorate</h2>
      <p>Dacă primești un produs deteriorat sau altul decât cel comandat, scrie-ne cu numărul comenzii și o fotografie. Vezi și <Link className="link" href="/termeni-si-conditii">Termeni și condiții</Link>.</p>
    </LegalPage>
  );
}
