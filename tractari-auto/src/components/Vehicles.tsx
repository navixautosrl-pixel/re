import type { VehicleId } from "@/config/pricing";

/**
 * Side-profile silhouettes, drawn for this site (viewBox 160×64, facing left, ground at y=60).
 * Colours come from CSS variables so the same drawing works on light and dark sections.
 */
const Wheel = ({ x, r = 10, y = 50 }: { x: number; r?: number; y?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r + 2.5} fill="var(--veh-arch, var(--concrete))" />
    <circle cx={x} cy={y} r={r} fill="var(--veh-tyre, #1d222a)" />
    <circle cx={x} cy={y} r={r * 0.45} fill="var(--veh-rim, #c9ced6)" />
  </g>
);

const BODY = { fill: "var(--veh-body, #dfe3e9)", stroke: "var(--veh-line, #59606b)", strokeWidth: 1.5, strokeLinejoin: "round" as const };
const GLASS = { fill: "var(--veh-glass, #3b4656)" };

const shapes: Record<VehicleId, React.ReactNode> = {
  moto: (
    <>
      <path d="M38 48 L76 34 M104 22 L122 47" stroke="var(--veh-line, #59606b)" strokeWidth="4" strokeLinecap="round" />
      <path {...BODY} d="M54 36 Q60 24 78 23 L98 23 L112 18 Q118 17 120 21 L110 30 Q96 36 80 37 Z" />
      <path d="M58 26 L82 24 L80 19 L60 20 Z" fill="var(--veh-glass, #3b4656)" />
      <path d="M104 21 L98 10 L106 9" stroke="var(--veh-line, #59606b)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Wheel x={38} r={12} y={47} />
      <Wheel x={122} r={12} y={47} />
    </>
  ),
  hatchback: (
    <>
      <path {...BODY} d="M10 50 L10 37 Q12 31 22 30 L44 28 L60 16 Q63 14 68 14 L110 14 Q116 14 120 19 L130 29 Q146 31 148 37 L148 50 Z" />
      <path {...GLASS} d="M63 27 L72 18 L95 18 L95 27 Z" />
      <path {...GLASS} d="M99 18 L111 18 Q114 18 116 21 L122 27 L99 27 Z" />
      <Wheel x={38} />
      <Wheel x={122} />
    </>
  ),
  sedan: (
    <>
      <path {...BODY} d="M6 50 L6 38 Q8 32 20 31 L46 29 L62 17 Q65 15 70 15 L104 15 Q110 15 114 19 L127 30 L150 32 Q155 33 155 39 L155 50 Z" />
      <path {...GLASS} d="M65 28 L73 19 L92 19 L92 28 Z" />
      <path {...GLASS} d="M96 19 L106 19 Q109 19 111 21 L119 28 L96 28 Z" />
      <Wheel x={36} />
      <Wheel x={128} />
    </>
  ),
  suv: (
    <>
      <path {...BODY} d="M7 50 L7 31 Q8 26 17 25 L40 23 L52 11 Q54 9 58 9 L136 9 Q141 9 143 14 L151 25 Q153 27 153 31 L153 50 Z" />
      <path {...GLASS} d="M55 22 L62 13 L88 13 L88 22 Z" />
      <path {...GLASS} d="M92 13 L118 13 L118 22 L92 22 Z" />
      <path {...GLASS} d="M122 13 L136 13 Q138 13 139 15 L144 22 L122 22 Z" />
      <Wheel x={38} r={11} />
      <Wheel x={124} r={11} />
    </>
  ),
  microbuz: (
    <>
      <path {...BODY} d="M5 50 L5 30 Q6 21 16 15 L30 6 Q33 4 38 4 L149 4 Q155 4 155 10 L155 50 Z" />
      <path {...GLASS} d="M18 22 L32 10 L46 10 L46 22 Z" />
      {[52, 76, 100, 124].map((x) => (
        <rect key={x} x={x} y={10} width={20} height={12} rx={1.5} {...GLASS} />
      ))}
      <Wheel x={34} />
      <Wheel x={128} />
    </>
  ),
  duba: (
    <>
      <rect {...BODY} x={46} y={2} width={110} height={44} rx={2} />
      <path {...BODY} d="M5 50 L5 31 Q7 22 15 18 L25 11 Q28 9 33 9 L48 9 L48 50 Z" />
      <path {...GLASS} d="M13 26 L25 14 L41 14 L41 26 Z" />
      <rect x={4} y={44} width={152} height={6} fill="var(--veh-line, #59606b)" />
      <Wheel x={28} />
      <Wheel x={112} />
      <Wheel x={136} />
    </>
  ),
};

export function VehicleArt({ id, className, title }: { id: VehicleId; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 160 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <ellipse cx="80" cy="61" rx="74" ry="2.5" fill="var(--veh-shadow, rgba(20,25,35,.18))" />
      {shapes[id]}
    </svg>
  );
}

/** The hero's flatbed tow truck carrying a hatchback (faces right, drives in from the left). */
export function TowTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 200" className={className} aria-hidden="true">
      <ellipse cx="262" cy="188" rx="240" ry="7" fill="rgba(0,0,0,.35)" />
      {/* carried car, on the bed */}
      <g transform="translate(64 49) scale(1.55)" style={{ ["--veh-arch" as string]: "transparent" }}>
        <g transform="translate(160 0) scale(-1 1)">{shapes.hatchback}</g>
      </g>
      {/* bed */}
      <path d="M40 140 L360 140 L360 152 L28 152 Q24 152 26 148 Z" fill="var(--truck-bed, #8b95a3)" />
      <rect x="40" y="152" width="320" height="10" fill="#2a313b" />
      {/* cab */}
      <path d="M362 162 L362 76 Q362 66 372 66 L432 66 Q444 66 452 76 L478 112 Q486 118 492 120 Q500 122 500 132 L500 162 Z" fill="var(--truck-cab, #f2f4f7)" stroke="#59606b" strokeWidth="2" />
      <path d="M378 80 L428 80 Q436 80 441 87 L462 116 L378 116 Z" fill="#3b4656" />
      <rect x="486" y="136" width="14" height="10" rx="2" fill="#ffd27a" />
      <rect x="362" y="126" width="138" height="6" fill="var(--beacon)" />
      {/* beacon */}
      <rect x="396" y="56" width="26" height="10" rx="3" fill="#2a313b" />
      <rect className="beacon" x="400" y="48" width="18" height="10" rx="4" fill="var(--beacon)" />
      {/* wheels */}
      {[96, 300, 440].map((x) => (
        <g key={x} className="wheel" style={{ transformOrigin: `${x}px 166px` }}>
          <circle cx={x} cy="166" r="22" fill="#1d222a" />
          <circle cx={x} cy="166" r="10" fill="#c9ced6" />
          <path d={`M${x - 10} 166 H${x + 10} M${x} 156 V${x ? 176 : 0}`} stroke="#59606b" strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}
