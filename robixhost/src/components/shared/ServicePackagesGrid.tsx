import { ServicePackageCard } from "./ServicePackageCard";
import { Reveal } from "./Reveal";
import type { ServicePackage } from "@/lib/constants";

export function ServicePackagesGrid({ packages }: { packages: ServicePackage[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {packages.map((pkg, i) => (
        <Reveal key={pkg.tier} delay={i * 0.06}>
          <ServicePackageCard pkg={pkg} />
        </Reveal>
      ))}
    </div>
  );
}
