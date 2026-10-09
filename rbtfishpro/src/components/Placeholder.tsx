import type { ReactNode } from "react";

/**
 * Marks information the business still has to supply. Visible on purpose and
 * greppable (`data-placeholder`) so none survives to launch unnoticed.
 */
export function Placeholder({ children, field }: { children: ReactNode; field: string }) {
  return (
    <span className="ph" data-placeholder={field}>
      <span aria-hidden="true">✎</span>
      <span>
        <span className="sr-only">Informație de completat: </span>
        {children}
      </span>
    </span>
  );
}
