import { activities } from "@/lib/constants";

const item = (
  <div className="flex items-center gap-10 pr-10">
    {activities.map((activity) => (
      <span key={activity} className="flex items-center gap-10">
        <span className="font-display text-3xl uppercase leading-none text-foreground/90 sm:text-4xl">
          {activity}
        </span>
        <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
      </span>
    ))}
  </div>
);

export function QuickIntro() {
  return (
    <div className="overflow-hidden border-y border-border bg-background py-6" aria-hidden="true">
      <div className="marquee-track">
        {item}
        {item}
        {item}
        {item}
      </div>
    </div>
  );
}
