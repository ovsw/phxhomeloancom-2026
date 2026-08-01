import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { metaQuery } from "./shared/meta";
import { richTextContentQuery } from "./shared/rich-text-content";

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
    // richTextContent V2
    _id,
    _type,
    title,
    slug,
    publishedAt,
    image{
      ${imageQuery}
    },
    body[]{
      ${richTextContentQuery}
    },
    author->{
      name,
      image {
        ...,
        asset->{
          _id,
          url,
          mimeType,
          metadata {
            lqip,
            dimensions {
              width,
              height
            }
          }
        },
        alt
      }
    },
    _createdAt,
    _updatedAt,
    ${metaQuery},
}`;

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)] | order(_createdAt desc){
    title,
    slug,
    publishedAt,
    "excerpt": pt::text(excerpt),
    image{
      ${imageQuery}
    },
}`;

export const POSTS_SLUGS_QUERY = groq`*[_type == "post" && defined(slug)]{slug}`;
