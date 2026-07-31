import { Button } from "@/components/ui/button";
import PortableTextRenderer from "@/components/portable-text-renderer";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";

type HomeHeroProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "homeHero" }
>;

function BackgroundImage({
  desktop,
  mobile,
}: {
  desktop: HomeHeroProps["backgroundImage"];
  mobile: HomeHeroProps["mobileBackgroundImage"];
}) {
  if (!desktop?.asset?._id && !mobile?.asset?._id) return null;

  return (
    <>
      {desktop?.asset?._id ? (
        <Image
          aria-hidden="true"
          className={mobile?.asset?._id ? "hidden object-cover sm:block" : "object-cover"}
          fill
          priority
          sizes="100vw"
          src={urlFor(desktop).width(1800).height(1200).url()}
          alt=""
        />
      ) : null}
      {mobile?.asset?._id ? (
        <Image
          aria-hidden="true"
          className={desktop?.asset?._id ? "object-cover sm:hidden" : "object-cover"}
          fill
          priority
          sizes="100vw"
          src={urlFor(mobile).width(900).height(1200).url()}
          alt=""
        />
      ) : null}
    </>
  );
}

export default function HomeHero({
  backgroundImage,
  buttons,
  marketPositioning,
  mobileBackgroundImage,
  portraitImage,
  richText,
  servicePromise,
}: HomeHeroProps) {
  return (
    <section
      className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#080d1e] text-white md:min-h-[min(860px,92svh)]"
      id="home-hero"
    >
      <div className="absolute inset-0 -z-20">
        <BackgroundImage desktop={backgroundImage} mobile={mobileBackgroundImage} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(92deg,rgba(8,13,30,.94)_8%,rgba(8,13,30,.62)_46%,rgba(8,13,30,.18)_78%),linear-gradient(0deg,rgba(8,13,30,.88)_0%,rgba(8,13,30,0)_38%)]"
      />
      {portraitImage?.asset?._id ? (
        <div className="pointer-events-none absolute bottom-0 right-[max(calc((100vw-80rem)/2),1.5rem)] z-10 hidden h-[82%] w-[min(48vw,44rem)] lg:block">
          <Image
            className="object-contain object-bottom drop-shadow-[0_30px_60px_rgba(4,8,20,.55)]"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 0px"
            src={urlFor(portraitImage).width(1200).height(1200).fit("max").url()}
            alt={portraitImage.alt || ""}
          />
        </div>
      ) : null}
      <div className="container relative z-20 flex min-h-[calc(100svh-4.5rem)] items-center py-20 md:min-h-[min(860px,92svh)] md:py-24">
        <div className="flex w-full max-w-[37.5rem] flex-col gap-6">
          {marketPositioning ? <p className="sr-only">{marketPositioning}</p> : null}
          {servicePromise ? (
            <h1 className="text-balance text-[clamp(2.75rem,4.6vw,4.125rem)] font-semibold leading-[1.08] tracking-normal text-white">
              {servicePromise}
            </h1>
          ) : null}
          {richText ? (
            <div className="max-w-[34rem] text-base leading-8 text-white/80 sm:text-lg">
              <PortableTextRenderer value={richText} />
            </div>
          ) : null}
          {buttons?.length ? (
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {buttons.map((button, index) => {
                if (!button.href) return null;
                const secondary = index > 0 || button.variant === "secondary" || button.variant === "outline";
                const label = button.text || "Continue";

                return (
                  <Button
                    asChild
                    className={secondary
                      ? "h-12 w-full rounded-[9px] border-white/35 bg-transparent px-6 text-base font-semibold text-white shadow-none hover:border-white/50 hover:bg-white/10 hover:text-white sm:w-auto md:h-[3.25rem] md:px-7"
                      : "h-12 w-full rounded-[9px] bg-cyan-700 px-6 text-base font-semibold text-white shadow-[0_12px_28px_rgba(31,110,140,.28)] hover:bg-cyan-600 sm:w-auto md:h-[3.25rem] md:px-7"}
                    key={button._key || `${button.href}-${index}`}
                    size="lg"
                    variant={secondary ? "outline" : "default"}
                  >
                    <Link
                      href={button.href}
                      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
                      target={button.openInNewTab ? "_blank" : undefined}
                    >
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
