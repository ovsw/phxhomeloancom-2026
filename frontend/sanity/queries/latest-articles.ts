import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// During the V1-to-V2 transition, registered `post` documents drive routing and
// TypeGen while their matching legacy `blog-<post id>` documents supply fields
// that were not copied into V2 posts (published date, description, and image).
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
      *[_type == "blog" && _id == "blog-" + ^._id][0].seoHideFromLists != true &&
      *[_type == "blog" && _id == "blog-" + ^._id][0].seoNoIndex != true
    ] | order(
      coalesce(
        *[_type == "blog" && _id == "blog-" + ^._id][0].publishedAt,
        _createdAt
      ) desc,
      _updatedAt desc
    )[0...6]{
      _type,
      _id,
      "title": coalesce(
        *[_type == "blog" && _id == "blog-" + ^._id][0].title,
        title
      ),
      "description": coalesce(
        *[_type == "blog" && _id == "blog-" + ^._id][0].description,
        excerpt,
        meta.description
      ),
      "slug": slug.current,
      "publishedAt": coalesce(
        *[_type == "blog" && _id == "blog-" + ^._id][0].publishedAt,
        _createdAt
      ),
      "image": coalesce(
        image,
        *[_type == "blog" && _id == "blog-" + ^._id][0].image
      ){
        ${imageQuery}
      },
      categories[]->{
        _id,
        title
      }
    }
  }
`;
