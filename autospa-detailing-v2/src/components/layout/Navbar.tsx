"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { label: "Servicii", href: "#servicii" },
  { label: "Recenzii", href: "#recenzii" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled ? "border-border bg-background/85 backdrop-blur-lg" : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1300px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="font-display-caps text-sm tracking-[0.08em]">
          {siteConfig.name}
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-sm px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button asChild size="sm">
            <a href={siteConfig.phoneHref}>
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {siteConfig.phone}
            </a>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Deschide meniul">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-border bg-background text-foreground">
            <SheetHeader>
              <SheetTitle className="text-left font-display-caps text-sm text-foreground">{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <ul className="mt-6 flex flex-col px-4">
              {links.map((l) => (
                <li key={l.href}>
                  <SheetClose asChild>
                    <a href={l.href} className="block border-t border-border py-3 text-base first:border-t-0">
                      {l.label}
                    </a>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <div className="mt-4 px-4">
              <Button asChild className="w-full">
                <a href={siteConfig.phoneHref}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {siteConfig.phone}
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
