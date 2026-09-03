"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { Activity, Server, Network, Gauge } from "lucide-react";

type Metrics = {
  servers: number;
  trafficMbps: number;
  nodesOnline: number;
  uptimeWindow: number; // simulated %, visual only
};

const BASE: Metrics = { servers: 42, trafficMbps: 870, nodesOnline: 18, uptimeWindow: 99.9 };

export function LiveInfrastructure() {
  const prefersReducedMotion = useReducedMotion();
  const [metrics, setMetrics] = useState<Metrics>(BASE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    intervalRef.current = setInterval(() => {
      setMetrics(() => ({
        servers: BASE.servers + Math.round(Math.sin(Date.now() / 4000) * 3),
        trafficMbps: Math.max(
          0,
          Math.round(BASE.trafficMbps + Math.sin(Date.now() / 1200) * 140 + (Math.random() - 0.5) * 60)
        ),
        nodesOnline: BASE.nodesOnline + (Math.random() > 0.7 ? Math.round((Math.random() - 0.5) * 2) : 0),
        uptimeWindow: 99.9,
      }));
    }, 1400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <section id="infrastructure" className="border-b border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="INFRASTRUCTURĂ"
              title="O privire în infrastructura RobixHost"
              description="Vizualizare a rețelei de servere, noduri și trafic."
            />
            <ConfigBadge>LIVE INFRASTRUCTURE PREVIEW · SIMULATED DATA</ConfigBadge>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile icon={Server} label="Servere active" value={metrics.servers.toString()} />
            <MetricTile icon={Network} label="Noduri online" value={metrics.nodesOnline.toString()} />
            <MetricTile
              icon={Activity}
              label="Trafic curent"
              value={`${metrics.trafficMbps} Mbps`}
            />
            <MetricTile icon={Gauge} label="Fereastră uptime (demo)" value={`${metrics.uptimeWindow}%`} />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <NetworkMap />
        </Reveal>
      </div>
    </section>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

const NODES = [
  { x: "12%", y: "30%" },
  { x: "28%", y: "70%" },
  { x: "50%", y: "20%" },
  { x: "68%", y: "62%" },
  { x: "85%", y: "35%" },
  { x: "45%", y: "85%" },
];

function NetworkMap() {
  return (
    <div className="relative h-64 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="12%" y1="30%" x2="50%" y2="20%" stroke="var(--color-border-strong)" strokeWidth="1" />
        <line x1="50%" y1="20%" x2="85%" y2="35%" stroke="var(--color-border-strong)" strokeWidth="1" />
        <line x1="28%" y1="70%" x2="50%" y2="20%" stroke="var(--color-border-strong)" strokeWidth="1" />
        <line x1="68%" y1="62%" x2="50%" y2="20%" stroke="var(--color-border-strong)" strokeWidth="1" />
        <line x1="45%" y1="85%" x2="68%" y2="62%" stroke="var(--color-border-strong)" strokeWidth="1" />
      </svg>
      {NODES.map((n, i) => (
        <span
          key={i}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]"
          style={{ left: n.x, top: n.y, animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <span className="absolute bottom-3 right-3 font-data text-[10px] text-muted-foreground">
        NODE MAP — DEMO
      </span>
    </div>
  );
}
