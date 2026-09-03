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
    <div className="border-t border-border pt-6">
      <Icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
      <h3 className="mt-5 text-base font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
