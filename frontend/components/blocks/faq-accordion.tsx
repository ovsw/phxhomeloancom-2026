import PortableTextRenderer from "@/components/portable-text-renderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { ArrowUpRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";

type FaqAccordionProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "faqAccordion" }
>;

export default function FaqAccordion({
  eyebrow,
  faqs,
  link,
  subtitle,
  title,
}: FaqAccordionProps) {
  const visibleFaqs = faqs?.filter((faq) => stegaClean(faq.title)?.trim()) ?? [];
  const defaultValue = visibleFaqs[0]?._key || visibleFaqs[0]?._id || undefined;
  const href = stegaClean(link?.href);

  return (
    <section className="scroll-mt-24 section-pad" id="faq">
      <div className="container">
        <div className="flex flex-col items-center text-center section-header-gap">
          {stegaClean(eyebrow)?.trim() ? (
            <Badge className="mb-3.5" variant="secondary">{eyebrow}</Badge>
          ) : null}
          {stegaClean(title)?.trim() ? (
            <h2 className="text-balance typo-section-heading">
              {title}
            </h2>
          ) : null}
          {stegaClean(subtitle)?.trim() ? (
            <h3 className="mt-5 text-balance typo-lead text-muted-foreground">
              {subtitle}
            </h3>
          ) : null}
        </div>

        <div className="mx-auto max-w-xl">
          {visibleFaqs.length ? (
            <Accordion
              className="w-full"
              collapsible
              defaultValue={defaultValue}
              type="single"
            >
              {visibleFaqs.map((faq) => {
                const value = faq._key || faq._id;

                return (
                  <AccordionItem className="py-2" key={value} value={value}>
                    <AccordionTrigger className="group py-2 typo-title-minor hover:no-underline">
                      {faq.title}
                    </AccordionTrigger>
                    {faq.answer?.length ? (
                      <AccordionContent className="pb-2 text-muted-foreground">
                        <div className="typo-body">
                          <PortableTextRenderer value={faq.answer} />
                        </div>
                      </AccordionContent>
                    ) : null}
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : null}

          {href && (link?.description || link?.title) ? (
            <div className="w-full py-6">
              {link.title ? (
                <p className="mb-1 typo-fine-print">
                  {link.title}
                </p>
              ) : null}
              <Link
                aria-label={
                  stegaClean(link.description) || stegaClean(link.title) || "Learn more"
                }
                className="flex items-center gap-2"
                href={href}
                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                target={link.openInNewTab ? "_blank" : undefined}
              >
                {link.description ? (
                  <p className="typo-button">
                    {link.description}
                  </p>
                ) : null}
                <span className="rounded-full border p-1">
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
