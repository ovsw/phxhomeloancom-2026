import { groq } from "next-sanity";
import { bodyQuery } from "./shared/body";

// @sanity-typegen-ignore
export const faqAccordionQuery = groq`
  _type == "faqAccordion" => {
    eyebrow,
    title,
    subtitle,
    "faqs": array::compact(faqs[]{
      _key,
      "_id": @->._id,
      "_type": @->._type,
      "title": @->.title,
      "answer": coalesce(@->.richText, @->.body)[]{
        ${bodyQuery}
      }
    }),
    link{
      title,
      description,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      )
    }
  }
`;
