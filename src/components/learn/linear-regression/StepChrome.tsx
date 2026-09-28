import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function StepShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 sm:gap-8", className)}>
      {children}
    </div>
  );
}

export function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <div className="space-y-3 text-base leading-relaxed text-muted">
          {description}
        </div>
      ) : null}
    </div>
  );
}

export function StepActions({
  onBack,
  onNext,
  nextLabel = "Continuar →",
  nextDisabled = false,
  backLabel = "Voltar",
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          size="lg"
          className="w-full sm:w-auto"
        >
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
}
