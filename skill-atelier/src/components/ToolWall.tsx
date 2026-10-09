"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, m } from "motion/react";
import { STAGES, skills, type Stage } from "@/lib/skills";

const ORIGIN_LABEL = {
  custom: "Written for this repo",
  vendored: "Vendored",
  existing: "Already in repo",
} as const;
const VENDOR_LABEL: Record<string, string> = {
  greensock: "GreenSock",
  "web-quality-skills": "web-quality-skills",
  vercel: "Vercel",
};

const noop = () => () => {};

export function ToolWall() {
  const [stage, setStage] = useState<Stage | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  // Collapse only once hydrated: the server HTML (and no-JS visitors) get every card.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter(
      (s) => (stage === "all" || s.stage === stage) && (!q || s.name.includes(q) || s.description.toLowerCase().includes(q))
    );
  }, [stage, query]);

  // The unfiltered wall is 48 cards (~14,000px on a phone). Show a first row set and
  // let the visitor ask for the rest. Any filter or search shows every match.
  const LIMIT = 12;
  const collapsed = hydrated && stage === "all" && !query.trim() && !expanded && visible.length > LIMIT;
  const shown = collapsed ? visible.slice(0, LIMIT) : visible;

  const chips: { id: Stage | "all"; label: string; n: number }[] = [
    { id: "all", label: "All", n: skills.length },
    ...STAGES.map((s) => ({ id: s.id, label: s.label, n: skills.filter((k) => k.stage === s.id).length })),
  ];

  return (
    <section id="tools" aria-labelledby="tools-title" className="mx-auto w-[min(100%-2rem,76rem)] py-[var(--space-section)]">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 id="tools-title" className="display text-[length:var(--step-3)]">The tool wall</h2>
          <p className="mt-3 max-w-[38rem] text-ink-2">
            Every card is a real <code className="text-[0.92em]">SKILL.md</code> in <code className="text-[0.92em]">.claude/skills/</code>,
            read when this page was built. Filter by the job you&rsquo;re doing.
          </p>
        </div>
        <label className="block w-full md:w-72">
          <span className="mb-1.5 block text-sm font-semibold">Search skills</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. hreflang, pinning, consent"
            className="h-12 w-full rounded-[var(--radius-slot)] border-[1.5px] border-line bg-white px-3.5 placeholder:text-ink-2/70 focus:border-blue"
          />
        </label>
      </div>

      <div role="group" aria-label="Filter by stage" className="mt-8 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = stage === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setStage(c.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-chip)] border-[1.5px] px-4 text-[0.95rem] font-semibold transition-colors duration-150 ${
                active ? "border-ink bg-ink text-ground" : "border-line bg-transparent hover:border-ink-2"
              }`}
            >
              {c.label}
              <span className={`text-sm font-medium ${active ? "text-ground/80" : "text-ink-2"}`}>{c.n}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {shown.length} of {skills.length} skills shown
      </p>

      {visible.length === 0 ? (
        <div className="slot mt-8 grid min-h-40 place-items-center p-8 text-center">
          <p>
            No skill matches &ldquo;{query}&rdquo;
            {stage !== "all" && " in this stage"}.{" "}
            <button type="button" className="font-semibold underline underline-offset-4" onClick={() => { setQuery(""); setStage("all"); }}>
              Clear filters
            </button>
          </p>
        </div>
      ) : (
        <m.ul layout className="mt-8 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(17.5rem,100%),1fr))]">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((s) => (
              <m.li
                key={s.name}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="slot slot-hover flex flex-col bg-ground/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="stamp text-[1.12rem] leading-tight break-words">{s.name}</h3>
                  <span className="shrink-0 rounded-[var(--radius-chip)] bg-board px-2.5 py-0.5 text-xs font-semibold text-ink-2">
                    {STAGES.find((x) => x.id === s.stage)?.label}
                  </span>
                </div>
                <p className="mt-2 text-[0.95rem] leading-snug text-ink-2">{s.summary}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs font-semibold">
                  <span className={s.origin === "custom" ? "text-blue" : "text-ink-2"}>
                    {ORIGIN_LABEL[s.origin]}
                    {s.vendor ? ` from ${VENDOR_LABEL[s.vendor] ?? s.vendor}` : ""}
                  </span>
                  {s.hasScripts && <span className="rounded-[var(--radius-chip)] bg-signal px-2 py-0.5 text-ink">has scripts</span>}
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-blue">Full description</summary>
                  <p className="mt-2 leading-snug text-ink-2">{s.description}</p>
                </details>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}

      {collapsed && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-12 items-center rounded-[var(--radius-slot)] border-[1.5px] border-ink px-6 font-semibold hover:bg-ink hover:text-ground"
          >
            Show all {visible.length} skills
          </button>
        </div>
      )}
    </section>
  );
}
