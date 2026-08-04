import Image from "next/image";
import type { HeaderBrandModel } from "./model";

export function HeaderBrand({ brand }: { brand: HeaderBrandModel }) {
  const { dark, label, light } = brand;

  if (!light && !dark) {
    return <span className="text-lg font-semibold tracking-tight">{label}</span>;
  }

  const renderLogo = (
    logo: NonNullable<HeaderBrandModel["light"]>,
    className: string,
  ) => (
    <Image
      alt={label}
      className={`${className} h-14 w-auto max-w-40 object-contain`}
      height={logo.height}
      priority
      quality={100}
      src={logo.src}
      width={logo.width}
    />
  );

  return (
    <>
      {renderLogo(light ?? dark!, dark ? "dark:hidden" : "dark:invert")}
      {dark ? renderLogo(dark, "hidden dark:block") : null}
    </>
  );
}
