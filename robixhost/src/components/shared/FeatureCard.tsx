import { iconMap } from "./icon-map";

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const Icon = iconMap[icon] ?? iconMap.server;
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-strong">
      <div className="absolute right-0 top-0 h-12 w-12 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-elevated text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
