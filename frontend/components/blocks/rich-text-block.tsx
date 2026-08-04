import RichTextContent from "@/components/rich-text-content";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";

type RichTextBlockData = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "richTextBlock" }
>;

type RichTextBlockProps = RichTextBlockData & {
  dataAttribute?: (path: string) => string | undefined;
};

export default function RichTextBlock({
  _key,
  dataAttribute,
  eyebrow,
  richText,
  title,
}: RichTextBlockProps) {
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const headingId = displayTitle
    ? `rich-text-${stegaClean(_key)}-title`
    : undefined;

  if (!(displayEyebrow || displayTitle || richText?.length)) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-slate-200 bg-white py-16 md:py-24"
    >
      <div className="container">
        {displayEyebrow || displayTitle ? (
          <header className="mx-auto mb-10 max-w-4xl text-center">
            {displayEyebrow ? (
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800"
                data-sanity={dataAttribute?.("eyebrow")}
              >
                {eyebrow}
              </p>
            ) : null}
            {displayTitle ? (
              <h2
                className="text-balance text-3xl font-semibold leading-tight text-slate-950 md:text-5xl"
                data-sanity={dataAttribute?.("title")}
                id={headingId}
              >
                {title}
              </h2>
            ) : null}
          </header>
        ) : null}
        {richText?.length ? (
          <RichTextContent
            className="mx-auto max-w-4xl"
            dataSanity={dataAttribute?.("richText")}
            value={richText as PortableTextProps["value"]}
          />
        ) : null}
      </div>
    </section>
  );
}
