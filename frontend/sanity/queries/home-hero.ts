import { groq } from "next-sanity";
import { bodyQuery } from "./shared/body";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const homeHeroQuery = groq`
  _type == "homeHero" => {
    marketPositioning,
    servicePromise,
    richText[]{
      ${bodyQuery}
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
    portraitImage {
      ${imageQuery}
    },
    backgroundImage {
      ${imageQuery}
    },
    mobileBackgroundImage {
      ${imageQuery}
    }
  }
`;
