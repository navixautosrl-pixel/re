"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { cart, useCart, useHydrated } from "@/lib/cart";
import { priceCart } from "@/lib/pricing";
import { formatBani } from "@/lib/format";
import { COUNTIES } from "@/lib/counties";
import { fieldErrors, orderSchema } from "@/lib/schemas";
import { site } from "@/config/site";
import { Totals } from "@/components/CartView";
import { t } from "@/i18n/ro";

import { LAST_ORDER_KEY } from "@/lib/cart";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

const SERVER_ERRORS: Record<string, string> = {
  catalog_unconfirmed: "Comenzile online nu sunt încă deschise: lista de prețuri nu a fost confirmată. Coșul tău rămâne salvat — ne poți scrie între timp din pagina de contact.",
  orders_not_configured: "Comenzile online nu sunt încă activate pe acest site. Coșul tău rămâne salvat — ne poți scrie între timp din pagina de contact.",
  delivery_failed: "Comanda nu a putut fi transmisă din cauza unei erori a serverului. Nu s-a înregistrat nimic; încearcă din nou în câteva minute.",
  rate_limited: t.form.rateLimited,
  bad_origin: "Cererea a fost respinsă din motive de securitate. Reîncarcă pagina și încearcă din nou.",
};

const FIELD_ORDER = ["items", "name", "phone", "email", "county", "city", "address", "postalCode", "notes", "payment", "terms"];

