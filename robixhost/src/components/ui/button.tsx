import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button system for ROBIXHOST. Two tiers of emphasis only:
 *  - `primary`: solid off-white on near-black — maximum, confident
 *    contrast, monochrome (Vercel/Linear convention: the brand accent is
 *    reserved for links/focus/small detail, not the CTA fill).
 *  - `accent`: the one place the brand cobalt fills a surface — used
 *    sparingly, for a single secondary emphasis moment per view.
 * `outline`/`ghost`/`link` cover everything lower-emphasis. No shadows,
 * hairline borders only, tight radius.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.9375rem] font-medium tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:border-foreground/40 hover:bg-surface",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface",
        link: "text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
