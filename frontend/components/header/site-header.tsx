import Link from "next/link";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";
import { HeaderBrand } from "./brand";
import { HeaderLink } from "./header-link";
import type { HeaderModel } from "./model";
import { SiteHeaderShell } from "./site-header-shell";
import { ModeToggle } from "@/components/menu-toggle";

export function Header({ model }: { model: HeaderModel }) {
  const { brand: brandModel, navigation } = model;
  const brand = <HeaderBrand brand={brandModel} />;

  return (
    <SiteHeaderShell>
      <div className="mx-auto flex h-[86px] w-full max-w-7xl items-center justify-between gap-4 px-5 md:px-8 lg:px-5 xl:gap-8 xl:px-10">
        <Link aria-label="Home page" className="flex h-14 shrink-0 items-center" href="/">
          {brand}
        </Link>
        <DesktopNav navigation={navigation} />
        <div className="hidden items-center gap-2 lg:flex xl:gap-3">
          <ModeToggle />
          {navigation.actions.map((action) => (
            <HeaderLink
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-[14.5px] font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50"
              key={action.key}
              link={action.link}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <ModeToggle />
          <MobileNav
            brand={<HeaderBrand brand={brandModel} variant="mobile" />}
            navigation={navigation}
          />
        </div>
      </div>
    </SiteHeaderShell>
  );
}
