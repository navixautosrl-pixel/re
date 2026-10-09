"use client";
import { LazyMotion, MotionConfig } from "motion/react";

// Animation features are fetched after hydration instead of shipping in the
// first bundle (mobile TBT). `strict` makes any accidental full `motion.*`
// import throw in development. MotionConfig makes everything respect
// prefers-reduced-motion.
const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
