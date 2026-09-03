"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { navGroups, navSingleLinks, siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
        scrolled ? "border-border bg-background/80 backdrop-blur-lg" : "border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Navigare principală"
        className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RobixHost — acasă">
          <Image src="/brand/logo.webp" alt="" width={28} height={28} className="h-7 w-7" priority />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navGroups.map((group) => (
            <NavDropdown key={group.label} label={group.label} items={group.items} />
          ))}
          {navSingleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button asChild variant="outline" size="sm">
            <a href={siteConfig.clientAreaUrl} target="_blank" rel="noopener noreferrer">
              Cont client
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
          <SheetContent side="right" className="w-[300px] border-border bg-background text-foreground sm:w-[360px]">
            <SheetHeader>
              <SheetTitle className="text-left text-foreground">{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-6 px-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 font-mono-tech text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="flex flex-col">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            className="block border-t border-border py-3 text-base first:border-t-0"
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <ul className="flex flex-col">
                  {navSingleLinks.map((link) => (
                    <li key={link.href}>
                      <SheetClose asChild>
                        <Link href={link.href} className="block border-t border-border py-3 text-base first:border-t-0">
                          {link.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild variant="primary" className="w-full">
                <a href={siteConfig.clientAreaUrl} target="_blank" rel="noopener noreferrer">
                  Cont client
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string; description: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="flex items-center gap-1 rounded-sm px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={open}
        >
          {label}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        align="start"
        sideOffset={12}
        className="w-[360px] border-border bg-surface p-2"
      >
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-surface-elevated"
              >
                <span className="block text-sm font-medium text-foreground">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
