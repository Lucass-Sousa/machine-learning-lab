export function HomeHero() {
  return (
    <header className="animate-fade-up flex flex-col gap-4 py-10 sm:gap-5 sm:py-14 lg:py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        ML Lab
      </p>
      <h1 className="font-display max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        O que você quer aprender hoje?
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        Explore conceitos de Machine Learning de forma visual, interativa e
        prática.
      </p>
    </header>
  );
}
