"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed"); // e.g. insecure context or permission denied
    }
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-slot)] border-[1.5px] border-ground/40 px-3 text-sm font-semibold text-ground hover:border-ground"
        aria-label={`Copy: ${label}`}
      >
        {state === "copied" ? "Copied" : state === "failed" ? "Select & copy" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? `${label} copied to clipboard` : state === "failed" ? "Copy failed, select the text manually" : ""}
      </span>
    </>
  );
}
