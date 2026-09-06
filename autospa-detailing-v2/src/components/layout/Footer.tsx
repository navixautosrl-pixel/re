import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1300px] px-6 py-14 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display-caps text-sm tracking-[0.08em]">{siteConfig.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-foreground">
              <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {siteConfig.phone}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {siteConfig.address}
            </span>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.name}. Toate drepturile rezervate.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Confidențialitate</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookie-uri</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
