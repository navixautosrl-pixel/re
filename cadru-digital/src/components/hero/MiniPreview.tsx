/**
 * A small abstract UI skeleton used on portfolio cards — the same
 * placeholder language as the hero visual, never a fabricated screenshot.
 * `accent` lets each demo project read as visually distinct.
 */
export function MiniPreview({ accent = "var(--color-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface-elevated p-5">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-2/3 rounded-full" style={{ background: accent }} />
        <div className="h-2 w-1/2 rounded-full bg-border-strong" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="aspect-square rounded-xs bg-border" />
        <div className="aspect-square rounded-xs bg-border" />
        <div className="aspect-square rounded-xs bg-border" />
      </div>
    </div>
  );
}
