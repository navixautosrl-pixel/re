import { count, skills } from "@/lib/skills";

// Server Component. The entrance is CSS keyframes (see globals.css), so the
// final layout is in the HTML and still animates with JavaScript disabled.
const TAGS = [
  { name: "site-builder", x: "8%", y: "14%", tone: "signal" },
  { name: "gsap-scrolltrigger", x: "46%", y: "26%", tone: "plain" },
  { name: "structured-data", x: "10%", y: "38%", tone: "plain" },
  { name: "site-qa-playwright", x: "44%", y: "50%", tone: "signal" },
];

export function Hero() {
  const total = skills.length;
  const withScripts = count((s) => s.hasScripts);

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div id="top-sentinel" className="absolute top-0 h-px w-px" aria-hidden="true" />
      <div className="mx-auto grid w-[min(100%-2rem,76rem)] items-start gap-10 pt-10 pb-16 md:grid-cols-[1.15fr_0.85fr] md:pt-16 md:pb-24">
        <div>
          <h1 id="hero-title" className="display text-[length:var(--step-5)]">
            <span className="line-mask hero-line" style={{ "--i": 0 } as React.CSSProperties}>
              <span>A shadow board</span>
            </span>
            <span className="line-mask hero-line" style={{ "--i": 1 } as React.CSSProperties}>
              <span>for building</span>
            </span>
            <span className="line-mask hero-line" style={{ "--i": 2 } as React.CSSProperties}>
              <span>websites.</span>
            </span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-[length:var(--step-1)] leading-snug text-ink-2">
            {total} Claude Code skills, each hung by the job it does: plan, design, build, motion, search, verify, ship.
            {" "}{withScripts} of them include runnable scripts. The empty outlines are the tools this
            environment still can&rsquo;t reach.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#tools"
              className="inline-flex min-h-12 items-center rounded-[var(--radius-slot)] bg-ink px-6 font-semibold text-ground transition-transform duration-150 hover:-translate-y-0.5"
            >
              Browse the tools
            </a>
            <a href="#use" className="inline-flex min-h-12 items-center font-semibold underline decoration-2 underline-offset-[6px]">
              How to use them
            </a>
          </div>
        </div>

        <div
          className="pegboard relative aspect-[4/3.4] w-full overflow-hidden rounded-[var(--radius-slot)] border border-line md:aspect-[4/4.6]"
          aria-hidden="true"
        >
          {TAGS.map((t, i) => (
            <div key={t.name} className="absolute" style={{ left: t.x, top: t.y }}>
              <span className="absolute -top-[18px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-ink" />
              <div
                className={`hero-tag stamp relative rounded-[var(--radius-slot)] border-[1.5px] px-3.5 py-2 text-[0.95rem] shadow-[0_1px_0_oklch(0%_0_0/0.18)] ${
                  t.tone === "signal" ? "border-signal-ink/40 bg-signal text-ink" : "border-ink/25 bg-white text-ink"
                }`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="absolute -top-[13px] left-1/2 h-[14px] w-px -translate-x-1/2 bg-ink/60" />
                {t.name}
              </div>
            </div>
          ))}
          <div
            className="absolute left-[8%] bottom-[8%] grid h-[22%] w-[38%] place-items-center rounded-[var(--radius-slot)] border-[1.5px] border-dashed border-ink/35"
          >
            <span className="stamp bg-board px-1.5 text-sm text-ink-2">vercel deploy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
