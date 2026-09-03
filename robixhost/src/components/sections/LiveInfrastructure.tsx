"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { Activity, Server, Network, Gauge } from "lucide-react";

type Metrics = { servers: number; trafficMbps: number; nodesOnline: number };
const BASE: Metrics = { servers: 42, trafficMbps: 870, nodesOnline: 18 };

export function LiveInfrastructure() {
  const prefersReducedMotion = useReducedMotion();
  const [metrics, setMetrics] = useState<Metrics>(BASE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    intervalRef.current = setInterval(() => {
      setMetrics(() => ({
        servers: BASE.servers + Math.round(Math.sin(Date.now() / 4000) * 3),
        trafficMbps: Math.max(0, Math.round(BASE.trafficMbps + Math.sin(Date.now() / 1200) * 140 + (Math.random() - 0.5) * 60)),
        nodesOnline: BASE.nodesOnline + (Math.random() > 0.7 ? Math.round((Math.random() - 0.5) * 2) : 0),
      }));
    }, 1400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <section id="infrastructure" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index="02" eyebrow="Infrastructură" title="Rețeaua RobixHost, la vedere" />
          <ConfigBadge>Preview simulat, nu date live</ConfigBadge>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-4">
            <MetricTile icon={Server} label="Servere active" value={metrics.servers.toString()} />
            <MetricTile icon={Network} label="Noduri online" value={metrics.nodesOnline.toString()} />
            <MetricTile icon={Activity} label="Trafic curent" value={`${metrics.trafficMbps} Mbps`} />
            <MetricTile icon={Gauge} label="Protecție DDoS" value="Activă" />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-5">
          <NetworkMap />
        </Reveal>
      </div>
    </section>
  );
}

function MetricTile({ icon: Icon, label, value }: { icon: typeof Server; label: string; value: string }) {
  return (
    <div className="bg-background p-6">
      <Icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
      <p className="mt-4 text-2xl font-semibold tabular-nums tracking-[-0.01em]">{value}</p>
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
    <div className="relative h-56 overflow-hidden rounded-lg border border-border sm:h-64">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
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
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: n.x, top: n.y }}
        />
      ))}
    </div>
  );
}
