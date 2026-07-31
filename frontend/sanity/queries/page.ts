import { groq } from "next-sanity";
import { metaQuery } from "./shared/meta";
import { homeHeroQuery } from "./home-hero";

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current in [$slug, "/" + $slug]][0]{
    _id,
    _type,
    blocks[]{
      _key,
      _type,
      ${homeHeroQuery}
    },
    ${metaQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug)]{slug}`;
