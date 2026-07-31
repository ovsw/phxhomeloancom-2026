import { Button } from "@/components/ui/button";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

type AwardCtaProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "awardCta" }
>;

type Particle = {
  id: number;
  dotStyle: CSSProperties;
  outerStyle: CSSProperties;
};

const TROPHY_SRC = "/images/phx-award-trophy.png";
const DEFAULT_EYEBROW = "A track record you can verify";

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
}

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  let seed = 1;

  for (let index = 0; index < 90; index++) {
    const x = pseudoRandom(seed++) * 100;
    const y = pseudoRandom(seed++) * 100;
    const dx = (x - 50) / 50;
    const dy = (y - 50) / 46;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceFromCenter < 0.5) continue;

    const fade = Math.min(1, (distanceFromCenter - 0.5) / 0.55);
    const size = 1.2 + pseudoRandom(seed++) * 2.6;
    const brightness = 0.45 + pseudoRandom(seed++) * 0.55;
    const glow = size * (1.6 + pseudoRandom(seed++) * 1.4);
    const duration = 2.6 + pseudoRandom(seed++) * 4.5;
    const delay = -pseudoRandom(seed++) * duration;

    particles.push({
      id: index,
      outerStyle: {
        left: `${x.toFixed(3)}%`,
        opacity: Number((fade * brightness).toFixed(3)),
        top: `${y.toFixed(3)}%`,
      },
      dotStyle: {
        animationDelay: `${delay.toFixed(2)}s`,
        animationDuration: `${duration.toFixed(2)}s`,
        boxShadow: `0 0 ${glow.toFixed(1)}px ${(glow * 0.35).toFixed(1)}px rgba(255,255,255,.55)`,
        height: `${size.toFixed(2)}px`,
        width: `${size.toFixed(2)}px`,
      },
    });
  }

  return particles;
}

const particles = createParticles();

function ParticleField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {particles.map((particle) => (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          key={particle.id}
          style={particle.outerStyle}
        >
          <span
            className="block animate-pulse rounded-full bg-white motion-reduce:animate-none"
            style={particle.dotStyle}
          />
        </span>
      ))}
    </div>
  );
}

function normalizeHighlight(highlight?: string | null) {
  if (!highlight) return null;

  return stegaClean(highlight).trim().toUpperCase() === "TOP 1%"
    ? "Top 1%"
    : highlight;
}

function AwardHeading({
  highlight,
  title,
}: Pick<AwardCtaProps, "highlight" | "title">) {
  const normalizedHighlight = normalizeHighlight(highlight);

  if (!normalizedHighlight && !title) return null;

  if (
    normalizedHighlight &&
    stegaClean(title)?.trim() === "Mortgage Loan Originators"
  ) {
    return (
      <h2 className="text-5xl font-semibold leading-[1.05] tracking-normal text-white md:text-6xl lg:text-[4rem] xl:text-[4.125rem]">
        <span className="sm:whitespace-nowrap">
          &ldquo;{normalizedHighlight} Mortgage
        </span>
        <br />
        <span className="sm:whitespace-nowrap">Loan Originators&rdquo;</span>
      </h2>
    );
  }

  return (
    <h2 className="text-balance text-5xl font-semibold leading-[1.05] tracking-normal text-white md:text-6xl lg:text-[4rem] xl:text-[4.125rem]">
      &ldquo;{[normalizedHighlight, title].filter(Boolean).join(" ")}&rdquo;
    </h2>
  );
}

export default function AwardCta({
  buttons,
  description,
  highlight,
  title,
}: AwardCtaProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#080d1e] py-20 text-white md:py-28 lg:py-[7.5rem]"
      id="award-cta"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_50%_120%,rgba(31,110,140,0.24),transparent_70%)]"
      />
      <ParticleField />

      <div className="container relative z-10 flex flex-col items-center justify-center gap-10 text-center lg:flex-row lg:gap-20 lg:text-left xl:gap-[5.25rem]">
        <div className="flex shrink-0 justify-center">
          <div className="relative aspect-[900/1256] h-[17rem] md:h-[22rem] lg:h-[28.75rem]">
            <Image
              alt="Top 1% award trophy"
              className="object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
              fill
              sizes="(min-width: 1024px) 420px, 70vw"
              src={TROPHY_SRC}
            />
          </div>
        </div>

        <div className="flex max-w-xl flex-col items-center gap-5 lg:items-start">
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.26em] text-white/55">
            {DEFAULT_EYEBROW}
          </p>
          <AwardHeading highlight={highlight} title={title} />
          {description ? (
            <p className="text-pretty text-base leading-7 text-white/65 md:text-[1.0625rem]">
              {description}
            </p>
          ) : null}
          {buttons?.length ? (
            <div className="mt-3 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start">
              {buttons.map((button, index) => {
                const href = stegaClean(button.href);
                if (!href) return null;

                return (
                  <Button
                    asChild
                    className="h-14 w-full rounded-[9px] bg-cyan-700 px-8 text-base font-semibold text-white shadow-[0_14px_40px_-12px_rgba(31,110,140,0.72)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-cyan-600 hover:text-white hover:shadow-[0_20px_50px_-12px_rgba(31,110,140,0.86)] focus-visible:ring-cyan-500/40 sm:w-auto"
                    key={button._key || `${href}-${index}`}
                    size="lg"
                  >
                    <Link
                      href={href}
                      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
                      target={button.openInNewTab ? "_blank" : undefined}
                    >
                      {button.text || "Learn More"}
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
