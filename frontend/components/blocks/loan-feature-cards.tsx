import { cn } from "@/lib/utils";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import type { ReactNode } from "react";

type LoanFeatureCardsProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "loanFeatureCards" }
>;

type LoanFeatureCard = NonNullable<LoanFeatureCardsProps["cards"]>[number];

type LoanIconName =
  | "adjustable-rate-mortgage"
  | "american-flag"
  | "conventional-loan"
  | "elephant"
  | "fha-loan";

const fallbackEyebrow = "Types of Loans";
const fallbackTitle = "The right loan depends on your life — not the other way around.";
const introCopy =
  "Every option below has trade-offs. We'll walk you through them plainly, so you can choose with confidence.";
const helpCopy =
  "Tell us what matters to you and we'll match you to the right loan — it's a 15-minute conversation, no pressure.";

function getSectionEyebrow(eyebrow?: string | null) {
  if (!eyebrow || stegaClean(eyebrow).toLowerCase() === "about") return fallbackEyebrow;
  return eyebrow;
}

function getSectionTitle(title?: string | null) {
  if (!title || stegaClean(title).toLowerCase() === "types of loans") return fallbackTitle;
  return title;
}

function getLoanDisplayTitle(card: LoanFeatureCard) {
  switch (card._key) {
    case "conventional-loan":
      return "Conventional";
    case "fha-loan":
      return "FHA";
    case "va-loan":
      return "VA";
    case "construction-to-permanent-loan":
      return "C2P";
    case "jumbo-loan":
      return "Jumbo";
    default:
      return card.title?.replace(/^Phoenix\s+/i, "").replace(/\s+Loan$/i, "");
  }
}

function IconShell({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function LoanIcon({ icon }: Readonly<{ icon?: string | null }>) {
  const iconClassName = "size-5";

  switch (stegaClean(icon) as LoanIconName) {
    case "conventional-loan":
      return (
        <IconShell className={iconClassName}>
          <path d="M3 21h18" />
          <path d="M4 21V9l8-5 8 5v12" />
          <path d="M9 21v-6h6v6" />
        </IconShell>
      );
    case "fha-loan":
      return (
        <IconShell className={iconClassName}>
          <circle cx="8" cy="14" r="4" />
          <path d="M10.8 11.2 20 2" />
          <path d="m17 5 3 3" />
          <path d="m14 8 3 3" />
        </IconShell>
      );
    case "american-flag":
      return (
        <IconShell className={iconClassName}>
          <path d="M12 3 4 6v5c0 4.5 3.2 7.9 8 10 4.8-2.1 8-5.5 8-10V6l-8-3Z" />
          <path d="m9 11 2 2 4-4" />
        </IconShell>
      );
    case "adjustable-rate-mortgage":
      return (
        <IconShell className={iconClassName}>
          <path d="M3 21h18" />
          <path d="M5 21V8l7-4 7 4" />
          <path d="M12 4V2" />
          <path d="M9 21v-5h6v5" />
          <path d="M8.5 11h7" />
        </IconShell>
      );
    case "elephant":
      return (
        <IconShell className={iconClassName}>
          <path d="M3 21h18" />
          <path d="M5 21V6a2 2 0 0 1 2-2h5v17" />
          <path d="M12 21V9h5a2 2 0 0 1 2 2v10" />
          <path d="M8 8h1M8 12h1M8 16h1M15 13h1M15 17h1" />
        </IconShell>
      );
    default:
      return (
        <IconShell className={iconClassName}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10" />
          <path d="M15 9.5A3 3 0 0 0 12 8h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1a3 3 0 0 1-3-1.5" />
        </IconShell>
      );
  }
}

function CheckIcon() {
  return (
    <IconShell className="mt-1 size-3.5 shrink-0 stroke-[2.5] text-primary">
      <path d="m5 12 4 4L19 6" />
    </IconShell>
  );
}

function ArrowIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconShell className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </IconShell>
  );
}

function HelpIcon() {
  return (
    <IconShell className="size-5">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </IconShell>
  );
}

function LoanCard({ card }: Readonly<{ card: LoanFeatureCard }>) {
  const href = stegaClean(card.link?.href);
  const title = getLoanDisplayTitle(card);
  const content = (
    <article className="group flex h-full min-h-[255px] flex-col rounded-card border border-border bg-card p-(--space-card) text-card-foreground transition-[box-shadow,transform] motion-base hover:-translate-y-1 hover:shadow-interactive-lift">
      <div className="mb-6 flex size-[46px] items-center justify-center rounded-control bg-secondary text-primary">
        <LoanIcon icon={card.icon} />
      </div>
      {title ? <h3 className="mb-4 typo-showcase-title text-foreground">{title}</h3> : null}
      {card.bullets?.length ? (
        <ul className="grid gap-2.5 typo-body-sm text-muted-foreground">
          {card.bullets.map((bullet, index) => (
            <li className="flex gap-2.5" key={`${card._key}-${index}`}>
              <CheckIcon />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="mt-auto inline-flex items-center gap-1 pt-8 typo-button text-primary transition-colors motion-fast group-hover:text-accent-hover">
        Learn more
        <ArrowIcon className="size-3.5" />
      </span>
    </article>
  );

  if (!href) return content;

  return (
    <Link
      className="group block h-full rounded-card text-foreground no-underline focus-ring"
      href={href}
      rel={card.link?.openInNewTab ? "noopener noreferrer" : undefined}
      target={card.link?.openInNewTab ? "_blank" : undefined}
    >
      {content}
    </Link>
  );
}

function LoanHelpCard() {
  return (
    <article className="flex h-full min-h-[255px] flex-col justify-center rounded-card bg-primary p-(--space-card) text-primary-foreground">
      <div className="mb-5 flex size-[46px] items-center justify-center rounded-control bg-white/15 text-white">
        <HelpIcon />
      </div>
      <h3 className="mb-4 typo-showcase-title">Not sure which fits?</h3>
      <p className="mb-6 typo-body-sm text-white/90">{helpCopy}</p>
      <Link
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-control bg-white px-6 typo-button text-primary no-underline transition-transform motion-base hover:-translate-y-0.5 hover:text-accent-hover focus-ring-on-dark"
        href="#contact"
      >
        Ask us
        <ArrowIcon className="size-3.5" />
      </Link>
    </article>
  );
}

export default function LoanFeatureCards({
  cards,
  eyebrow,
  title,
  useCreamBackground,
}: LoanFeatureCardsProps) {
  if (!cards?.length) return null;

  return (
    <section
      className={cn(
        "scroll-mt-24 section-pad-lg",
        stegaClean(useCreamBackground) ? "surface-cream" : "surface-white",
      )}
      id="loan-options"
    >
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-10 section-header-gap md:gap-12">
          <div className="max-w-xl">
            <p className="mb-3.5 typo-eyebrow text-primary">
              {getSectionEyebrow(eyebrow)}
            </p>
            <h2 className="text-balance typo-section-heading text-foreground">
              {getSectionTitle(title)}
            </h2>
          </div>
          <p className="max-w-[25rem] typo-body-editorial text-muted-foreground">{introCopy}</p>
        </div>
        <div className={cn("grid gap-6 sm:grid-cols-2", cards.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          {cards.map((card) => (
            <LoanCard card={card} key={card._key} />
          ))}
          <LoanHelpCard />
        </div>
      </div>
    </section>
  );
}
