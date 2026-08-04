import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Button roles — see DESIGN.md § Components → Buttons.
 *
 * Four variants (primary, outline, copper, ghost/link) and two sizes
 * (default, compact). Buttons are flat at rest and lift on hover; the
 * teal action shadow is an opt-in emphasis flag, not a default.
 * Call sites should not override height, padding, or radius.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-interactive-lift disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-ring/50 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  {
    variants: {
      variant: {
        /* `default` is the CMS's name for the primary role; both are kept so
           stored Sanity documents keep resolving. See BUTTON_VARIANTS. */
        default:
          "bg-primary text-primary-foreground hover:bg-accent-hover hover:text-primary-foreground",
        primary:
          "bg-primary text-primary-foreground hover:bg-accent-hover hover:text-primary-foreground",
        /* `secondary` is the CMS's name for the outline role. */
        secondary:
          "border-[1.5px] border-[var(--phx-border-strong)] bg-transparent text-foreground hover:border-primary/30 hover:bg-card hover:text-foreground",
        outline:
          "border-[1.5px] border-[var(--phx-border-strong)] bg-transparent text-foreground hover:border-primary/30 hover:bg-card hover:text-foreground",
        copper: "bg-copper-600 text-white hover:brightness-110",
        ghost: "hover:bg-secondary hover:text-secondary-foreground hover:shadow-none",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
        destructive: "bg-destructive text-primary-foreground hover:brightness-110",
      },
      size: {
        default:
          "typo-button h-(--control-height) px-(--control-inline) has-[>svg]:px-6",
        compact:
          "typo-button h-(--control-height-compact) px-(--control-inline-compact) has-[>svg]:px-4",
        icon: "typo-button size-11",
      },
      /* On dark or photographic surfaces the outline variant needs a light edge. */
      onDark: {
        true: "",
        false: "",
      },
      /* Rare. Reserved for the one primary action a page is built around. */
      emphasis: {
        true: "shadow-teal-action hover:shadow-teal-action",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["outline", "secondary"],
        onDark: true,
        class:
          "border-white/35 text-white hover:border-white/50 hover:bg-white/10 hover:text-white",
      },
      {
        variant: "copper",
        emphasis: true,
        class:
          "shadow-[0_14px_40px_-12px_var(--phx-copper-shadow)] hover:shadow-[0_14px_40px_-12px_var(--phx-copper-shadow)]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      onDark: false,
      emphasis: false,
    },
  }
);

function Button({
  className,
  variant,
  size,
  onDark,
  emphasis,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, onDark, emphasis, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
