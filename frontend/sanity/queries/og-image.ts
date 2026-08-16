import { defineQuery } from "next-sanity";

export const HOME_PAGE_OG_IMAGE_QUERY = defineQuery(`
  *[_id == "homePage" && _type == "homePage"][0]{
    "overrideTitle": meta.title,
    title
  }
`);

export const PAGE_OG_IMAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current in [$slug, "/" + $slug]][0]{
    "title": coalesce(title, meta.title)
  }
`);

export const BLOG_INDEX_OG_IMAGE_QUERY = defineQuery(`
  *[_id == "blogIndex" && _type == "blogIndex"][0]{
    "title": coalesce(title, meta.title)
  }
`);

export const CATEGORY_OG_IMAGE_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0]{
    "title": coalesce(title, meta.title)
  }
`);
