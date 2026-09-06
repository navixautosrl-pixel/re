export function HeroFallback2D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-[#2a2825] to-[#0c0b0a] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.6),inset_8px_8px_20px_rgba(255,255,255,0.05)]">
        <div className="absolute left-8 top-8 h-10 w-10 rounded-full bg-white/25 blur-md" />
      </div>
      {[
        { top: "20%", left: "70%", size: 16 },
        { top: "70%", left: "22%", size: 12 },
        { top: "75%", left: "72%", size: 10 },
      ].map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-[#3d3a35] to-[#0c0b0a]"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size }}
        />
      ))}
    </div>
  );
}
