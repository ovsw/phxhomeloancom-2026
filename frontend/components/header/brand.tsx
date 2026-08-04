import Image from "next/image";
import type { HeaderBrandModel } from "./model";

export function HeaderBrand({
  brand,
  variant = "desktop",
}: {
  brand: HeaderBrandModel;
  variant?: "desktop" | "mobile";
}) {
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
      className={`${className} h-auto w-[150px] rounded-none object-contain sm:w-[160px]`}
      height={logo.height}
      priority
      quality={100}
      src={logo.src}
      style={
        variant === "desktop"
          ? { height: "56px", objectFit: "contain", width: "160px" }
          : { height: "auto", objectFit: "contain", width: "150px" }
      }
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
