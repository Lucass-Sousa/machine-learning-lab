import { cn } from "@/lib/utils/cn";

type ChartPlaceholderProps = {
  children?: React.ReactNode;
  className?: string;
  label?: string;
};

/**
 * Frame reserved for interactive charts and animations.
 * Keeps a consistent canvas chrome across lab experiments.
 */
export function ChartPlaceholder({
  children,
  className,
  label = "Canvas do experimento",
}: ChartPlaceholderProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "relative flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface sm:min-h-[420px]",
        className,
      )}
    >
      {children}
    </section>
  );
}
