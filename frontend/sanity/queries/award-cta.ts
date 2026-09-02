import { groq } from "next-sanity";
import { urlInternalHref } from "./shared/internal-href";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const awardCtaQuery = groq`
  _type == "awardCta" => {
    "award": *[_type == "settings" && _id == "settings"][0].award{
      eyebrow,
      title,
      description,
      sealImage{
        ${imageQuery}
      },
      sealSize,
      proofLink{
        label,
        accessibleLabel,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => ${urlInternalHref},
          url.type == "external" => url.external,
          url.href
        )
      },
      ctaButton{
        _key,
        _type,
        text,
        variant,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => ${urlInternalHref},
          url.type == "external" => url.external,
          url.href
        )
      }
    }
  }
`;
