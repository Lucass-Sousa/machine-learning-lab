import { FreeLabEntry } from "@/components/home/FreeLabEntry";
import { HomeHero } from "@/components/home/HomeHero";
import { TrailGrid } from "@/components/home/TrailGrid";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Container";
import { LEARNING_TRAILS } from "@/lib/navigation/trails";

export default function HomePage() {
  return (
    <SiteShell>
      <main className="overflow-x-hidden">
        <Container className="pb-16 sm:pb-20">
          <HomeHero />

          <section
            aria-labelledby="trails-heading"
            className="flex flex-col gap-6 sm:gap-8"
          >
            <div className="animate-fade-up animation-delay-100 flex flex-col gap-2">
              <h2
                id="trails-heading"
                className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl"
              >
                Trilhas de aprendizagem
              </h2>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Escolha um conceito e entre em uma experiência guiada.
              </p>
            </div>

            <TrailGrid trails={LEARNING_TRAILS} />
          </section>

          <div className="mt-12 sm:mt-16">
            <FreeLabEntry />
          </div>
        </Container>
      </main>
    </SiteShell>
  );
}
