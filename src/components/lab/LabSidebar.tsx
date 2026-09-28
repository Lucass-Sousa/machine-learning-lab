import { cn } from "@/lib/utils/cn";

type LabSidebarProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function LabSidebar({
  children,
  className,
  title = "Controles",
}: LabSidebarProps) {
  return (
    <aside
      aria-label={title}
      className={cn(
        "flex w-full flex-col border-border bg-surface lg:w-80 lg:shrink-0 lg:border-l xl:w-96",
        className,
      )}
    >
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Ajuste parâmetros e observe o gráfico.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
    </aside>
  );
}
