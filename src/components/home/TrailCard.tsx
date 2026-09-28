import Link from "next/link";

import type { Trail } from "@/lib/navigation/trails";
import { cn } from "@/lib/utils/cn";

const accentClasses = {
  teal: {
    bar: "bg-accent",
    category: "text-accent",
    hover: "hover:border-accent/40",
  },
  amber: {
    bar: "bg-data",
    category: "text-data",
    hover: "hover:border-data/40",
  },
  slate: {
    bar: "bg-foreground/70",
    category: "text-muted",
    hover: "hover:border-border-strong",
  },
} as const;

type TrailCardProps = {
  trail: Trail;
  className?: string;
};

export function TrailCard({ trail, className }: TrailCardProps) {
  const accent = accentClasses[trail.accent];

  return (
    <Link
      href={trail.href}
      className={cn(
        "group relative flex min-h-[11.5rem] flex-col justify-between gap-6 overflow-hidden rounded-xl border border-border bg-surface p-5 sm:min-h-[13rem] sm:p-6",
        "transition-[border-color,transform,background-color] duration-200",
        "active:scale-[0.99] active:bg-surface-muted",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        accent.hover,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1 transition-colors",
          accent.bar,
        )}
      />

      <div className="flex flex-col gap-3 pl-2">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            accent.category,
          )}
        >
          {trail.category}
        </p>
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {trail.title}
        </h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          {trail.description}
        </p>
      </div>

      <span className="pl-2 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
        Entrar na trilha
        <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
