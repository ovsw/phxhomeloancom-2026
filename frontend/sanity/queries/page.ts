import { groq } from "next-sanity";
import { metaQuery } from "./shared/meta";
import { pageBuilderQuery } from "./page-builder";

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current in [$slug, "/" + $slug]][0]{
    _id,
    _type,
    title,
    description,
    loanType,
    "slug": slug.current,
    showQuickNav,
    ${pageBuilderQuery},
    ${metaQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug)]{slug}`;
