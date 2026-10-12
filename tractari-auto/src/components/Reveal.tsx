"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

/** SECONDARY motion: fade + rise on entering the viewport. Hidden only under html.js + motion allowed. */
type Props<T extends ElementType> = { as?: T; delay?: number; children: ReactNode } & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function Reveal<T extends ElementType = "div">({ as, delay = 0, children, style, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.setAttribute("data-in", "");
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-reveal="" style={{ ...style, ["--d" as string]: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
