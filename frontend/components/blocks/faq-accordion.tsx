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
    <section className="my-8" id="faq">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col items-center">
          <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6">
            {stegaClean(eyebrow)?.trim() ? (
              <Badge variant="secondary">{eyebrow}</Badge>
            ) : null}
            {stegaClean(title)?.trim() ? (
              <h2 className="font-display text-3xl font-semibold md:text-5xl">
                {title}
              </h2>
            ) : null}
            {stegaClean(subtitle)?.trim() ? (
              <h3 className="text-balance text-lg font-normal text-muted-foreground">
                {subtitle}
              </h3>
            ) : null}
          </div>
        </div>

        <div className="mx-auto my-16 max-w-xl">
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
                    <AccordionTrigger className="group py-2 text-[15px] leading-6 hover:no-underline">
                      {faq.title}
                    </AccordionTrigger>
                    {faq.answer?.length ? (
                      <AccordionContent className="pb-2 text-muted-foreground">
                        <div className="text-sm md:text-base">
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
                <p className="mb-1 text-xs">
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
                  <p className="text-[15px] font-medium leading-6">
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
