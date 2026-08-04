import PortableTextRenderer from "@/components/portable-text-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

type PersonCtaBlock = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "personCta" }
>;

type PersonCtaProps = PersonCtaBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

function KeyDetails({
  creamSurface,
  dataAttribute,
  details,
}: Readonly<{
  creamSurface: boolean;
  dataAttribute?: PersonCtaProps["dataAttribute"];
  details?: PersonCtaProps["keyDetails"];
}>) {
  const title = stegaClean(details?.title)?.trim();
  const items = (details?.items ?? [])
    .map((item, index) => ({ index, value: stegaClean(item)?.trim() }))
    .filter((item): item is { index: number; value: string } =>
      Boolean(item.value),
    )
    .slice(0, 8);

  if (!items.length) return null;

  return (
    <div className="mt-1">
      {title ? (
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          data-sanity={dataAttribute?.("keyDetails.title")}
        >
          {title}
        </p>
      ) : null}
      <ul className="flex list-none flex-wrap gap-2.5 p-0">
        {items.map((item) => (
          <li
            className={cn(
              "rounded-full border border-slate-200 px-[1.125rem] py-2 text-[0.90625rem] font-medium text-slate-600",
              creamSurface ? "bg-white" : "bg-[#f7f4ed]",
            )}
            data-sanity={dataAttribute?.(`keyDetails.items[${item.index}]`)}
            key={`${item.value}-${item.index}`}
          >
            {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonButtons({
  buttons,
  dataAttribute,
}: Readonly<Pick<PersonCtaProps, "buttons" | "dataAttribute">>) {
  if (!buttons?.length) return null;

  return (
    <div
      className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
      data-sanity={dataAttribute?.("buttons")}
    >
      {buttons.slice(0, 2).map((button, index) => {
        const href = stegaClean(button.href);
        const variant = stegaClean(button.variant);
        const secondary =
          index > 0 || variant === "outline" || variant === "secondary";

        if (!href) {
          return (
            <Button
              className="h-12 w-full rounded-[9px] px-7 text-[0.9375rem] font-semibold sm:w-auto"
              disabled
              key={button._key || `broken-button-${index}`}
              size="lg"
            >
              Link Broken
            </Button>
          );
        }

        return (
          <Button
            asChild
            className={cn(
              "h-12 w-full rounded-[9px] px-7 text-[0.9375rem] font-semibold transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 sm:w-auto",
              secondary
                ? "border-[1.5px] border-slate-300 bg-white text-slate-950 shadow-none hover:border-cyan-700/30 hover:bg-white hover:text-slate-950"
                : "bg-cyan-700 text-white hover:bg-cyan-600 hover:text-white",
            )}
            key={button._key || `${href}-${index}`}
            size="lg"
            variant={secondary ? "outline" : "default"}
          >
            <Link
              href={href}
              rel={stegaClean(button.openInNewTab) ? "noopener noreferrer" : undefined}
              target={stegaClean(button.openInNewTab) ? "_blank" : undefined}
            >
              {button.text || "Continue"}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export default function PersonCta({
  _key,
  buttons,
  dataAttribute,
  eyebrow,
  keyDetails,
  personImage,
  richText,
  title,
  useCreamBackground,
}: PersonCtaProps) {
  const creamSurface = Boolean(stegaClean(useCreamBackground));
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const titleId = _key
    ? `person-cta-${stegaClean(_key)}-title`
    : undefined;

  return (
    <section
      aria-labelledby={displayTitle ? titleId : undefined}
      className={cn(
        "border-t border-slate-200 px-4 pb-20 pt-14 min-[700px]:px-8 min-[700px]:py-16 lg:px-10 lg:py-24",
        creamSurface ? "bg-[#f7f4ed]" : "bg-white",
      )}
    >
      <div className="mx-auto grid w-full max-w-[70rem] items-center gap-10 min-[700px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[700px]:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-[clamp(2.25rem,5vw,4.5rem)]">
        <div className="relative mx-auto flex w-full max-w-[18.75rem] items-end justify-center overflow-hidden sm:max-w-[20rem] lg:max-w-none">
          <div
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 left-[8%] right-[8%] top-[16%] rounded-b-[24px] rounded-t-[220px]",
              creamSurface ? "bg-white" : "bg-[#fbf9f4]",
            )}
          />
          {personImage?.asset?._id ? (
            <Image
              alt={stegaClean(personImage.alt) || ""}
              blurDataURL={personImage.asset.metadata?.lqip || undefined}
              className="relative z-10 h-auto w-[96%]"
              data-sanity={dataAttribute?.("personImage")}
              height={806}
              loading="lazy"
              placeholder={personImage.asset.metadata?.lqip ? "blur" : undefined}
              sizes="(min-width: 1024px) 500px, (min-width: 700px) 38vw, (min-width: 640px) 320px, 300px"
              src={urlFor(personImage).width(680).height(806).url()}
              width={680}
            />
          ) : null}
        </div>

        <div className="grid justify-items-start gap-5">
          {displayEyebrow ? (
            <p
              className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-800"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : null}
          {displayTitle ? (
            <h2
              className="text-balance text-[clamp(1.875rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.01em] text-slate-950"
              data-sanity={dataAttribute?.("title")}
              id={titleId}
            >
              {title}
            </h2>
          ) : null}
          {richText?.length ? (
            <div
              className="text-pretty text-[1.03125rem] leading-[1.75] text-slate-600 [&_p]:!my-0"
              data-sanity={dataAttribute?.("richText")}
            >
              <PortableTextRenderer value={richText} />
            </div>
          ) : null}
          <KeyDetails
            creamSurface={creamSurface}
            dataAttribute={dataAttribute}
            details={keyDetails}
          />
          <PersonButtons buttons={buttons} dataAttribute={dataAttribute} />
        </div>
      </div>
    </section>
  );
}
