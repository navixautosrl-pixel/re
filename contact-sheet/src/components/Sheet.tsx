"use client";

import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { frameNo, projects, shortName, type Project } from "@/lib/projects";
import { Shot } from "@/components/Shot";

type Filter = "all" | "next" | "static";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "next", label: "Next.js" },
  { id: "static", label: "Hand-written HTML" },
];

export function Sheet() {
  const [filter, setFilter] = useState<Filter>("all");
  const [loupe, setLoupe] = useState<Project | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const shown = projects.filter((p) => filter === "all" || p.kind === filter);

  function openLoupe(p: Project, btn: HTMLButtonElement) {
    opener.current = btn;
    setLoupe(p);
    dialog.current?.showModal();
  }

  return (
    <section id="sheet" aria-labelledby="sheet-title" className="mx-auto w-[min(100%-2rem,78rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="sheet-title" className="display text-[length:var(--step-3)]">The sheet</h2>
          <p className="mt-3 max-w-[40rem] text-ink-2">Open a frame for its case notes, or use the loupe to see it larger.</p>
        </div>
        <div role="group" aria-label="Filter frames" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const n = projects.filter((p) => f.id === "all" || p.kind === f.id).length;
            return (
              <button
                key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
                className={`min-h-11 rounded-full border-[1.5px] px-4 text-[0.95rem] font-semibold transition-colors ${filter === f.id ? "border-film bg-film text-table" : "border-rule hover:border-ink-2"}`}
              >
                {f.label} <span className={filter === f.id ? "text-table/75" : "text-ink-2"}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" className="sr-only">{shown.length} sites shown</p>

      <div className="film mt-8 rounded-[var(--radius-frame)] px-3 sm:px-4">
        <ol className="grid gap-x-3 gap-y-5 [grid-template-columns:repeat(auto-fill,minmax(min(16rem,100%),1fr))]">
          {shown.map((p, i) => (
            <li key={p.slug} className="flex flex-col">
              <Link href={`/work/${p.slug}/`} className="frame-link block rounded-[1px]">
                <ViewTransition name={`frame-${p.slug}`} share="frame-morph" default="none">
                  <div className="frame overflow-hidden rounded-[1px] bg-film-2">
                    <Shot slug={p.slug} view="desktop" alt="" sizes="(min-width: 1200px) 24vw, (min-width: 700px) 45vw, 92vw" className="aspect-[16/10] w-full object-cover object-top" />
                  </div>
                </ViewTransition>
                <span className="mt-2 flex items-baseline justify-between gap-3 text-table">
                  <span className="font-semibold leading-tight">{shortName(p)}</span>
                  <span className="edge shrink-0 text-edge" aria-hidden="true">{frameNo(i)}</span>
                </span>
              </Link>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-table/70">
                <span><code className="text-table/85">{p.slug}/</code> · {p.kind === "next" ? p.stack[0] : "HTML"}</span>
                <button
                  type="button" onClick={(e) => openLoupe(p, e.currentTarget)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 font-semibold text-table hover:bg-film-2"
                  aria-label={`Loupe: view ${shortName(p)} larger`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
                  Loupe
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="loupe-title"
        onClose={() => { setLoupe(null); opener.current?.focus(); }}
        onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}
        className="m-auto w-[min(100%-2rem,72rem)] max-w-none rounded-[var(--radius-panel)] bg-table p-0 text-ink"
      >
        {loupe && (
          <div className="p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 id="loupe-title" className="font-bold">{shortName(loupe)}</h3>
              <button type="button" onClick={() => dialog.current?.close()} className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-rule px-4 font-semibold hover:border-ink-2" autoFocus>
                Close
              </button>
            </div>
            <Shot slug={loupe.slug} view="desktop" alt={`${shortName(loupe)}: desktop screenshot at 1440 by 900 pixels`} sizes="(min-width: 1200px) 70rem, 96vw" eager className="w-full rounded-[2px]" />
            <p className="mt-3 text-sm text-ink-2">
              Captured from the site&rsquo;s own build at 1440×900.{loupe.hiddenCookieBanner ? " Its cookie banner was hidden for the capture." : ""}{" "}
              <Link href={`/work/${loupe.slug}/`} className="font-semibold text-ink underline decoration-pencil decoration-2 underline-offset-4">Case notes</Link>
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}
