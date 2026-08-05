import DesktopNav from "@/components/header/desktop-nav";
import { prototypeNavigation } from "./fixture";
import { RadixNav } from "./radix-nav";

export const metadata = { title: "Nav prototype", robots: { index: false, follow: false } };

export default function NavPrototypePage() {
  return (
    <main className="min-h-dvh pb-[40rem]">
      <div className="container py-10">
        <h1 className="typo-h2 mb-2">Navigation comparison</h1>
        <p className="typo-body max-w-2xl text-muted-foreground">
          Same Sanity-shaped content in both bars: the four live groups plus
          Resources and Calculators, so the rightmost triggers sit well away from
          centre. Hover across the groups in each bar and watch where the panel
          lands relative to the trigger you are pointing at.
        </p>
      </div>

      <section className="border-y border-border bg-background">
        <div className="container">
          <p className="pt-4 text-[10px] uppercase tracking-wide text-muted-foreground">
            A — current: motion follow-along (panel tracks the trigger)
          </p>
          <div className="flex h-(--header-height) items-center">
            <DesktopNav navigation={prototypeNavigation} />
          </div>
        </div>
      </section>

      <section className="mt-16 border-y border-border bg-background">
        <div className="container">
          <p className="pt-4 text-[10px] uppercase tracking-wide text-muted-foreground">
            B — navbar14: Radix viewport (shared panel, centred under the nav)
          </p>
          <div className="flex h-(--header-height) items-center">
            <RadixNav navigation={prototypeNavigation} />
          </div>
        </div>
      </section>
    </main>
  );
}
