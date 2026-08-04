import { groq } from "next-sanity";
import { bodyQuery } from "./shared/body";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const personCtaQuery = groq`
  _type == "personCta" => {
    useCreamBackground,
    eyebrow,
    title,
    richText[]{
      ${bodyQuery}
    },
    keyDetails {
      _type,
      title,
      items[]
    },
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
    },
    personImage {
      ${imageQuery}
    }
  }
`;
