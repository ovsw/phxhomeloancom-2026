import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// The imported post documents remain authoritative while their legacy fields
// are reconciled with the V2 schema.
// @sanity-typegen-ignore
export const latestArticlesQuery = groq`
  _type == "latestArticles" => {
    useCreamBackground,
    eyebrow,
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
    },
    fallbackImage {
      ${imageQuery}
    },
    "articles": *[
      _type == "post" &&
      defined(slug.current) &&
      meta.noindex != true &&
      seoHideFromLists != true &&
      seoNoIndex != true
    ] | order(
      coalesce(publishedAt, _createdAt) desc,
      _updatedAt desc
    )[0...6]{
      _type,
      _id,
      title,
      "description": coalesce(seoDescription, pt::text(excerpt), meta.description),
      "slug": slug.current,
      "publishedAt": coalesce(publishedAt, _createdAt),
      "image": coalesce(image, mainImage){
        ${imageQuery}
      },
      categories[]->{
        _id,
        title
      }
    }
  }
`;
