import { groq } from "next-sanity";
import { internalReferenceHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const loanFeatureCardsQuery = groq`
  _type == "loanFeatureCards" => {
    useCreamBackground,
    eyebrow,
    title,
    "cards": array::compact(cards[]{
      _key,
      _type,
      title,
      icon,
      bullets,
      link{
        openInNewTab,
        "href": select(
          type == "internal" => ${internalReferenceHref},
          type == "external" => external,
          href
        )
      }
    })
  }
`;
