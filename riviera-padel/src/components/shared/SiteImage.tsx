import Image from "next/image";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/basePath";

/**
 * Real Riviera photography — fills its container like MediaPlaceholder
 * does, so the two are interchangeable at the call site as real photos
 * replace placeholders over time.
 */
export function SiteImage({
  src,
  alt,
  className,
  priority = false,
  objectPosition,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-surface", className)}>
      <Image
        src={withBasePath(src)}
        alt={alt}
        fill
        // Not `priority` — under a non-root basePath, Next's priority-image
        // preload <link> is generated with the unprefixed src and 404s.
        // `loading="eager"` still skips the lazy IntersectionObserver defer
        // without going through that broken code path.
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px"
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
