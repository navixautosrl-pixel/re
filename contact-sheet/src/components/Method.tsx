// What "proofed" means here: the checks this repo's skills actually run.
// Every line maps to a script or skill that exists in .claude/skills/.
const STEPS = [
  { title: "Built and served as deployed", body: "The production build is served locally, under its subfolder when it'll live in one. That catches asset paths that only break after upload.", ref: "nextjs-site-architecture" },
  { title: "Checked at six widths", body: "From 320 to 1920 px: sideways overflow, console and network errors, missing SEO tags, unlabeled controls, keyboard focus.", ref: "site-qa-playwright" },
  { title: "Read with motion off and JavaScript off", body: "Nothing may stay invisible. That check found a hero headline that disappears with reduced motion, on one of the sites above.", ref: "reduced-motion-accessibility" },
  { title: "Measured, more than once", body: "Lighthouse runs repeatedly per form factor and reports medians, with the simulated and observed timings side by side.", ref: "lighthouse-auditing" },
  { title: "Pinned against regressions", body: "Screenshots of finished sections become baselines. A 1 px change to letter-spacing fails the test.", ref: "visual-regression-testing" },
];

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="mx-auto mt-[var(--section)] w-[min(100%-2rem,78rem)]">
      <h2 id="method-title" className="display text-[length:var(--step-3)]">How each one is proofed</h2>
      <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.title} className="border-t-2 border-film pt-4">
            <h3 className="text-[length:var(--step-1)] font-bold leading-tight">{s.title}</h3>
            <p className="mt-2 text-ink-2">{s.body}</p>
            <p className="mt-2 text-sm">Skill: <code className="font-semibold">{s.ref}</code></p>
          </li>
        ))}
      </ol>
    </section>
  );
}
