import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const awardCtaQuery = groq`
  _type == "awardCta" => {
    highlight,
    title,
    description,
    buttons[]{
      _key,
      _type,
      text,
      variant,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      )
    }
  }
`;
