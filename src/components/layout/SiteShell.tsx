import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type SiteShellProps = {
  children: React.ReactNode;
  /** Hide footer on immersive lab layouts */
  showFooter?: boolean;
};

export function SiteShell({ children, showFooter = true }: SiteShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-atmosphere">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
