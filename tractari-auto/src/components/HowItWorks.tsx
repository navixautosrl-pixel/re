"use client";

import { useEffect, useRef } from "react";

/**
 * PRIMARY moment #2 — the only scroll set piece. ≥ 900px with motion allowed: the section pins,
 * a route line draws from A to B as you scroll and a mini tow truck drives along it while the
 * three steps light up in turn. GSAP is imported only then. Otherwise: a static list.
 */
const STEPS = [
  { t: "Calculezi prețul", d: "Alegi tipul vehiculului și traseul. Totalul apare imediat, cu tot calculul la vedere." },
  { t: "Suni sau scrii pe WhatsApp", d: "Mesajul pleacă deja completat cu vehiculul, traseul și prețul calculat." },
  { t: "Platforma vine după mașină", d: "Încărcăm, transportăm și descărcăm la destinație. Primele 30 de minute de staționare sunt gratuite." },
];
const PATH = "M40 220 C 180 220, 200 60, 340 60 S 520 200, 640 140 S 820 40, 900 70";

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const query = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
    let revert: (() => void) | undefined;
    let cancelled = false;
    async function setup() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !el) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        const path = el.querySelector<SVGPathElement>("[data-route]")!;
        const dot = el.querySelector<SVGGElement>("[data-dot]")!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
        const state = { p: 0 };
        const place = () => {
          const at = Math.min(len - 1, state.p * len);
          const pt = path.getPointAtLength(at);
          const ahead = path.getPointAtLength(Math.min(len, at + 1));
          const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
          dot.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle})`);
          path.style.strokeDashoffset = String(len * (1 - state.p));
          steps.forEach((s, i) => s.toggleAttribute("data-on", state.p >= i / steps.length - 0.02));
        };
        place();
        gsap.to(state, { p: 1, ease: "none", onUpdate: place, scrollTrigger: { trigger: el, start: "top top", end: "+=160%", pin: true, scrub: 0.5, anticipatePin: 1 } });
      });
      revert = () => mm.revert();
    }
    const mq = window.matchMedia(query);
    const onChange = () => mq.matches && !revert && setup();
    if (mq.matches) setup(); else mq.addEventListener("change", onChange);
    return () => { cancelled = true; mq.removeEventListener("change", onChange); revert?.(); };
  }, []);

  // Wrapper stays React-owned: GSAP re-parents the pinned section into a pin-spacer.
  return (
    <div>
      <section ref={root} aria-labelledby="how-title" className="on-dark overflow-hidden bg-asphalt text-paint min-[900px]:flex min-[900px]:h-svh min-[900px]:min-h-[38rem] min-[900px]:flex-col min-[900px]:justify-center">
        <div className="wrap py-20 min-[900px]:py-0">
          <h2 id="how-title" className="text-[length:var(--step-3)]">Cum funcționează</h2>
          <svg viewBox="0 0 940 260" className="mt-8 hidden w-full min-[900px]:block" aria-hidden="true">
            <path d={PATH} fill="none" stroke="var(--asphalt-3)" strokeWidth="14" strokeLinecap="round" />
            <path d={PATH} fill="none" stroke="var(--paint)" strokeWidth="2" strokeDasharray="14 14" opacity=".35" />
            <path data-route d={PATH} fill="none" stroke="var(--beacon)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="40" cy="220" r="12" fill="var(--sign)" /><text x="40" y="225" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">A</text>
            <circle cx="900" cy="70" r="12" fill="var(--sign)" /><text x="900" y="75" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">B</text>
            <g data-dot transform="translate(40 220)">
              {/* mini tow truck that rides the route, nose along the tangent */}
              <g transform="scale(1.9) translate(-26 -16)">
                <rect x="0" y="12" width="34" height="5" rx="1.5" fill="#9aa4b1" />
                <path d="M34 20 L34 6 Q34 3 37 3 L44 3 Q47 3 49 6 L53 12 L53 20 Z" fill="#f2f4f7" />
                <path d="M37 6 L44 6 L48 11 L37 11 Z" fill="#3b4656" />
                <rect className="beacon" x="38" y="0" width="6" height="3" rx="1" fill="var(--beacon)" />
                <circle cx="8" cy="21" r="4" fill="#1b2027" /><circle cx="45" cy="21" r="4" fill="#1b2027" />
              </g>
            </g>
          </svg>
          <ol className="mt-10 grid gap-8 min-[900px]:mt-6 min-[900px]:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} data-step className="group/step relative border-l-4 border-asphalt-3 pl-5 transition-colors duration-300 data-[on]:border-beacon">
                <p className="text-[length:var(--step--1)] font-[750] text-beacon">Pasul {i + 1}</p>
                <h3 className="mt-1 text-[length:var(--step-2)] transition-colors duration-300 group-data-[on]/step:text-beacon-2">{s.t}</h3>
                <p className="mt-2 text-paint/80">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
