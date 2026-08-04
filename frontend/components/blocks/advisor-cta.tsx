import PortableTextRenderer from "@/components/portable-text-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

type AdvisorCtaBlock = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "advisorCta" }
>;

type AdvisorCtaProps = AdvisorCtaBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

export default function AdvisorCta({
  _key,
  buttons,
  dataAttribute,
  eyebrow,
  portraitImage,
  richText,
  title,
  useCreamBackground,
}: AdvisorCtaProps) {
  const creamSurface = Boolean(stegaClean(useCreamBackground));
  const titleId = `advisor-cta-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "border-t border-slate-200 px-4 py-20 md:px-10 md:py-24",
        creamSurface ? "bg-[#f7f4ed]" : "bg-white",
      )}
      data-sanity={dataAttribute?.("useCreamBackground")}
    >
      <div className="mx-auto grid w-full max-w-[70rem] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-[clamp(2.25rem,5vw,4.5rem)]">
        <div className="relative mx-auto flex w-full max-w-[27.5rem] items-end justify-center overflow-hidden">
          <div
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 left-[8%] right-[8%] top-[16%] rounded-b-3xl rounded-t-[13.75rem]",
              creamSurface ? "bg-white" : "bg-[#fbf9f4]",
            )}
          />
          {portraitImage?.asset?._id ? (
            <Image
              alt={stegaClean(portraitImage.alt) || ""}
              blurDataURL={portraitImage.asset.metadata?.lqip || undefined}
              className="relative z-10 h-auto w-[96%]"
              data-sanity={dataAttribute?.("portraitImage")}
              height={806}
              loading="lazy"
              placeholder={portraitImage.asset.metadata?.lqip ? "blur" : undefined}
              sizes="(min-width: 1024px) 500px, (min-width: 768px) 380px, 88vw"
              src={urlFor(portraitImage).width(680).height(806).url()}
              width={680}
            />
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-5">
          {stegaClean(eyebrow)?.trim() ? (
            <p
              className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-800"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className="text-balance text-[clamp(1.875rem,3vw,2.5rem)] font-semibold leading-[1.12] text-slate-950"
            data-sanity={dataAttribute?.("title")}
            id={titleId}
          >
            {title}
          </h2>
          {richText?.length ? (
            <div
              className="text-pretty text-[1.03125rem] leading-[1.75] text-slate-600 [&_p]:!my-0"
              data-sanity={dataAttribute?.("richText")}
            >
              <PortableTextRenderer value={richText} />
            </div>
          ) : null}
          {buttons?.length ? (
            <div
              className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              data-sanity={dataAttribute?.("buttons")}
            >
              {buttons.slice(0, 2).map((button, index) => {
                const href = stegaClean(button.href);
                const secondary =
                  index > 0 || ["outline", "secondary"].includes(stegaClean(button.variant) || "");
                if (!href) return null;
                return (
                  <Button
                    asChild
                    className={cn(
                      "h-12 w-full rounded-[9px] px-7 text-[0.9375rem] font-semibold sm:w-auto",
                      secondary
                        ? "border-[1.5px] border-slate-300 bg-white text-slate-950 hover:bg-white"
                        : "bg-cyan-700 text-white hover:bg-cyan-600",
                    )}
                    key={button._key}
                    size="lg"
                    variant={secondary ? "outline" : "default"}
                  >
                    <Link
                      href={href}
                      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
                      target={button.openInNewTab ? "_blank" : undefined}
                    >
                      {button.text}
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
