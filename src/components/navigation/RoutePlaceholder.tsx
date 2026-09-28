import Link from "next/link";

import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Container";

type RoutePlaceholderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

/**
 * Minimal navigation stub for routes that are not implemented yet.
 */
export function RoutePlaceholder({
  title,
  description,
  eyebrow = "Em breve",
}: RoutePlaceholderProps) {
  return (
    <SiteShell>
      <main className="overflow-x-hidden">
        <Container className="flex flex-col gap-6 py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
          <h1 className="font-display max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            {description}
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← Voltar para a Home
          </Link>
        </Container>
      </main>
    </SiteShell>
  );
}
