"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SiteImage } from "@/components/shared/SiteImage";

type GalleryItem =
  | { type: "photo"; src: string; objectPosition?: string; caption: string; ratio: string }
  | { type: "placeholder"; variant: "padel" | "ping-pong" | "biliard" | "lounge" | "general"; caption: string; ratio: string };

const items: GalleryItem[] = [
  { type: "photo", src: "/images/riviera-exterior.webp", caption: "Intrarea Riviera", ratio: "aspect-[4/5]" },
  {
    type: "photo",
    src: "/images/riviera-lounge-court.webp",
    caption: "Lounge cu vedere spre teren",
    ratio: "aspect-[4/3]",
  },
  {
    type: "photo",
    src: "/images/riviera-padel-action.webp",
    caption: "Meci de padel",
    ratio: "aspect-square",
  },
  { type: "placeholder", variant: "general", caption: "Atmosferă de seară", ratio: "aspect-[4/5]" },
  {
    type: "photo",
    src: "/images/riviera-biliard-pingpong.webp",
    objectPosition: "70% 65%",
    caption: "Zona de biliard și ping-pong",
    ratio: "aspect-[4/3]",
  },
  { type: "placeholder", variant: "padel", caption: "Detaliu teren", ratio: "aspect-square" },
  { type: "placeholder", variant: "lounge", caption: "Comunitate Riviera", ratio: "aspect-[4/5]" },
];

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <section id="galerie" className="bg-background section-y">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Galerie" title="Riviera, în imagini" className="mb-14" />

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((item, i) => (
            <Reveal key={`${item.caption}-${i}`} delay={(i % 3) * 0.06} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="group block w-full overflow-hidden rounded-sm text-left"
                aria-label={`Vezi imagine mărită: ${item.caption}`}
              >
                <div className={`relative overflow-hidden ${item.ratio}`}>
                  <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.05]">
                    {item.type === "photo" ? (
                      <SiteImage
                        src={item.src}
                        alt={item.caption}
                        className="h-full w-full"
                        objectPosition={item.objectPosition}
                      />
                    ) : (
                      <MediaPlaceholder variant={item.variant} className="h-full w-full" tag="" />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-foreground">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog.Root open={openIndex !== null} onOpenChange={(v) => !v && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-4 z-[70] flex flex-col items-center justify-center sm:inset-10"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">{active?.caption ?? "Imagine galerie"}</Dialog.Title>
            {active ? (
              <div className="w-full max-w-3xl">
                {active.type === "photo" ? (
                  <SiteImage
                    src={active.src}
                    alt={active.caption}
                    objectPosition={active.objectPosition}
                    className="aspect-[4/3] w-full rounded-sm"
                  />
                ) : (
                  <MediaPlaceholder variant={active.variant} tag="" className="aspect-[4/3] w-full rounded-sm" />
                )}
                <p className="font-mono mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {active.caption}
                </p>
              </div>
            ) : null}
            <Dialog.Close
              className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-sm border border-border-strong text-foreground sm:-right-4 sm:-top-4"
              aria-label="Închide"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
