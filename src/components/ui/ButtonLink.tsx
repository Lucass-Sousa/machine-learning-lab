import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
};

const variantClasses = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed",
  secondary:
    "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-muted active:bg-surface-muted",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted active:bg-surface-muted",
} as const;

const sizeClasses = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
} as const;

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
