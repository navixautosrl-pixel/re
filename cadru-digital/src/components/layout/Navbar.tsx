"use client";

import { useEffect, useState } from "react";
import { Menu, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { navLinks, siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300",
        scrolled ? "border-border bg-background/85 backdrop-blur-lg" : "border-transparent bg-transparent"
      )}
    >
      <nav
        className={cn(
          "container-max flex items-center justify-between px-6 transition-all duration-300 lg:px-10",
          scrolled ? "h-[64px]" : "h-[84px]"
        )}
      >
        <a href="#top" className="font-display text-lg tracking-[-0.01em] text-foreground">
          {siteConfig.name}
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
              <span className="absolute bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button asChild size="sm">
            <a href="#contact">
              Începe un proiect
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Deschide meniul">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <ul className="mt-8 flex flex-col">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <SheetClose asChild>
                    <a href={l.href} className="block border-t border-border py-4 font-display text-2xl first:border-t-0">
                      {l.label}
                    </a>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <a href="#contact">Începe un proiect</a>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
