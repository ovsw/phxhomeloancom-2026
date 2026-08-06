import Link from "next/link";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";
import { HeaderBrand } from "./brand";
import { HeaderLink } from "./header-link";
import type { HeaderModel } from "./model";
import { SiteHeaderShell } from "./site-header-shell";
import { ModeToggle } from "@/components/menu-toggle";
import { buttonVariants } from "@/components/ui/button";

/**
 * Three brand tiers, each rendered once and toggled by CSS so the header has no
 * layout-shifting client-side width check:
 *
 *  - stacked   — narrowest phones. The two marks sit one above the other, which
 *                is the only arrangement that leaves the main lockup a legible
 *                size once the toggle and hamburger have taken their space.
 *  - compact   — phones and tablets wide enough for the marks side by side,
 *                still on the hamburger.
 *  - desktop   — side by side with the full inline nav.
 *
 * The stacked→compact switch is the `xs:` breakpoint (see globals.css); it was
 * set by measuring the real marks rather than picking a device width, since the
 * assets are what determine when the row stops fitting.
 */
export function Header({ model }: { model: HeaderModel }) {
  const { brand: brandModel, navigation } = model;

  return (
    <SiteHeaderShell>
      <div className="container-wide flex h-(--header-height) items-center justify-between gap-3 xl:gap-6">
        <Link
          aria-label="Home page"
          className="flex shrink-0 items-center rounded-control focus-ring"
          href="/"
        >
          <span className="flex xs:hidden">
            <HeaderBrand brand={brandModel} variant="stacked" />
          </span>
          <span className="hidden xs:flex xl:hidden">
            <HeaderBrand brand={brandModel} variant="compact" />
          </span>
          <span className="hidden xl:flex">
            <HeaderBrand brand={brandModel} variant="desktop" />
          </span>
        </Link>
        <DesktopNav navigation={navigation} />
        <div className="hidden items-center gap-2 xl:flex xl:gap-3">
          <ModeToggle />
          {navigation.actions.map((action) => (
            <HeaderLink
              className={buttonVariants({ size: "compact" })}
              key={action.key}
              link={action.link}
            />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 xl:hidden">
          <ModeToggle />
          <MobileNav
            brand={<HeaderBrand brand={brandModel} variant="compact" />}
            navigation={navigation}
          />
        </div>
      </div>
    </SiteHeaderShell>
  );
}
