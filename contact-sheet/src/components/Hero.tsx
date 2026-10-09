import { projects, shortName, capturedAt } from "@/lib/projects";
import { Shot } from "@/components/Shot";

// Server Component; the entrance is CSS (globals.css), so it runs without JS and
// the final layout is what's in the HTML. The "select" circled in grease pencil is
// the most recently changed project: a fact from git, not an opinion.
export function Hero() {
  const latest = [...projects].sort((a, b) => b.lastCommit.localeCompare(a.lastCommit))[0];
  const strip = [latest, ...projects.filter((p) => p.slug !== latest.slug)].slice(0, 6);
  const nextCount = projects.filter((p) => p.kind === "next").length;
  const words = ["Every", "site", "we", "build,", "on", "one", "sheet."];

  return (
    <section aria-labelledby="hero-title" className="mx-auto grid w-[min(100%-2rem,78rem)] gap-10 pt-12 pb-[var(--section)] lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-20">
      <div>
        <h1 id="hero-title" className="display text-[length:var(--step-5)]">
          {words.map((w, i) => (
            <span key={i}>
              <span className="word-mask hero-word" style={{ "--i": i } as React.CSSProperties}><span>{w}</span></span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="mt-7 max-w-[36rem] text-[length:var(--step-1)] leading-snug text-ink-2">
          {projects.length} websites from this repository: {nextCount} Next.js builds and {projects.length - nextCount} hand-written
          HTML sites. Each one is screenshotted from its own production build, with its stack and history read from the repo
          on {capturedAt}.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="#sheet" className="inline-flex min-h-12 items-center rounded-[var(--radius-frame)] bg-film px-6 font-semibold text-table hover:bg-film-2">
            See the sheet
          </a>
          <a href="#method" className="inline-flex min-h-12 items-center font-semibold underline decoration-pencil decoration-2 underline-offset-[6px]">
            How each one is proofed
          </a>
        </div>
      </div>

      <figure>
        {[strip.slice(0, 3), strip.slice(3, 6)].map((row, r) => (
          <div key={r} className={`relative ${r ? "mt-3" : ""}`}>
            <div className="film rounded-[var(--radius-frame)] px-3">
              <ol className="grid grid-cols-3 gap-2" aria-label={r ? "Frames 4 to 6" : "Frames 1 to 3"}>
                {row.map((p, i) => (
                  <li key={p.slug} className="expose" style={{ "--i": r * 3 + i } as React.CSSProperties}>
                    <Shot slug={p.slug} view="desktop" alt={`${shortName(p)}, desktop screenshot`} sizes="(min-width: 1024px) 17vw, 31vw" eager={r === 0 && i === 0} className="aspect-[16/10] w-full rounded-[1px] object-cover object-top" />
                    <span className="edge mt-1.5 block text-edge" aria-hidden="true">{r * 3 + i + 1}{"  "}▸</span>
                  </li>
                ))}
              </ol>
            </div>
            {r === 0 && (
              /* Grease-pencil loop around frame 1: sized to the first grid column (strip padding 0.75rem, 3 cols, 0.5rem gaps). */
              <svg
                className="pointer-events-none absolute top-[-8px] h-[calc(100%+16px)] overflow-visible"
                style={{ left: "calc(0.75rem - 10px)", width: "calc((100% - 1.5rem - 1rem) / 3 + 20px)" }}
                viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
              >
                <path className="pencil-path" pathLength={1} d="M54 4 C 86 3, 99 28, 97 52 C 95 82, 70 97, 44 96 C 16 95, 2 74, 3 47 C 4 20, 24 5, 60 7" fill="none" stroke="var(--color-pencil)" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
        ))}
        <figcaption className="mt-4 text-sm text-ink-2">
          Circled: <span className="font-semibold text-ink">{shortName(latest)}</span>, the most recently changed site ({latest.lastCommit}).
        </figcaption>
      </figure>
    </section>
  );
}
