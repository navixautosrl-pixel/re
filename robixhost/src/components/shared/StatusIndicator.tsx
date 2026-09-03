import { cn } from "@/lib/utils";

type Status = "operational" | "degraded" | "outage";

const statusMeta: Record<Status, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-primary", text: "text-primary" },
  degraded: { label: "Degradat", dot: "bg-warning", text: "text-warning" },
  outage: { label: "Indisponibil", dot: "bg-alert", text: "text-alert" },
};

export function StatusIndicator({
  name,
  status,
  className,
}: {
  name: string;
  status: Status;
  className?: string;
}) {
  const meta = statusMeta[status];
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3",
        className
      )}
    >
      <span className="text-sm text-foreground/90">{name}</span>
      <span className={cn("flex items-center gap-2 font-data text-xs", meta.text)}>
        <span className="relative flex h-2 w-2">
          <span
            className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", meta.dot)}
            aria-hidden="true"
          />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", meta.dot)} aria-hidden="true" />
        </span>
        {meta.label}
      </span>
    </div>
  );
}
