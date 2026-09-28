import { cn } from "@/lib/utils/cn";

type LabToolbarProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function LabToolbar({
  title,
  subtitle,
  actions,
  className,
}: LabToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border bg-surface/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
