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
  const locked = trail.available === false;

  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1 transition-colors",
          locked ? "bg-border-strong" : accent.bar,
        )}
      />

      <div className="flex flex-col gap-3 pl-2">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            locked ? "text-muted" : accent.category,
          )}
        >
          {trail.category}
        </p>
        <h3
          className={cn(
            "font-display text-xl font-semibold tracking-tight sm:text-2xl",
            locked ? "text-muted" : "text-foreground",
          )}
        >
          {locked ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>🔒</span>
              {trail.title}
            </span>
          ) : (
            trail.title
          )}
        </h3>
        <p
          className={cn(
            "max-w-prose text-sm leading-relaxed sm:text-base",
            locked ? "text-muted/80" : "text-muted",
          )}
        >
          {trail.description}
        </p>
      </div>

      {locked ? (
        <span className="pl-2 text-sm font-medium text-muted">
          {trail.unavailableLabel ?? "Conteúdo ainda não disponível"}
        </span>
      ) : (
        <span className="pl-2 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
          Entrar na trilha
          <span
            aria-hidden
            className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      )}
    </>
  );

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          "relative flex min-h-[11.5rem] flex-col justify-between gap-6 overflow-hidden rounded-xl border border-dashed border-border bg-surface-muted/40 p-5 opacity-70 sm:min-h-[13rem] sm:p-6",
          className,
        )}
      >
        {body}
      </div>
    );
  }

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
      {body}
    </Link>
  );
}
