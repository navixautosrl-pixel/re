import { cn } from "@/lib/utils";

type Status = "operational" | "degraded" | "outage";

const statusMeta: Record<Status, { label: string; dot: string; text: string }> = {
  operational: { label: "Operațional", dot: "bg-success", text: "text-success" },
  degraded: { label: "Degradat", dot: "bg-amber-500", text: "text-amber-500" },
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
    <div className={cn("flex items-center justify-between border-t border-border py-4", className)}>
      <span className="text-sm text-foreground/90">{name}</span>
      <span className={cn("flex items-center gap-2 font-mono-tech text-xs", meta.text)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
        {meta.label}
      </span>
    </div>
  );
}
