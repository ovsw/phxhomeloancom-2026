import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";

type PageHeaderProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "pageHeader" }
>;

export default function PageHeader({
  description,
  eyebrow,
  statistics,
  title,
}: PageHeaderProps) {
  const cleanTitle = stegaClean(title)?.trim();
  const cleanEyebrow = stegaClean(eyebrow)?.trim();
  const visibleStatistics =
    statistics?.filter(
      (statistic) =>
        stegaClean(statistic.value)?.trim() &&
        stegaClean(statistic.description)?.trim(),
    ) ?? [];

  if (!cleanTitle) return null;

  return (
    <section className="relative overflow-hidden bg-[#080d1e] py-[4.625rem] text-white md:py-[4.875rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(760px 340px at 82% -10%, rgba(31,110,140,.28), transparent 68%), radial-gradient(680px 420px at 6% 118%, rgba(31,110,140,.14), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.38) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(110deg, transparent 15%, black 60%, transparent 92%)",
        }}
      />

      <div className="container relative">
        {cleanEyebrow ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-[1.375rem] flex items-center gap-2.5 text-[0.8125rem] font-medium text-white/55"
          >
            <Link
              className="text-white/65 no-underline transition-colors hover:text-white"
              href="/"
            >
              Home
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <span className="text-xs font-semibold uppercase leading-none tracking-[0.24em] text-[#feb77d]">
              {eyebrow}
            </span>
          </nav>
        ) : null}

        <h1 className="max-w-[51.25rem] text-balance text-[2.5rem] font-semibold leading-[1.08] tracking-normal text-white md:text-[3.75rem]">
          {title}
        </h1>
        {stegaClean(description)?.trim() ? (
          <p className="mt-5 max-w-[38.75rem] text-pretty text-lg leading-[1.65] text-white/70">
            {description}
          </p>
        ) : null}

        {visibleStatistics.length ? (
          <div className="mt-11 flex flex-wrap gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-8 border-t border-white/15 pt-8">
            {visibleStatistics.map((statistic) => (
              <div className="flex max-w-56 flex-col gap-1" key={statistic._key}>
                <p className="text-[1.875rem] font-semibold leading-tight text-white">
                  {statistic.value}
                </p>
                <p className="text-[0.84375rem] leading-relaxed text-white/60">
                  {statistic.description}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
