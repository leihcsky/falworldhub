import { cn } from "@/lib/utils";

/** Soft elevated panel — single-layer surface without nested frames. */
export function surfaceClass(className?: string) {
  return cn(
    "rounded-2xl border border-border/60 bg-gradient-to-b from-card via-card to-muted/25",
    "shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.12)]",
    "ring-1 ring-foreground/[0.03]",
    className
  );
}

export function surfaceHoverClass(className?: string) {
  return cn(
    surfaceClass(),
    "transition-[transform,box-shadow,border-color] duration-200",
    "hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_2px_8px_rgb(15_23_42/0.06),0_16px_32px_-16px_rgb(15_23_42/0.18)]",
    className
  );
}
