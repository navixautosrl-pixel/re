import { CopyButton } from "./CopyButton";

const STEPS = [
  { label: "Install the pinned browser tooling", cmd: "npm install", note: "At the repo root. Pins @playwright/mcp, which ships Playwright for the QA script." },
  { label: "Start a website build", cmd: "/site-builder build a landing page for …", note: "Run it in Claude Code from the repo. The orchestrator routes each stage to its skill." },
  { label: "QA a static export", cmd: "node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir out", note: "Add --base-path /sub if the site will live under a subpath." },
  { label: "Check structured data", cmd: "node .claude/skills/structured-data/scripts/validate_jsonld.mjs out", note: "Offline. Flags invalid JSON, missing properties, placeholders and reviews that need confirming." },
];

export function Usage() {
  return (
    <section id="use" aria-labelledby="use-title" className="bg-ink py-[var(--space-section)] text-ground">
      <div className="mx-auto w-[min(100%-2rem,76rem)]">
        <h2 id="use-title" className="display text-[length:var(--step-3)]">Take a tool off the wall</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.label} className="rounded-[var(--radius-slot)] border border-ground/20 p-5">
              <h3 className="font-bold">
                <span className="mr-2 text-signal">{i + 1}.</span>
                {s.label}
              </h3>
              <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-slot)] bg-ground/10 p-2 pl-3">
                <code className="min-w-0 flex-1 break-all text-[0.9rem] leading-snug">{s.cmd}</code>
                <CopyButton text={s.cmd} label={s.label} />
              </div>
              <p className="mt-3 text-[0.95rem] text-ground/75">{s.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
