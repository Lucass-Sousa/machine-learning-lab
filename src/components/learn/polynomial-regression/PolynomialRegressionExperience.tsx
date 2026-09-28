"use client";

import Link from "next/link";

import { PolynomialStepProgress } from "@/components/learn/polynomial-regression/PolynomialStepProgress";
import { PolynomialTrailSteps } from "@/components/learn/polynomial-regression/PolynomialTrailSteps";
import { usePolynomialRegressionTrail } from "@/components/learn/polynomial-regression/usePolynomialRegressionTrail";
import { Container } from "@/components/ui/Container";

export function PolynomialRegressionExperience() {
  const trail = usePolynomialRegressionTrail();

  return (
    <div className="overflow-x-hidden">
      <div className="border-b border-border bg-surface/80">
        <Container className="flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Trilha · Regressão
              </p>
              <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Regressão Polinomial
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ← Home
            </Link>
          </div>
          <PolynomialStepProgress
            currentIndex={trail.stepIndex}
            onSelect={trail.goTo}
          />
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <PolynomialTrailSteps trail={trail} />
      </Container>
    </div>
  );
}
