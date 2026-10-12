"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DOCUMENTS, PRICING, VEHICLES, byId, type VehicleId } from "@/config/pricing";
import { site } from "@/config/site";
import { formatHours, formatLei, formatRate, quote } from "@/lib/quote";
import { mapsEnabled, route, type Suggestion } from "@/lib/maps";
import { PlaceField } from "@/components/PlaceField";
import { VehicleArt } from "@/components/Vehicles";
import { CallButtons } from "@/components/CallButtons";

/**
 * Price calculator. Motion (SECONDARY / ambient), no animation library:
 *  - vehicle change: the vehicle drives in from the right (CSS, 0.9 s, wheels rolling, suspension
 *    settle) and then idles on the moving road; selected card lifts, cards roll their wheels on hover
 *  - total: number tweens from the previous value (0.5 s, ease-out); instant under reduced motion
 */
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Counts from the previous total to the new one (0.5 s ease-out); instant under reduced motion. */
function AnimatedLei({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    prev.current = value;
    if (prefersReduced() || from === value) { el.textContent = formatLei(value); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 500);
      el.textContent = formatLei(from + (value - from) * EASE(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span ref={ref} className="tabular">{formatLei(value)}</span>;
}

const uuid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));

/** Reads ?vehicul=suv&km=120 (shareable links); render inside <Suspense fallback={<Calculator />}>. */
export function CalculatorFromUrl({ defaultVehicle, ...props }: { headingLevel?: "h1" | "h2"; defaultVehicle?: VehicleId }) {
  const p = useSearchParams();
  const v = p.get("vehicul");
  const k = Number(p.get("km"));
  return (
    <Calculator
      {...props}
      initialVehicle={v && byId(v) ? (v as VehicleId) : defaultVehicle}
      initialKm={k > 0 ? String(Math.round(k)) : undefined}
    />
  );
}

export function Calculator({ headingLevel = "h2", initialVehicle, initialKm }: { headingLevel?: "h1" | "h2"; initialVehicle?: VehicleId; initialKm?: string }) {
  const H = headingLevel;
  const id = useId();
  const [vehicleId, setVehicleId] = useState<VehicleId>(initialVehicle ?? "hatchback");
  const [damaged, setDamaged] = useState(false);
  const [wheels, setWheels] = useState(1);
  const [useMaps] = useState(mapsEnabled());
  const [manual, setManual] = useState(!mapsEnabled() || Boolean(initialKm));
  const [kmText, setKmText] = useState(initialKm ?? "");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [origin, setOrigin] = useState<Suggestion | null>(null);
  const [dest, setDest] = useState<Suggestion | null>(null);
  const [token] = useState(uuid);
  // Route results are keyed by the origin/destination pair, so a stale one is never shown.
  const routeKey = !manual && origin && dest ? `${origin.placeId}|${dest.placeId}` : null;
  const [routeResult, setRouteResult] = useState<{ key: string; km?: number; hours?: number; error?: boolean } | null>(null);
  const current = routeResult && routeResult.key === routeKey ? routeResult : null;
  const routeKm = current && !current.error && current.km ? { km: current.km, hours: current.hours } : null;
  const routeState: "idle" | "loading" | "error" = !routeKey ? "idle" : !current ? "loading" : current.error ? "error" : "idle";

  useEffect(() => {
    if (!routeKey || !origin || !dest) return;
    const ctrl = new AbortController();
    route(origin.placeId, dest.placeId, ctrl.signal)
      .then((r) => setRouteResult({ key: routeKey, ...r }))
      .catch((e) => { if (e.name !== "AbortError") setRouteResult({ key: routeKey, error: true }); });
    return () => ctrl.abort();
  }, [routeKey, origin, dest]);

  const vehicle = byId(vehicleId)!;
  const kmManual = Number(kmText.replace(",", "."));
  const km = manual ? (Number.isFinite(kmManual) ? kmManual : 0) : routeKm?.km ?? 0;
  const kmInvalid = manual && kmText !== "" && (!Number.isFinite(kmManual) || kmManual <= 0 || kmManual > PRICING.maxKm);
  const q = quote(vehicle, km, { lockedWheels: damaged ? wheels : 0, hours: manual ? undefined : routeKm?.hours });
  const ready = q.km > 0 && !kmInvalid;
  const from = manual ? fromText.trim() : origin?.text ?? "";
  const to = manual ? toText.trim() : dest?.text ?? "";

  const message = ready
    ? [
        "Bună ziua! Aș dori o tractare / transport pe platformă.",
        `Vehicul: ${vehicle.name}${damaged ? ` (avariat, ${wheels} ${wheels === 1 ? "roată blocată" : "roți blocate"})` : ""}.`,
        from && `De la: ${from}.`,
        to && `Până la: ${to}.`,
        `Distanță: ${q.km} km.`,
        `Preț calculat pe site: ${formatLei(q.total)}${q.wheelsPending ? " + supliment roți blocate de confirmat" : ""}.`,
      ].filter(Boolean).join("\n")
    : undefined;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* Inputs */}
        <div className="rounded-[var(--radius-l)] bg-card p-5 shadow-[0_20px_60px_-30px_rgba(20,30,50,.35)] ring-1 ring-rule sm:p-7">
          <H className="text-[length:var(--step-2)]">Calculează prețul</H>
          <p className="mt-1 text-ink-2">Alege vehiculul și traseul. Prețul se actualizează pe loc.</p>

          <fieldset className="mt-6">
            <legend className="mb-3 font-[750]">1. Ce transportăm?</legend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {VEHICLES.map((v) => (
                <label
                  key={v.id}
                  className="veh-card spot group relative flex cursor-pointer flex-col items-center rounded-[var(--radius-m)] border-2 border-rule bg-concrete px-2 pb-3 pt-2 text-center transition duration-200 hover:border-ink-2 has-checked:-translate-y-0.5 has-checked:border-sign has-checked:bg-card has-checked:shadow-[0_10px_24px_-14px_var(--sign)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-sign-2"
                >
                  <input type="radio" name={`${id}-veh`} value={v.id} checked={vehicleId === v.id} onChange={() => setVehicleId(v.id)} className="sr-only" />
                  <VehicleArt id={v.id} className="h-14 w-full max-w-[9.5rem]" />
                  <span className="mt-1 font-[780] leading-tight">{v.name}</span>
                  <span className="text-[0.78rem] leading-snug text-ink-2">{v.weight.replace("Între ", "").replace(" și ", "–")}</span>
                </label>
              ))}
            </div>
            <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-m)] border-2 border-rule px-4 has-checked:border-danger has-checked:bg-danger/5">
              <input type="checkbox" checked={damaged} onChange={(e) => setDamaged(e.target.checked)} className="size-6 shrink-0 accent-[var(--danger)]" />
              <span className="font-[650]">Mașină avariată (roți blocate)</span>
            </label>
            {damaged && (
              <div className="mt-3 rounded-[var(--radius-m)] bg-danger/5 p-4">
                <label htmlFor={`${id}-wheels`} className="block font-[700]">Câte roți sunt blocate?</label>
                <select id={`${id}-wheels`} className="field mt-2 sm:max-w-[10rem]" value={wheels} onChange={(e) => setWheels(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <p className="mt-2 text-[length:var(--step--1)] text-ink-2">Roțile care nu se mai învârt liber (frână blocată, suspensie ruptă, fără roată).</p>
              </div>
            )}
          </fieldset>

          <fieldset className="mt-7">
            <legend className="mb-3 font-[750]">2. De unde și până unde?</legend>
            {!manual && useMaps ? (
              <div className="grid gap-4">
                <PlaceField label="Încărcare" placeholder="Oraș, stradă, număr" value={origin} onPick={setOrigin} sessionToken={token} />
                <PlaceField label="Destinație" placeholder="Oraș, stradă, număr" value={dest} onPick={setDest} sessionToken={token} />
                <p className="text-[length:var(--step--1)] text-ink-2">Adresele sunt căutate cu Google Maps.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${id}-from`} className="mb-1.5 block font-[700]">Încărcare <span className="font-normal text-ink-2">(opțional)</span></label>
                    <input id={`${id}-from`} className="field" placeholder="ex. București" value={fromText} onChange={(e) => setFromText(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`${id}-to`} className="mb-1.5 block font-[700]">Destinație <span className="font-normal text-ink-2">(opțional)</span></label>
                    <input id={`${id}-to`} className="field" placeholder="ex. Cluj-Napoca" value={toText} onChange={(e) => setToText(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${id}-km`} className="mb-1.5 block font-[700]">Distanța traseului (km)</label>
                  <input
                    id={`${id}-km`}
                    className="field tabular text-[length:var(--step-1)] font-[750] sm:max-w-[14rem]"
                    inputMode="decimal"
                    placeholder="ex. 457"
                    value={kmText}
                    aria-invalid={kmInvalid || undefined}
                    aria-describedby={`${id}-km-help`}
                    onChange={(e) => setKmText(e.target.value.replace(/[^\d.,]/g, ""))}
                  />
                  <p id={`${id}-km-help`} className={`mt-1 text-[length:var(--step--1)] ${kmInvalid ? "text-danger" : "text-ink-2"}`}>
                    {kmInvalid ? `Introdu o distanță între 1 și ${PRICING.maxKm} km.` : "Kilometrii pe drum, de la locul de încărcare până la destinație."}
                  </p>
                </div>
              </div>
            )}
            {/* Phones: the result panel is below the fold — echo the total right here. */}
            {ready && (
              <a href={`#${id}-res-panel`} className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-m)] bg-asphalt px-4 py-3 text-paint lg:hidden">
                <span className="font-[700]">Total estimat</span>
                <span className="tabular text-[length:var(--step-1)] font-[850] text-beacon">{formatLei(q.total)}</span>
              </a>
            )}
            {useMaps && (
              <button type="button" className="link mt-3 text-[length:var(--step--1)]" onClick={() => setManual((v) => !v)}>
                {manual ? "Caută adresele pe hartă" : "Introdu kilometrii manual"}
              </button>
            )}
          </fieldset>
        </div>

        {/* Result */}
        <section id={`${id}-res-panel`} aria-labelledby={`${id}-res`} className="on-dark scroll-mt-20 rounded-[var(--radius-l)] bg-asphalt p-5 text-paint sm:p-7 lg:sticky lg:top-24">
          {headingLevel === "h1" ? <h2 id={`${id}-res`} className="sr-only">Rezultatul calculului</h2> : <h3 id={`${id}-res`} className="sr-only">Rezultatul calculului</h3>}
          <div className="stage relative grid h-40 place-items-center overflow-hidden rounded-[var(--radius-m)] bg-[linear-gradient(to_bottom,var(--asphalt-2)_0_72%,var(--asphalt-3)_72%)]" style={{ ["--veh-arch" as string]: "var(--asphalt-2)", ["--veh-shadow" as string]: "rgba(0,0,0,.4)" }}>
            <span aria-hidden="true" className="lane absolute inset-x-0 bottom-[12%] h-1 opacity-50" />
            {/* re-keyed on change → the CSS entrance runs again (slide in from the right) */}
            <div key={vehicleId} className="drive-in mt-4 w-60">
              <VehicleArt id={vehicleId} className="w-full" />
            </div>
            <p className="absolute left-4 top-3 font-[800] text-beacon">{vehicle.name}</p>
            <p className="absolute right-4 top-3 text-[length:var(--step--1)] text-paint/75">{vehicle.weight}</p>
          </div>

          <dl className="tabular mt-5 space-y-2.5">
            {(from || to) && (
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div><dt className="text-[0.8rem] uppercase text-paint/60">Încărcare</dt><dd className="font-[700] text-beacon-2">{from || "—"}</dd></div>
                <div><dt className="text-[0.8rem] uppercase text-paint/60">Destinație</dt><dd className="font-[700] text-beacon-2">{to || "—"}</dd></div>
              </div>
            )}
            <div className="flex justify-between gap-4"><dt>Intra-City</dt><dd className="font-[700]">{q.intraKm} km × {formatRate(q.intraRate)} lei</dd></div>
            <div className="flex justify-between gap-4"><dt>Extra-City</dt><dd className="font-[700]">{q.extraKm} km × {formatRate(q.extraRate)} lei</dd></div>
            {q.band === "short" && (
              <>
                <div className="flex justify-between gap-4"><dt>Taxă încărcare</dt><dd className="font-[700]">{q.loadFee} lei</dd></div>
                <div className="flex justify-between gap-4"><dt>Taxă descărcare</dt><dd className="font-[700]">{q.unloadFee} lei</dd></div>
              </>
            )}
            <div className="flex justify-between gap-4"><dt>Coeficient tarifar</dt><dd className="font-[700]">× {PRICING.multiplier.toLocaleString("ro-RO")}</dd></div>
            <div className="flex justify-between gap-4 text-beacon-2"><dt className="font-[750]">Distanță</dt><dd className="font-[800]">{q.km} km</dd></div>
            <div className="flex justify-between gap-4"><dt>Durată</dt><dd>{ready ? `aprox. ${formatHours(q.hours)}` : "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt>Staționare</dt><dd className="font-[750] text-[oklch(78%_0.15_150)]">{PRICING.freeWaitMinutes} min gratuit</dd></div>
          </dl>
          <p className="mt-2 rounded-[var(--radius-s)] bg-asphalt-2 px-3 py-2 text-[length:var(--step--1)] text-paint/80">
            Peste {PRICING.freeWaitMinutes} de minute de staționare, tariful este {PRICING.waitPerHour} lei pe oră.
          </p>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-5" aria-live="polite" aria-atomic="true">
            <p className="text-[length:var(--step-1)] font-[800]">Total</p>
            <p className="text-right text-[length:var(--step-3)] font-[850] leading-none text-beacon">
              {ready ? <AnimatedLei value={q.total} /> : <span className="text-paint/40">—</span>}
            </p>
          </div>
          {routeState === "loading" && <p className="mt-2 text-paint/75">Se calculează traseul…</p>}
          {routeState === "error" && (
            <p className="mt-2 text-[oklch(75%_0.15_27)]">
              Nu am putut calcula traseul.{" "}
              <button type="button" className="link" onClick={() => setManual(true)}>Introdu kilometrii manual</button>.
            </p>
          )}
          {q.wheelsPending && <p className="mt-2 text-beacon-2">Pentru roțile blocate se adaugă un supliment, confirmat telefonic.</p>}
          {!ready && routeState === "idle" && <p className="mt-2 text-paint/75">{manual ? "Introdu distanța ca să vezi prețul." : "Alege încărcarea și destinația ca să vezi prețul."}</p>}
          <p className="mt-2 text-[length:var(--step--1)] text-paint/70">Tarif pentru o autospecială de tip platformă auto. Preț estimativ, confirmat la telefon.</p>

          <CallButtons text={message} className="mt-5" />

          <details className="group mt-5 rounded-[var(--radius-m)] bg-asphalt-2">
            <summary className="flex min-h-12 items-center justify-between gap-3 px-4 font-[700]">
              Documente necesare pentru transport
              <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <ol className="list-decimal space-y-1.5 px-4 pb-4 pl-9 text-paint/85">
              {DOCUMENTS.map((d) => (
                <li key={d.title}>{d.title}{d.note && <span className="block text-[length:var(--step--1)] text-paint/65">{d.note}</span>}</li>
              ))}
            </ol>
          </details>
          {!site.phone && <p className="sr-only">Numărul de telefon nu este încă configurat.</p>}
          <p className="mt-4 text-[length:var(--step--1)] text-paint/60">
            Vezi și <Link href="/servicii/" className="link">ce include serviciul</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
