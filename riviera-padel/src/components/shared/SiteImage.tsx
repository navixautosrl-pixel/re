import Image from "next/image";
import { cn } from "@/lib/utils";

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
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px"
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
