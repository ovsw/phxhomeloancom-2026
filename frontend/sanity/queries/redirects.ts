import { defineQuery } from "next-sanity";

export const REDIRECTS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "redirect" &&
    !(_id in path("drafts.**")) &&
    status == "active" &&
    defined(source.current) &&
    defined(destination.current)
  ] | order(source.current asc) {
    _id,
    status,
    source,
    destination,
    permanent
  }
`);
