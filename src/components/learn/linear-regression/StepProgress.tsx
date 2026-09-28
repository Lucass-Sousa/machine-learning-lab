import { LINEAR_REGRESSION_STEPS } from "@/lib/learning/linear-regression/steps";
import { cn } from "@/lib/utils/cn";

type StepProgressProps = {
  currentIndex: number;
};

export function StepProgress({ currentIndex }: StepProgressProps) {
  return (
    <nav aria-label="Etapas da trilha" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {LINEAR_REGRESSION_STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs sm:px-2.5 sm:text-sm",
                  isActive && "bg-accent-soft text-accent",
                  isComplete && "text-foreground",
                  !isActive && !isComplete && "text-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px]",
                    isActive && "bg-accent text-white",
                    isComplete && "bg-foreground text-background",
                    !isActive && !isComplete && "bg-surface-muted text-muted",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.index}
                </span>
                <span className="hidden font-medium sm:inline">{step.label}</span>
              </div>
              {index < LINEAR_REGRESSION_STEPS.length - 1 ? (
                <span aria-hidden className="text-border-strong">
                  ·
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
