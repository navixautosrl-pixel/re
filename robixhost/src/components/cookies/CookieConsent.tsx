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
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export const OPEN_PREFERENCES_EVENT = "robixhost:open-cookie-preferences";

export function CookieConsent() {
  const { decided, hydrated, categories, acceptAll, rejectOptional, savePreferences } =
    useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, marketing: false });

  const openPreferences = () => {
    setDraft({ analytics: categories.analytics, marketing: categories.marketing });
    setPreferencesOpen(true);
  };

  useEffect(() => {
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.analytics, categories.marketing]);

  if (!hydrated) return null;

  return (
    <>
      {!decided ? (
        <div
          role="dialog"
          aria-label="Preferințe cookie"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Folosim cookie-uri strict necesare pentru funcționarea site-ului. Cu acordul tău,
                folosim și cookie-uri de analytics/marketing — vezi{" "}
                <Link href="/cookies" className="text-foreground underline underline-offset-2">
                  politica cookie
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={openPreferences}
              >
                Preferințe
              </Button>
              <Button
                variant="outline"
                className="border-border bg-transparent hover:bg-surface-elevated"
                onClick={rejectOptional}
              >
                Respinge opționalele
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={acceptAll}
              >
                Acceptă toate
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="border-border bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display">Preferințe cookie</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Alege ce categorii de cookie-uri sunt active. Cookie-urile necesare nu pot fi
              dezactivate — sunt cerute pentru funcționarea de bază a site-ului.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <PreferenceRow
              title="Necesare"
              description="Funcționarea de bază a site-ului (ex: reținerea acestei preferințe). Mereu active."
              checked
              disabled
            />
            <PreferenceRow
              title="Analytics"
              description="Ne ajută să înțelegem cum este folosit site-ul. Nu se încarcă fără acordul tău."
              checked={draft.analytics}
              onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
            />
            <PreferenceRow
              title="Marketing"
              description="Folosite pentru măsurarea campaniilor. Nu se încarcă fără acordul tău."
              checked={draft.marketing}
              onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-border bg-transparent hover:bg-surface-elevated"
              onClick={() => {
                rejectOptional();
                setPreferencesOpen(false);
              }}
            >
              Respinge opționalele
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                savePreferences(draft);
                setPreferencesOpen(false);
              }}
            >
              Salvează preferințele
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface-elevated p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
