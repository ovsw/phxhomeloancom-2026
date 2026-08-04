import PortableTextRenderer from "@/components/portable-text-renderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <section className="bg-[#f7f4ed] py-24 md:py-[6.875rem]" id="faq">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {stegaClean(eyebrow)?.trim() ? (
            <p className="mb-3.5 text-xs font-semibold uppercase leading-none tracking-[0.22em] text-cyan-800">
              {eyebrow}
            </p>
          ) : null}
          {stegaClean(title)?.trim() ? (
            <h2 className="text-balance text-[2.125rem] font-semibold leading-[1.12] text-slate-950 md:text-[2.75rem]">
              {title}
            </h2>
          ) : null}
          {stegaClean(subtitle)?.trim() ? (
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mx-auto mt-12 max-w-3xl md:mt-14">
          {visibleFaqs.length ? (
            <Accordion
              className="overflow-hidden rounded-xl border border-slate-200 bg-white px-5 shadow-[0_14px_34px_rgba(19,28,59,0.06)] sm:px-7"
              collapsible
              defaultValue={defaultValue}
              type="single"
            >
              {visibleFaqs.map((faq) => {
                const value = faq._key || faq._id;

                return (
                  <AccordionItem className="py-1" key={value} value={value}>
                    <AccordionTrigger className="py-5 text-[1.0625rem] font-semibold leading-6 text-slate-950 hover:no-underline">
                      {faq.title}
                    </AccordionTrigger>
                    {faq.answer?.length ? (
                      <AccordionContent className="max-w-[42rem] pb-5 text-sm leading-7 text-slate-600 md:text-base [&_p:last-child]:mb-0">
                        <PortableTextRenderer value={faq.answer} />
                      </AccordionContent>
                    ) : null}
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : null}

          {href && (link?.description || link?.title) ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-5">
              {link.title ? (
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {link.title}
                </p>
              ) : null}
              <Link
                aria-label={
                  stegaClean(link.description) || stegaClean(link.title) || "Learn more"
                }
                className="inline-flex items-center gap-2 font-semibold text-cyan-800 no-underline hover:text-cyan-600"
                href={href}
                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                target={link.openInNewTab ? "_blank" : undefined}
              >
                {link.description || link.title}
                <span className="rounded-full border border-cyan-800/30 p-1">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
