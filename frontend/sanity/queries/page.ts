import { groq } from "next-sanity";
import { metaQuery } from "./shared/meta";
import { homeHeroQuery } from "./home-hero";
import { loanFeatureCardsQuery } from "./loan-feature-cards";
import { videoFeatureQuery } from "./video-feature";

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current in [$slug, "/" + $slug]][0]{
    _id,
    _type,
    blocks[]{
      _key,
      _type,
      ${homeHeroQuery},
      ${loanFeatureCardsQuery},
      ${videoFeatureQuery}
    },
    ${metaQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug)]{slug}`;
