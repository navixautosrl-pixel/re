"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";

/**
 * Generic modal/lightbox shell (Radix Dialog under the hood — focus trap,
 * Escape-to-close, scroll lock — all handled for us). Reused across demos
 * for image lightboxes and quick-view panels.
 */
export function Lightbox({
  open,
  onOpenChange,
  children,
  labelledBy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  const container = useDemoPortalContainer();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount container={container}>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-labelledby={labelledBy}>
              <motion.div
                className="fixed inset-0 z-[96] flex items-center justify-center p-4 sm:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-[#0c0c0c] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Închide"
                      className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                  <Dialog.Title className="sr-only">Detalii</Dialog.Title>
                  {children}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
