import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Container";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Clusterização · Em breve",
};

export default function ClusteringPage() {
  return (
    <SiteShell showFooter={false}>
      <main>
        <Container className="py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Trilha · Aprendizado não supervisionado
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
            🔒 Clusterização
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted">
            Conteúdo ainda não disponível. Esta trilha será habilitada em uma
            etapa futura — por enquanto o foco está em regressão e classificação.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline"
          >
            ← Voltar às trilhas
          </Link>
        </Container>
      </main>
    </SiteShell>
  );
}
