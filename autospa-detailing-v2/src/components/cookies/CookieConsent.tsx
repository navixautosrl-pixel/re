"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export const OPEN_PREFERENCES_EVENT = "autospa:open-cookie-preferences";

export function CookieConsent() {
  const { decided, hydrated, acceptAll, rejectOptional } = useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {!decided ? (
        <div
          role="dialog"
          aria-label="Preferințe cookie"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-[1300px] flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Folosim doar cookie-uri necesare funcționării site-ului — vezi{" "}
                <Link href="/cookies" className="text-foreground underline underline-offset-2">
                  politica cookie
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button variant="outline" onClick={rejectOptional}>Respinge opționalele</Button>
              <Button variant="primary" onClick={acceptAll}>Acceptă toate</Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="border-border bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Preferințe cookie</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Acest site folosește doar cookie-uri strict necesare.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="primary" onClick={() => setPreferencesOpen(false)}>Închide</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
