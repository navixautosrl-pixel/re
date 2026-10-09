"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { products, RANGES, type Range } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

type Sort = "recomandat" | "pret-asc" | "pret-desc" | "nume";
const SORTS: { id: Sort; label: string }[] = [
  { id: "recomandat", label: "Ordinea gamei" },
  { id: "pret-asc", label: "Preț crescător" },
  { id: "pret-desc", label: "Preț descrescător" },
  { id: "nume", label: "Nume (A–Z)" },
];
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function ShopGrid({ items }: { items: typeof products }) {
  return (
    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p, i) => (
        <li key={p.slug}>
          <ProductCard p={p} headingLevel="h2" eager={i < 4} />
        </li>
      ))}
    </ul>
  );
}

/** Reads the URL filters (needs a Suspense boundary for static rendering). */
export function ShopClient() {
  const params = useSearchParams();
  const baza = params.get("baza");
  return (
    <ShopView
      initialRange={baza === "fishmeal" || baza === "birdfood" ? baza : "toate"}
      initialQ={params.get("q") ?? ""}
      initialSort={SORTS.find((s) => s.id === params.get("ordine"))?.id ?? "recomandat"}
    />
  );
}

/** Also the server-rendered fallback (defaults), so hydration doesn't shift the layout. */
export function ShopView({ initialRange = "toate", initialQ = "", initialSort = "recomandat" }: { initialRange?: Range | "toate"; initialQ?: string; initialSort?: Sort }) {
  const router = useRouter();
  const id = useId();
  const [range, setRange] = useState<Range | "toate">(initialRange);
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<Sort>(initialSort);
  // Footer links like /magazin?baza=fishmeal can change the URL while this page is open:
  // follow them (state adjusted during render, React's recommended pattern — no remount, focus kept).
  const [seenRange, setSeenRange] = useState(initialRange);
  if (seenRange !== initialRange) {
    setSeenRange(initialRange);
    setRange(initialRange);
  }
  const query = useDeferredValue(q);

  const shown = useMemo(() => {
    const needle = norm(query.trim());
    const list = products.filter(
      (p) => (range === "toate" || p.range === range) && (!needle || norm(`${p.name} ${p.flavour} ${RANGES[p.range].label} boilies`).includes(needle)),
    );
    if (sort === "pret-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "pret-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "nume") list.sort((a, b) => a.name.localeCompare(b.name, "ro"));
    return list;
  }, [query, range, sort]);

  // Keep the URL shareable without adding history entries.
  function sync(next: { baza?: string; q?: string; ordine?: string }) {
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "toate" || v === "recomandat") sp.delete(k);
      else sp.set(k, v);
    }
    const s = sp.toString();
    router.replace(s ? `/magazin?${s}` : "/magazin", { scroll: false });
  }

  return (
    <>
      <div className="flex flex-col gap-5 border-y border-white/10 py-5 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label="Bază" className="flex flex-wrap gap-2">
          {(["toate", "fishmeal", "birdfood"] as const).map((r) => {
            const n = r === "toate" ? products.length : products.filter((p) => p.range === r).length;
            return (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => {
                  setRange(r);
                  sync({ baza: r });
                }}
                className="min-h-11 rounded-[var(--radius-btn)] border-[1.5px] border-white/25 px-4 font-semibold transition-colors hover:border-mist-2 aria-pressed:border-cyan aria-pressed:bg-cyan aria-pressed:text-night"
              >
                {r === "toate" ? "Toate" : RANGES[r].label} <span className="tabular opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="sm:w-72">
            <label htmlFor={`${id}-q`} className="field-label">Caută</label>
            <input
              id={`${id}-q`}
              type="search"
              className="field"
              placeholder="ex. scopex, squid, căpșună"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => sync({ q: q.trim() })}
              autoComplete="off"
            />
          </div>
          <div className="sm:w-56">
            <label htmlFor={`${id}-s`} className="field-label">Ordonează</label>
            <select
              id={`${id}-s`}
              className="field"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                sync({ ordine: e.target.value });
              }}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-4 text-mist-2">
        {shown.length === 1 ? "1 produs" : `${shown.length} produse`}
        {query.trim() ? ` pentru „${query.trim()}”` : ""}
      </p>

      <div className="mt-6">
        {shown.length ? (
          <ShopGrid items={shown} />
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-white/20 px-6 py-14 text-center">
            <p className="display-2 text-[length:var(--step-2)]">Nicio rețetă nu se potrivește</p>
            <p className="mt-2 text-mist-2">Gama are patru rețete: Fishmeal, Fishmeal Squid &amp; Prună, Birdfood Scopex și Birdfood Căpșună.</p>
            <button
              type="button"
              className="btn btn-ghost mt-6"
              onClick={() => {
                setQ("");
                setRange("toate");
                sync({ q: "", baza: "toate" });
              }}
            >
              Arată toate
            </button>
          </div>
        )}
      </div>
    </>
  );
}
