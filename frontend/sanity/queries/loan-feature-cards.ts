import { groq } from "next-sanity";

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
          type == "internal" => internal->slug.current,
          type == "external" => external,
          href
        )
      }
    })
  }
`;
