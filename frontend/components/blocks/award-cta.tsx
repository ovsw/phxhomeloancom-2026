import { Button } from "@/components/ui/button";
import ParticleField from "@/components/particle-field";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
type AwardCtaProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "awardCta" }
> & {
  dataAttribute?: (path: string) => string | undefined;
};

const TROPHY_SRC = "/images/phx-award-trophy.png";
const sealSizeClassNames = {
  small: "h-24 w-24 md:h-32 md:w-32 lg:h-36 lg:w-36",
  medium: "h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48",
  large: "h-40 w-40 md:h-52 md:w-52 lg:h-60 lg:w-60",
} as const;

export default function AwardCta({
  award,
  dataAttribute,
}: AwardCtaProps) {
  const title = stegaClean(award?.title)?.trim();
  if (!award || !title) return null;

  const ctaHref = stegaClean(award.ctaButton?.href);
  const proofHref = stegaClean(award.proofLink?.href);
  const sealImage = award.sealImage?.asset?._id ? award.sealImage : null;
  const sealSize =
    stegaClean(award.sealSize) as keyof typeof sealSizeClassNames | undefined;

  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--phx-navy-800)] text-white section-pad-lg"
      data-sanity={dataAttribute?.("award")}
      id="award-cta"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_50%_120%,rgba(31,110,140,0.24),transparent_70%)]"
      />
      <ParticleField />

      <div className="container-narrow relative z-10 flex flex-col items-center justify-center gap-split text-center lg:flex-row lg:text-left">
        <div className="flex shrink-0 justify-center">
          <div className="relative aspect-[900/1256] h-[17rem] md:h-[22rem] lg:h-[28.75rem]">
            <Image
              alt=""
              className="rounded-none object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
              fill
              sizes="(min-width: 1024px) 420px, 70vw"
              src={TROPHY_SRC}
            />
            {sealImage ? (
              <div
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[44%]",
                  sealSizeClassNames[sealSize ?? "medium"],
                )}
                data-sanity={dataAttribute?.("award.sealImage")}
              >
                <Image
                  alt={stegaClean(sealImage.alt) || ""}
                  blurDataURL={sealImage.asset?.metadata?.lqip || undefined}
                  className="rounded-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
                  fill
                  placeholder={sealImage.asset?.metadata?.lqip ? "blur" : undefined}
                  sizes="(min-width: 1024px) 240px, 40vw"
                  src={urlFor(sealImage).url()}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex max-w-xl flex-col items-center gap-5 lg:items-start">
          {award.eyebrow ? (
            <p
              className="typo-eyebrow text-white/55"
              data-sanity={dataAttribute?.("award.eyebrow")}
            >
              {award.eyebrow}
            </p>
          ) : null}
          <h2
            className="text-balance text-[clamp(3rem,5.2vw,4.125rem)] font-semibold leading-[1.05] tracking-normal text-white"
            data-sanity={dataAttribute?.("award.title")}
          >
            &ldquo;{award.title}&rdquo;
          </h2>
          {award.description ? (
            <p
              className="text-pretty typo-body-editorial text-white/65"
              data-sanity={dataAttribute?.("award.description")}
            >
              {award.description}
            </p>
          ) : null}
          {ctaHref || proofHref ? (
            <div className="mt-3 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start">
              {ctaHref ? (
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  data-sanity={dataAttribute?.("award.ctaButton")}
                  emphasis
                  size="hero"
                >
                  <Link
                    href={ctaHref}
                    rel={
                      award.ctaButton?.openInNewTab
                        ? "noopener noreferrer"
                        : undefined
                    }
                    target={award.ctaButton?.openInNewTab ? "_blank" : undefined}
                  >
                    {award.ctaButton?.text || "Schedule a Consult"}
                  </Link>
                </Button>
              ) : null}
              {proofHref ? (
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  data-sanity={dataAttribute?.("award.proofLink")}
                  onDark
                  size="hero"
                  variant="outline"
                >
                  <Link
                    aria-label={
                      stegaClean(award.proofLink?.accessibleLabel) || undefined
                    }
                    href={proofHref}
                    rel={
                      award.proofLink?.openInNewTab
                        ? "noopener noreferrer"
                        : undefined
                    }
                    target={award.proofLink?.openInNewTab ? "_blank" : undefined}
                    title={
                      stegaClean(award.proofLink?.accessibleLabel) || undefined
                    }
                  >
                    {award.proofLink?.label || "View list"}
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
