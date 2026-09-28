import { LINEAR_TRAIL_STEPS } from "@/lib/learning/linear-regression/steps";
import { cn } from "@/lib/utils/cn";

type StepProgressProps = {
  currentIndex: number;
  onSelect?: (index: number) => void;
};

export function StepProgress({ currentIndex, onSelect }: StepProgressProps) {
  return (
    <nav aria-label="Etapas da trilha" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1">
        {LINEAR_TRAIL_STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect?.(index)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs transition-colors sm:px-2 sm:text-sm",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  isActive && "bg-accent-soft text-accent",
                  isComplete && "text-foreground",
                  !isActive && !isComplete && "text-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px]",
                    isActive && "bg-accent text-white",
                    isComplete && "bg-foreground text-background",
                    !isActive && !isComplete && "bg-surface-muted text-muted",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.index}
                </span>
                <span className="hidden font-medium lg:inline">{step.label}</span>
              </button>
              {index < LINEAR_TRAIL_STEPS.length - 1 ? (
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
