import { defineQuery } from "next-sanity";

import { redirectDestinationPath } from "./shared/redirect-destination";

export const REDIRECTS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "redirect" &&
    !(_id in path("drafts.**")) &&
    status == "active" &&
    defined(source.current) &&
    (defined(destinationReference._ref) || defined(destination.current))
  ] | order(source.current asc) {
    _id,
    status,
    source,
    "destination": coalesce(${redirectDestinationPath}, destination.current),
    permanent
  }
`);
