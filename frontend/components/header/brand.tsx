import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeaderBrandModel, HeaderLogoModel } from "./model";

/**
 * Rendered heights, in px, for the two marks.
 *
 * Both assets are wide and short (roughly 7.7:1 and 5.5:1), so height is the
 * dimension that has to be controlled — matching their widths instead would
 * leave them at visibly different sizes. The secondary sits deliberately
 * smaller: it is attribution, not the site's identity, and the previous
 * combined lockup read the wrong way round precisely because the parent brand
 * carried the larger type.
 */
const LOGO_HEIGHTS = {
  desktop: { main: 27, secondary: 23 },
  compact: { main: 22, secondary: 17 },
  stacked: { main: 24, secondary: 19 },
} as const;

type BrandVariant = keyof typeof LOGO_HEIGHTS;

function LogoImage({
  className,
  height,
  logo,
  alt,
  priority,
}: {
  className?: string;
  height: number;
  logo: HeaderLogoModel;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt={alt}
      className={cn("w-auto object-contain", className)}
      height={logo.height}
      priority={priority}
      quality={100}
      src={logo.src}
      style={{ height: `${height}px`, width: "auto" }}
      width={logo.width}
    />
  );
}

/**
 * One mark, in whichever theme variant exists.
 *
 * With only a light asset uploaded the light file is inverted for dark mode.
 * That is a stopgap the schema anticipates: multi-color marks do not invert
 * cleanly, so a dedicated dark file replaces this the moment one is supplied,
 * with no code change.
 */
function ThemedLogo({
  alt,
  dark,
  height,
  light,
  priority,
}: {
  alt: string;
  dark: HeaderLogoModel | null;
  height: number;
  light: HeaderLogoModel | null;
  priority?: boolean;
}) {
  if (!light && !dark) return null;

  if (!dark) {
    return (
      <LogoImage
        alt={alt}
        className="dark:invert"
        height={height}
        logo={light!}
        priority={priority}
      />
    );
  }

  return (
    <>
      {light ? (
        <LogoImage
          alt={alt}
          className="dark:hidden"
          height={height}
          logo={light}
          priority={priority}
        />
      ) : null}
      <LogoImage
        alt={light ? "" : alt}
        className={light ? "hidden dark:block" : undefined}
        height={height}
        logo={dark}
        priority={priority}
      />
    </>
  );
}

export function HeaderBrand({
  brand,
  variant = "desktop",
}: {
  brand: HeaderBrandModel;
  variant?: BrandVariant;
}) {
  const { dark, label, light, secondary } = brand;
  const heights = LOGO_HEIGHTS[variant];
  const hasMain = Boolean(light || dark);
  const hasSecondary = Boolean(secondary.light || secondary.dark);

  const mainMark = hasMain ? (
    <ThemedLogo
      alt={label}
      dark={dark}
      height={heights.main}
      light={light}
      priority
    />
  ) : (
    <span className="text-lg font-semibold tracking-tight">{label}</span>
  );

  if (!hasSecondary) return mainMark;

  return (
    <span
      className={cn(
        "flex min-w-0",
        /*
         * Stacked keeps the two marks left-aligned rather than centred: the
         * header row is left-anchored, and centring would leave the shorter
         * mark floating off the shared left edge.
         */
        variant === "stacked"
          ? "flex-col items-start gap-1.5"
          : variant === "compact"
            ? "flex-row items-center gap-2"
            : "flex-row items-center gap-3 xl:gap-4",
      )}
    >
      {mainMark}
      {/*
        Divider only in the side-by-side variants. Stacked already separates the
        two marks along the axis they are read in, so a rule there would be
        stating the same break twice.
      */}
      {variant !== "stacked" ? (
        <span
          aria-hidden="true"
          className={cn(
            "w-px shrink-0 bg-border",
            variant === "compact" ? "h-5" : "h-6",
          )}
        />
      ) : null}
      <ThemedLogo
        alt={secondary.label}
        dark={secondary.dark}
        height={heights.secondary}
        light={secondary.light}
      />
    </span>
  );
}
