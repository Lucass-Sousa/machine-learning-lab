import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type StepShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function StepShell({ children, className }: StepShellProps) {
  return (
    <div className={cn("flex flex-col gap-6 sm:gap-8", className)}>
      {children}
    </div>
  );
}

type StepHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
};

export function StepHeader({ eyebrow, title, description }: StepHeaderProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
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

type StepActionsProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
};

export function StepActions({
  onBack,
  onNext,
  nextLabel = "Continuar →",
  nextDisabled = false,
  backLabel = "Voltar",
}: StepActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} className="justify-start sm:min-w-28">
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Button onClick={onNext} disabled={nextDisabled} size="lg" className="w-full sm:w-auto">
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
}
