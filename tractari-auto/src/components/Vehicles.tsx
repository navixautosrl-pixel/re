import type { VehicleId } from "@/config/pricing";

/**
 * Side-profile vehicles drawn for this site (viewBox 200×84, facing left, ground at y≈79).
 * Shading comes from the shared gradients in <VehicleDefs/> (rendered once in the layout):
 * metallic paint, tinted glass with a reflection, spoked alloy rims, lights, soft ground shadow.
 * Wheels are `.wheel` groups so CSS can spin them (driving in, hover, idle on the "road").
 */
export type Paint = "silver" | "blue" | "white" | "red" | "graphite";

export function VehicleDefs() {
  const paint = (id: Paint, a: string, b: string, c: string) => (
    <linearGradient id={`p-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset=".45" stopColor={b} />
      <stop offset="1" stopColor={c} />
    </linearGradient>
  );
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {paint("silver", "#f4f6f8", "#c3c9d1", "#7d8590")}
        {paint("blue", "#6f8fd0", "#2c4a87", "#152446")}
        {paint("white", "#ffffff", "#eceff3", "#aab2bd")}
        {paint("red", "#ff7a70", "#c8231d", "#6e0d0b")}
        {paint("graphite", "#8b939e", "#4a525d", "#22272e")}
        <linearGradient id="v-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d819c" />
          <stop offset=".55" stopColor="#2a3647" />
          <stop offset="1" stopColor="#151c26" />
        </linearGradient>
        <linearGradient id="v-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="v-rim" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset=".6" stopColor="#b9c1cb" />
          <stop offset="1" stopColor="#6b7480" />
        </radialGradient>
        <linearGradient id="v-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#a9b1bb" />
          <stop offset="1" stopColor="#5d6670" />
        </linearGradient>
        <linearGradient id="v-head" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="1" stopColor="#ffd56a" />
        </linearGradient>
        <linearGradient id="v-tail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a80" />
          <stop offset="1" stopColor="#9e0f16" />
        </linearGradient>
        <linearGradient id="v-bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe4ea" />
          <stop offset=".5" stopColor="#9aa4b1" />
          <stop offset="1" stopColor="#5b6573" />
        </linearGradient>
        <filter id="v-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
    </svg>
  );
}

export function Wheel({ x, y = 64, r = 14 }: { x: number; y?: number; r?: number }) {
  // five spokes as one path (fewer DOM nodes than five rects)
  const spokes = [0, 72, 144, 216, 288]
    .map((a) => {
      const t = (a * Math.PI) / 180;
      const [cx, cy] = [Math.sin(t), -Math.cos(t)];
      const w = r * 0.08;
      const p = (k: number, off: number) => `${(x + cx * r * k + cy * off).toFixed(2)} ${(y + cy * r * k - cx * off).toFixed(2)}`;
      return `M${p(0.12, -w)} L${p(0.58, -w)} L${p(0.58, w)} L${p(0.12, w)} Z`;
    })
    .join(" ");
  return (
    <g>
      <circle cx={x} cy={y} r={r + 2.2} fill="#11151a" />
      <g className="wheel" style={{ transformOrigin: `${x}px ${y}px` }}>
        <circle cx={x} cy={y} r={r} fill="#1b2027" stroke="#2c333c" strokeWidth="1.2" />
        <circle cx={x} cy={y} r={r * 0.62} fill="url(#v-rim)" />
        <path d={spokes} fill="#7a838e" />
        <circle cx={x} cy={y} r={r * 0.14} fill="#3a424c" />
      </g>
    </g>
  );
}

const Shadow = ({ w = 172 }: { w?: number }) => <ellipse cx="100" cy="79" rx={w / 2} ry="3.2" fill="#000" opacity=".35" filter="url(#v-blur)" />;
const line = { fill: "none", stroke: "#000", strokeOpacity: 0.28, strokeWidth: 0.8 } as const;

function Car({ paint, kind }: { paint: Paint; kind: "hatchback" | "sedan" }) {
  const sedan = kind === "sedan";
  const body = sedan
    ? "M8 60 L8 51 Q9 45 15 43 L46 39 Q54 37 60 34 L80 22 Q84 19 90 19 L134 19 Q140 19 145 23 L160 35 L186 38 Q192 39 192 46 L192 60 Q192 64 188 64 L172 64 A17 17 0 0 0 138 64 L64 64 A17 17 0 0 0 30 64 L12 64 Q8 64 8 60 Z"
    : "M10 60 L10 50 Q10 44 16 42 L44 37 Q52 36 58 33 L78 20 Q82 17 88 17 L150 17 Q158 17 162 21 L178 38 Q186 40 188 46 L190 60 Q190 64 186 64 L170 64 A17 17 0 0 0 136 64 L64 64 A17 17 0 0 0 30 64 L14 64 Q10 64 10 60 Z";
  const rearX = sedan ? 155 : 153;
  return (
    <>
      <Shadow />
      <path d={body} fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
      {/* glass */}
      {sedan ? (
        <>
          <path d="M64 35 L81 23 Q84 21 89 21 L110 21 L110 35 Z" fill="url(#v-glass)" />
          <path d="M114 21 L132 21 Q138 21 142 25 L152 35 L114 35 Z" fill="url(#v-glass)" />
        </>
      ) : (
        <>
          <path d="M62 34 L80 22 Q83 20 88 20 L112 20 L112 34 Z" fill="url(#v-glass)" />
          <path d="M116 20 L148 20 Q154 20 158 24 L170 35 L116 35 Z" fill="url(#v-glass)" />
        </>
      )}
      <path d={sedan ? "M70 33 L84 23 L92 23 L78 33 Z" : "M68 32 L82 22 L90 22 L76 32 Z"} fill="#fff" opacity=".22" />
      {/* shoulder highlight, door lines, handles */}
      <path d={sedan ? "M18 45 Q100 39 188 41" : "M20 44 Q100 38 184 41"} stroke="url(#v-shine)" strokeWidth="2" fill="none" />
      <path {...line} d={sedan ? "M112 21 L112 60 M62 37 L64 60 M154 37 L156 58" : "M114 20 L114 60 M60 36 L62 60 M150 36 L152 58"} />
      <rect x={sedan ? 96 : 96} y="41" width="8" height="1.8" rx=".9" fill="#000" opacity=".35" />
      <rect x={sedan ? 136 : 136} y="41" width="8" height="1.8" rx=".9" fill="#000" opacity=".35" />
      <path d="M62 33 l-7 -3 l-2 4.5 Z" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".4" strokeWidth=".6" />
      {/* lights, bumpers, sill */}
      <path d={sedan ? "M10 46 Q12 43 21 42 L25 45 Q17 47 10 48 Z" : "M12 46 Q14 43 22 42 L26 45 Q18 47 12 48 Z"} fill="url(#v-head)" />
      <path d={sedan ? "M186 40 L191 42 L191 48 L185 46 Z" : "M182 40 L188 44 L189 50 L183 48 Z"} fill="url(#v-tail)" />
      <path d={sedan ? "M8 56 L28 56 L28 60 L8 60 Z" : "M10 56 L28 56 L28 60 L10 60 Z"} fill="#000" opacity=".28" />
      <path d="M64 59 L136 59 L136 63 L64 63 Z" fill="#000" opacity=".3" />
      <Wheel x={47} />
      <Wheel x={rearX} />
    </>
  );
}

function Suv({ paint }: { paint: Paint }) {
  return (
    <>
      <Shadow w={178} />
      <path d="M8 59 L8 46 Q8 40 15 38 L42 35 Q48 34 52 30 L66 14 Q69 11 75 11 L170 11 Q177 11 180 16 L188 32 Q192 35 192 42 L192 59 Q192 63 188 63 L174 63 A19 19 0 0 0 136 63 L66 63 A19 19 0 0 0 28 63 L12 63 Q8 63 8 59 Z" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
      <rect x="78" y="7" width="88" height="2.6" rx="1.3" fill="url(#v-chrome)" />
      <path d="M56 30 L68 16 Q70 14 75 14 L100 14 L100 30 Z" fill="url(#v-glass)" />
      <path d="M104 14 L138 14 L138 30 L104 30 Z" fill="url(#v-glass)" />
      <path d="M142 14 L168 14 Q174 14 176 18 L182 30 L142 30 Z" fill="url(#v-glass)" />
      <path d="M62 28 L74 16 L82 16 L70 28 Z" fill="#fff" opacity=".22" />
      <path d="M18 40 Q100 34 188 37" stroke="url(#v-shine)" strokeWidth="2.2" fill="none" />
      <path {...line} d="M102 14 L102 58 M140 14 L140 58 M54 32 L56 58" />
      <rect x="86" y="36" width="9" height="2" rx="1" fill="#000" opacity=".35" />
      <rect x="124" y="36" width="9" height="2" rx="1" fill="#000" opacity=".35" />
      <path d="M56 30 l-8 -3 l-2 5 Z" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".4" strokeWidth=".6" />
      <path d="M9 41 Q12 38 22 37 L26 41 Q16 43 9 44 Z" fill="url(#v-head)" />
      <path d="M186 34 L191 37 L191 46 L185 44 Z" fill="url(#v-tail)" />
      <path d="M8 52 L28 52 L28 59 L8 59 Z" fill="#000" opacity=".32" />
      <path d="M66 56 L136 56 L136 62 L66 62 Z" fill="#000" opacity=".32" />
      <Wheel x={47} y={63} r={16} />
      <Wheel x={155} y={63} r={16} />
    </>
  );
}

function Microbuz({ paint }: { paint: Paint }) {
  return (
    <>
      <Shadow w={184} />
      <path d="M6 60 L6 44 Q6 34 14 28 L34 12 Q38 8 46 8 L186 8 Q194 8 194 16 L194 60 Q194 64 190 64 L177 64 A17 17 0 0 0 143 64 L59 64 A17 17 0 0 0 25 64 L10 64 Q6 64 6 60 Z" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
      <path d="M15 34 L34 15 Q36 13 40 13 L50 13 L50 34 Z" fill="url(#v-glass)" />
      {[56, 82, 108, 134, 160].map((x) => <rect key={x} x={x} y="13" width="22" height="19" rx="2" fill="url(#v-glass)" />)}
      <path d="M22 32 L38 15 L44 15 L28 32 Z" fill="#fff" opacity=".22" />
      <path d="M12 40 Q100 36 192 38" stroke="url(#v-shine)" strokeWidth="2" fill="none" />
      <path {...line} d="M53 13 L53 60 M106 34 L106 60 M131 34 L131 60" />
      <path d="M8 42 Q10 39 18 38 L20 42 Q13 44 8 45 Z" fill="url(#v-head)" />
      <path d="M190 40 L194 40 L194 52 L190 52 Z" fill="url(#v-tail)" />
      <path d="M6 54 L24 54 L24 60 L6 60 Z" fill="#000" opacity=".3" />
      <Wheel x={42} />
      <Wheel x={160} />
    </>
  );
}

function Duba({ paint }: { paint: Paint }) {
  return (
    <>
      <Shadow w={188} />
      <rect x="60" y="2" width="136" height="58" rx="2.5" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
      {[94, 128, 162].map((x) => <path key={x} d={`M${x} 4 L${x} 58`} {...line} />)}
      <path d="M64 10 Q128 6 192 10" stroke="url(#v-shine)" strokeWidth="2" fill="none" />
      <path d="M6 64 L6 42 Q7 32 14 28 L26 16 Q30 13 36 13 L58 13 L58 64 Z" fill={`url(#p-${paint})`} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
      <path d="M14 32 L27 19 Q29 17 33 17 L52 17 L52 32 Z" fill="url(#v-glass)" />
      <path d="M20 30 L32 18 L38 18 L26 30 Z" fill="#fff" opacity=".22" />
      <path {...line} d="M40 32 L40 60" />
      <path d="M8 40 Q10 37 18 36 L20 40 Q13 42 8 43 Z" fill="url(#v-head)" />
      <rect x="4" y="60" width="194" height="6" rx="1.5" fill="#2a3038" />
      <path d="M192 44 L196 44 L196 56 L192 56 Z" fill="url(#v-tail)" />
      <Wheel x={34} y={66} r={13} />
      <Wheel x={150} y={66} r={13} />
      <Wheel x={178} y={66} r={13} />
    </>
  );
}

function Moto({ paint }: { paint: Paint }) {
  const P = { fill: `url(#p-${paint})`, stroke: "#000", strokeOpacity: 0.35, strokeWidth: 0.8 };
  return (
    <>
      <Shadow w={150} />
      <path d="M118 48 L156 62" stroke="#3a424c" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 28 L44 62" stroke="url(#v-chrome)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M128 44 L170 37 Q174 37 173 41 L170 43 L132 50 Z" fill="url(#v-chrome)" />
      <path d="M86 34 L118 32 L124 50 L96 55 Q86 47 86 34 Z" fill="#3a424c" stroke="#000" strokeOpacity=".3" />
      <path d="M96 38 L116 37 M98 44 L118 43" stroke="#7a838e" strokeWidth="1.2" />
      <path {...P} d="M66 45 L88 36 L98 52 L76 55 Z" />
      <path {...P} d="M50 40 Q52 27 66 21 L92 17 L100 30 L82 44 Q66 48 54 46 Z" />
      <path d="M64 22 L77 11 L90 15 L80 23 Z" fill="url(#v-glass)" />
      <path d="M52 38 Q54 33 62 31 L64 36 Z" fill="url(#v-head)" />
      <path {...P} d="M92 17 Q106 11 122 15 L128 25 L100 29 Z" />
      <path d="M100 18 Q110 14 120 16" stroke="url(#v-shine)" strokeWidth="2" fill="none" />
      <path d="M122 17 L150 21 L154 26 L128 26 Z" fill="#1d2228" />
      <path {...P} d="M146 21 L178 15 L172 25 L154 27 Z" />
      <path d="M173 16 L179 15 L176 20 Z" fill="url(#v-tail)" />
      <Wheel x={44} y={62} r={16} />
      <Wheel x={156} y={62} r={16} />
    </>
  );
}

export const VEHICLE_PAINT: Record<VehicleId, Paint> = { moto: "red", hatchback: "silver", sedan: "blue", suv: "white", microbuz: "white", duba: "white" };

export function VehicleArt({ id, className, title, paint }: { id: VehicleId; className?: string; title?: string; paint?: Paint }) {
  const p = paint ?? VEHICLE_PAINT[id];
  return (
    <svg viewBox="0 0 200 84" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g className="veh-body">
        {id === "moto" ? <Moto paint={p} /> : id === "hatchback" ? <Car paint={p} kind="hatchback" /> : id === "sedan" ? <Car paint={p} kind="sedan" /> : id === "suv" ? <Suv paint={p} /> : id === "microbuz" ? <Microbuz paint={p} /> : <Duba paint={p} />}
      </g>
    </svg>
  );
}

/** Hero flatbed tow truck (faces right) carrying a silver hatchback; beacon bar on the cab. */
export function TowTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 220" className={className} aria-hidden="true">
      <ellipse cx="290" cy="206" rx="250" ry="7" fill="#000" opacity=".45" filter="url(#v-blur)" />
      {/* bed with side rail */}
      <path d="M30 150 L392 150 L392 164 L22 164 Q16 164 19 158 Z" fill="url(#v-bed)" stroke="#000" strokeOpacity=".3" />
      <rect x="30" y="146" width="362" height="5" rx="2" fill="#c9d0d8" />
      <rect x="34" y="164" width="356" height="12" fill="#262c34" />
      {[60, 120, 180, 240, 300, 360].map((x) => <rect key={x} x={x} y="152" width="3" height="10" fill="#000" opacity=".2" />)}
      {/* car on the bed, mirrored to face right */}
      <g transform="translate(372 33) scale(-1.5 1.5)">
        <Car paint="silver" kind="hatchback" />
      </g>
      {/* straps */}
      <path d="M118 150 L104 128 M330 150 L340 128" stroke="#f2b33d" strokeWidth="3" />
      {/* cab */}
      <path d="M394 176 L394 82 Q394 68 408 68 L466 68 Q482 68 492 80 L520 118 Q530 124 538 126 Q548 128 548 140 L548 176 Z" fill="url(#p-white)" stroke="#000" strokeOpacity=".35" strokeWidth="1.2" />
      <path d="M410 82 L462 82 Q472 82 478 90 L500 120 L410 120 Z" fill="url(#v-glass)" />
      <path d="M420 118 L446 84 L458 84 L432 118 Z" fill="#fff" opacity=".18" />
      <path d="M440 120 L440 170" stroke="#000" strokeOpacity=".25" />
      <rect x="452" y="126" width="12" height="3" rx="1.5" fill="#000" opacity=".35" />
      <rect x="394" y="136" width="154" height="7" fill="var(--beacon)" />
      <path d="M534 132 L548 132 L548 146 L534 146 Z" fill="url(#v-head)" />
      <rect x="538" y="156" width="14" height="20" rx="3" fill="#2a3038" />
      <path d="M498 104 l10 -4 l2 8 Z" fill="url(#p-white)" stroke="#000" strokeOpacity=".4" />
      {/* beacon bar */}
      <rect x="410" y="60" width="62" height="9" rx="3" fill="#2a3038" />
      <rect className="beacon" x="414" y="51" width="22" height="10" rx="4" fill="var(--beacon)" />
      <rect className="beacon beacon-b" x="446" y="51" width="22" height="10" rx="4" fill="var(--beacon)" />
      <Wheel x={96} y={180} r={22} />
      <Wheel x={150} y={180} r={22} />
      <Wheel x={470} y={180} r={22} />
    </svg>
  );
}
