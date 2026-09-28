import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-border/80 py-8">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-sm font-semibold text-foreground">
          ML Lab
        </p>
        <p className="text-sm text-muted">
          Laboratório visual de Machine Learning — client-side.
        </p>
      </Container>
    </footer>
  );
}
