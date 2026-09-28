import Link from "next/link";

import { FREE_LAB } from "@/lib/navigation/trails";
import { cn } from "@/lib/utils/cn";

type FreeLabEntryProps = {
  className?: string;
};

export function FreeLabEntry({ className }: FreeLabEntryProps) {
  return (
    <section
      aria-labelledby="free-lab-heading"
      className={cn("animate-fade-up animation-delay-300", className)}
    >
      <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted/40 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Experimentação
            </p>
            <h2
              id="free-lab-heading"
              className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              🧪 Laboratório Livre
            </h2>
            <p className="text-base leading-relaxed text-muted">
              {FREE_LAB.description}
            </p>
          </div>

          <Link
            href={FREE_LAB.href}
            className={cn(
              "inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background",
              "transition-colors hover:bg-foreground/90 active:bg-foreground/80",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            Abrir laboratório
          </Link>
        </div>
      </div>
    </section>
  );
}
