"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";

/**
 * SECONDARY motion: fade + 24px rise when the element enters the viewport.
 * The hidden state only exists under `html.js` + no reduced motion (globals.css),
 * so without JS or with reduced motion the content is simply there.
 */
type Props<T extends ElementType> = { as?: T; delay?: number; children: ReactNode } & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function Reveal<T extends ElementType = "div">({ as, delay = 0, children, style, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-reveal="" style={{ ...style, ["--d" as string]: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
