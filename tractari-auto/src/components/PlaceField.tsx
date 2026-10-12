"use client";

import { useEffect, useId, useRef, useState } from "react";
import { autocomplete, type Suggestion } from "@/lib/maps";

/** Accessible combobox (ARIA 1.2 pattern) over Places autocomplete. */
export function PlaceField({ label, value, onPick, sessionToken, placeholder }: {
  label: string;
  value: Suggestion | null;
  onPick: (s: Suggestion | null) => void;
  sessionToken: string;
  placeholder: string;
}) {
  const id = useId();
  const [text, setText] = useState(value?.text ?? "");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => () => { window.clearTimeout(timer.current); ctrl.current?.abort(); }, []);

  function onInput(v: string) {
    setText(v);
    onPick(null);
    window.clearTimeout(timer.current);
    if (v.trim().length < 3) { setItems([]); setOpen(false); return; }
    timer.current = window.setTimeout(async () => {
      ctrl.current?.abort();
      ctrl.current = new AbortController();
      try {
        const res = await autocomplete(v.trim(), sessionToken, ctrl.current.signal);
        setItems(res); setOpen(res.length > 0); setActive(-1); setError(res.length ? "" : "Nicio adresă găsită.");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Căutarea adreselor nu răspunde. Poți introduce kilometrii manual.");
      }
    }, 250);
  }

  function pick(s: Suggestion) {
    setText(s.text); setOpen(false); setItems([]); onPick(s);
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block font-[700]">{label}</label>
      <input
        id={id}
        className="field"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => onInput(e.target.value)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(items[active]); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && (
        <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-[var(--radius-s)] border border-rule bg-card py-1 shadow-xl">
          {items.map((s, i) => (
            <li
              key={s.placeId}
              id={`${id}-o${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              className="cursor-pointer px-4 py-2.5 aria-selected:bg-concrete-2 hover:bg-concrete-2"
            >
              {s.text}
            </li>
          ))}
        </ul>
      )}
      {error && <p id={`${id}-err`} className="mt-1 text-[length:var(--step--1)] text-danger">{error}</p>}
    </div>
  );
}
