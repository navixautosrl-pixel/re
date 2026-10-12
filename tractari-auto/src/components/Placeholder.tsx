import type { ReactNode } from "react";

/** Information the business still has to supply — visible on purpose, greppable via data-placeholder. */
export function Placeholder({ children, field }: { children: ReactNode; field: string }) {
  return (
    <span className="ph" data-placeholder={field}>
      <span aria-hidden="true">✎ </span>
      <span className="sr-only">De completat: </span>
      {children}
    </span>
  );
}
