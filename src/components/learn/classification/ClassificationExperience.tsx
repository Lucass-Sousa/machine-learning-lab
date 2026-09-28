"use client";

import Link from "next/link";

import { ClassificationStepProgress } from "@/components/learn/classification/ClassificationStepProgress";
import { ClassificationTrailSteps } from "@/components/learn/classification/ClassificationTrailSteps";
import { useClassificationTrail } from "@/components/learn/classification/useClassificationTrail";
import { Container } from "@/components/ui/Container";

export function ClassificationExperience() {
  const trail = useClassificationTrail();

  return (
    <div className="overflow-x-hidden">
      <div className="border-b border-border bg-surface/80">
        <Container className="flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-data">
                Trilha · Classificação
              </p>
              <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Regressão Logística
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ← Home
            </Link>
          </div>
          <ClassificationStepProgress
            currentIndex={trail.stepIndex}
            onSelect={trail.goTo}
          />
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <ClassificationTrailSteps trail={trail} />
      </Container>
    </div>
  );
}
