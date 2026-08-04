import Logo from "@/components/logo";
import Link from "next/link";
import PortableTextRenderer from "@/components/portable-text-renderer";
import { HeaderLink } from "@/components/header/header-link";
import {
  createHeaderNavigationModel,
  type HeaderNavigationModel,
} from "@/components/header/model";
import {
  fetchSanityNavigation,
  fetchSanitySettings,
  getCurrentYear,
} from "@/sanity/lib/fetch";
import {
  getDynamicFetchOptions,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { SETTINGS_QUERY_RESULT } from "@/sanity.types";

type FooterProps = {
  settings: SETTINGS_QUERY_RESULT;
  navigation: HeaderNavigationModel;
  year: number;
};

export function Footer({ settings, navigation, year }: FooterProps) {
  const links = navigation.items.flatMap((item) =>
    item.kind === "link" ? [item.link] : item.links.map((child) => child.link),
  );

  return (
    <footer>
      <div className="dark:bg-background pb-5 xl:pb-5 dark:text-gray-300 text-center">
        <Link
          href="/"
          className="inline-block text-center"
          aria-label="Home page"
        >
          <Logo settings={settings} />
        </Link>
        {links.length > 0 ? (
          <nav
            aria-label="Footer navigation"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm"
          >
            {links.map((link) => (
              <HeaderLink
                className="text-foreground/60 transition-colors hover:text-foreground"
                key={`${link.label}-${link.href}`}
                link={link}
              />
            ))}
          </nav>
        ) : null}
        <div className="mt-8 flex flex-row gap-6 justify-center lg:mt-5 text-xs border-t pt-8">
          <div className="flex items-center gap-2 text-foreground/60">
            <span>&copy; {year}</span>
            {settings?.copyright && (
              <span className="[&>p]:!m-0">
                <PortableTextRenderer value={settings.copyright} />
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterFallback() {
  return (
    <footer aria-busy>
      <div className="dark:bg-background pb-5 xl:pb-5 text-center">
        <div className="container h-24" />
      </div>
    </footer>
  );
}

export async function DynamicFooter() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedFooter perspective={perspective} stega={stega} />;
}

export async function CachedFooter({
  perspective,
  stega,
}: DynamicFetchOptions) {
  const [settings, rawNavigation, year] = await Promise.all([
    fetchSanitySettings({ perspective, stega }),
    fetchSanityNavigation({ perspective, stega }),
    getCurrentYear(),
  ]);

  return (
    <Footer
      settings={settings}
      navigation={createHeaderNavigationModel(rawNavigation)}
      year={year}
    />
  );
}
