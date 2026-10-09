// Real limitations of the environment this library was set up in, checked on
// 2026-10-09. They're drawn as empty outlines on the board, and none are dressed up as working.
const GAPS = [
  { tool: "Vercel deploys", why: "The sandbox's network policy rejects vercel.com and mcp.vercel.com (HTTP 403).", fix: "Allow those hosts in the environment's network settings, or deploy from your own machine." },
  { tool: "Supabase & Stripe MCP", why: "Both servers failed to connect through the proxy (403), so the code can be written but not tested against the live service.", fix: "Allow the hosts, then complete each service's OAuth." },
  { tool: "21st.dev components", why: "No API_KEY_21ST is set, and the host is blocked.", fix: "Optional: add a key and allow the host." },
  { tool: "Figma files", why: "The figma plugin needs your own Figma OAuth before it can read a file.", fix: "Share a file link and authorize the plugin." },
  { tool: "Real-user Core Web Vitals", why: "Field data only exists for a deployed site with traffic. Lighthouse here is lab-only.", fix: "Deploy, then read CrUX/PageSpeed Insights or add web-vitals RUM." },
  { tool: "Screen-reader pass", why: "Automated checks (axe, heuristics) run here, but VoiceOver and NVDA need a human.", fix: "Do a manual pass before launch." },
];

export function Gaps() {
  return (
    <section id="gaps" aria-labelledby="gaps-title" className="mx-auto w-[min(100%-2rem,76rem)] py-[var(--space-section)]">
      <h2 id="gaps-title" className="display text-[length:var(--step-3)]">Empty outlines</h2>
      <p className="mt-3 max-w-[40rem] text-ink-2">
        A shadow board shows you a missing tool at a glance. These are the ones that aren&rsquo;t on the wall
        yet, why, and what it would take to hang them.
      </p>
      <ul className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(21rem,100%),1fr))]">
        {GAPS.map((g) => (
          <li key={g.tool} className="slot border-ink/30 p-5">
            <h3 className="stamp text-[1.2rem]">{g.tool}</h3>
            <p className="mt-2 text-[0.95rem] leading-snug text-ink-2">{g.why}</p>
            <p className="mt-3 text-[0.95rem] leading-snug">
              <span className="font-semibold">To fix: </span>
              {g.fix}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