export function CheckoutForm({ ordersOpen }: { ordersOpen: boolean }) {
  const lines = useCart();
  const hydrated = useHydrated();
  const router = useRouter();
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const priced = priceCart(lines);

  if (!hydrated) return <div className="min-h-[30rem]" aria-busy="true" />;
  if (!priced.lines.length)
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-white/20 px-6 py-16 text-center">
        <p className="display-2 text-[length:var(--step-2)]">{t.cart.empty}</p>
        <p className="mt-2 text-mist-2">Adaugă produse în coș înainte de a finaliza comanda.</p>
        <Link href="/magazin" className="btn btn-primary mt-8">Mergi la magazin</Link>
      </div>
    );

  const f = (name: string) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });
  const err = (name: string) => errors[name] && <p id={`${id}-${name}-err`} className="field-error">{errors[name]}</p>;

  function focusFirst(errs: Record<string, string>) {
    const first = FIELD_ORDER.find((k) => errs[k]);
    requestAnimationFrame(() => {
      summaryRef.current?.focus();
      if (first) document.getElementById(`${id}-${first}`)?.scrollIntoView({ block: "center" });
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const fd = new FormData(e.currentTarget);
    const data = {
      items: lines,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      county: String(fd.get("county") ?? ""),
      city: String(fd.get("city") ?? ""),
      address: String(fd.get("address") ?? ""),
      postalCode: String(fd.get("postalCode") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      payment: String(fd.get("payment") ?? ""),
      terms: fd.get("terms") === "on",
      website: String(fd.get("website") ?? ""),
    };
    const local = orderSchema.safeParse(data);
    if (!local.success) {
      const errs = fieldErrors(local.error);
      setErrors(errs);
      setStatus({ kind: "idle" });
      focusFirst(errs);
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string>; orderId?: string; summary?: unknown };
      if (res.ok && body.ok) {
        try {
          sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderId: body.orderId, summary: body.summary, email: data.email }));
        } catch {
          /* the confirmation page falls back to a generic message */
        }
        cart.clear();
        router.push("/comanda-trimisa");
        return;
      }
      if (body.error === "validation" && body.fields) {
        setErrors(body.fields);
        setStatus({ kind: "idle" });
        focusFirst(body.fields);
        return;
      }
      setStatus({ kind: "error", message: SERVER_ERRORS[body.error ?? ""] ?? t.form.networkError });
    } catch {
      setStatus({ kind: "error", message: t.form.networkError });
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const errorList = Object.entries(errors);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <form noValidate onSubmit={onSubmit} className="space-y-10" aria-describedby={!ordersOpen ? `${id}-closed` : undefined}>
        <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="assertive">
          {errorList.length > 0 && (
            <div className="rounded-[var(--radius-panel)] border-[1.5px] border-danger bg-danger/10 p-5">
              <p className="font-semibold">{t.form.fix}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errorList.map(([k, m]) => (
                  <li key={k}><a className="link" href={`#${id}-${k}`}>{m}</a></li>
                ))}
              </ul>
            </div>
          )}
          {status.kind === "error" && (
            <div className="rounded-[var(--radius-panel)] border-[1.5px] border-danger bg-danger/10 p-5" role="alert">
              <p>{status.message}</p>
              {!ordersOpen && <Link href="/contact" className="link mt-2 inline-block font-semibold">Pagina de contact</Link>}
            </div>
          )}
        </div>

        <fieldset className="space-y-5">
          <legend className="display-2 mb-4 text-[length:var(--step-2)]">Date de contact</legend>
          <div>
            <label className="field-label" htmlFor={`${id}-name`}>Nume și prenume</label>
            <input {...f("name")} className="field" autoComplete="name" required />
            {err("name")}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor={`${id}-phone`}>Telefon</label>
              <input {...f("phone")} className="field" type="tel" autoComplete="tel" inputMode="tel" required />
              {err("phone")}
            </div>
            <div>
              <label className="field-label" htmlFor={`${id}-email`}>E-mail</label>
              <input {...f("email")} className="field" type="email" autoComplete="email" required />
              {err("email")}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="display-2 mb-4 text-[length:var(--step-2)]">Adresa de livrare</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor={`${id}-county`}>Județ</label>
              <select {...f("county")} className="field" autoComplete="address-level1" defaultValue="" required>
                <option value="" disabled>Alege județul</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {err("county")}
            </div>
            <div>
              <label className="field-label" htmlFor={`${id}-city`}>Localitate</label>
              <input {...f("city")} className="field" autoComplete="address-level2" required />
              {err("city")}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor={`${id}-address`}>Adresă</label>
            <input {...f("address")} className="field" autoComplete="street-address" placeholder="Stradă, număr, bloc, scară, apartament" required />
            {err("address")}
          </div>
          <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
            <div>
              <label className="field-label" htmlFor={`${id}-postalCode`}>Cod poștal <span className="font-normal text-mist-2">({t.form.optional})</span></label>
              <input {...f("postalCode")} className="field" autoComplete="postal-code" inputMode="numeric" maxLength={6} />
              {err("postalCode")}
            </div>
            <div>
              <label className="field-label" htmlFor={`${id}-notes`}>Observații <span className="font-normal text-mist-2">({t.form.optional})</span></label>
              <input {...f("notes")} className="field" maxLength={500} />
              {err("notes")}
            </div>
          </div>
        </fieldset>

        <fieldset aria-describedby={errors.payment ? `${id}-payment-err` : undefined}>
          <legend className="display-2 mb-4 text-[length:var(--step-2)]">Plata</legend>
          <div className="space-y-3" id={`${id}-payment`} tabIndex={-1}>
            {site.payment.methods.map((m, i) => (
              <label key={m.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-btn)] border-[1.5px] border-white/25 px-4 has-checked:border-cyan has-checked:bg-cyan/10">
                <input type="radio" name="payment" value={m.id} defaultChecked={i === 0} className="size-5 accent-[var(--cyan)]" />
                <span className="font-semibold">{m.label}</span>
              </label>
            ))}
          </div>
          {err("payment")}
          <p className="mt-3 text-[length:var(--step--1)] text-mist-2">
            Plata cu cardul nu e disponibilă online.
            {site.payment.methods.some((m) => !m.confirmed) && " Metodele de plată și costul livrării se confirmă de RbtFishPro după primirea comenzii."}
          </p>
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech, bots fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input {...f("terms")} type="checkbox" className="mt-0.5 size-6 shrink-0 accent-[var(--cyan)]" />
            <span>
              Am citit și accept <Link href="/termeni-si-conditii" className="link">termenii și condițiile</Link> și{" "}
              <Link href="/politica-de-confidentialitate" className="link">politica de confidențialitate</Link>.
            </span>
          </label>
          {err("terms")}
        </div>

        <button type="submit" className="btn btn-primary w-full sm:w-auto sm:min-w-[18rem]" aria-disabled={status.kind === "sending"}>
          {status.kind === "sending" ? t.form.sending : site.catalog.pricesConfirmed ? "Comandă cu obligație de plată" : "Trimite comanda"}
        </button>
        <p className="text-[length:var(--step--1)] text-mist-2">
          Trimiterea comenzii nu debitează niciun card. Primești numărul comenzii pe ecran imediat după trimitere.
        </p>
      </form>

      <aside aria-labelledby={`${id}-sum`} className="rounded-[var(--radius-panel)] bg-night-2 p-6 lg:sticky lg:top-24">
        <h2 id={`${id}-sum`} className="display-2 text-[length:var(--step-2)]">Comanda ta</h2>
        <ul className="mt-4 space-y-3">
          {priced.lines.map((l) => (
            <li key={`${l.slug}-${l.diameter}`} className="flex justify-between gap-4">
              <span>{l.qty} × {l.product.name}, {l.diameter} mm</span>
              <span className="tabular shrink-0">{formatBani(l.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-white/10 pt-5"><Totals compact subtotal={priced.subtotal} shipping={priced.shipping} total={priced.total} /></div>
        <Link href="/cos" className="link mt-5 inline-block">Modifică coșul</Link>
        {!ordersOpen && (
          <p id={`${id}-closed`} className="mt-5 rounded-[var(--radius-btn)] border-[1.5px] border-dashed border-lamp p-4 text-[length:var(--step--1)] text-lamp">
            Comenzile online nu sunt încă activate pe acest site (prețuri sau livrarea comenzilor neconfigurate). Poți completa formularul, dar comanda nu va fi trimisă până la activare.
          </p>
        )}
      </aside>
    </div>
  );
}
