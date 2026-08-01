import { groq } from "next-sanity";

export const customLinkInternalHref = groq`select(
  customLink.internal->slug.current == "index" => "/",
  string::startsWith(customLink.internal->slug.current, "/") => customLink.internal->slug.current + "/",
  defined(customLink.internal->slug.current) => "/" + customLink.internal->slug.current + "/"
)`;

export const urlInternalHref = groq`select(
  url.internal->slug.current == "index" => "/",
  string::startsWith(url.internal->slug.current, "/") => url.internal->slug.current + "/",
  defined(url.internal->slug.current) => "/" + url.internal->slug.current + "/"
)`;

export const internalReferenceHref = groq`select(
  internal->slug.current == "index" => "/",
  string::startsWith(internal->slug.current, "/") => internal->slug.current + "/",
  defined(internal->slug.current) => "/" + internal->slug.current + "/"
)`;

export const legacyInternalLinkHref = groq`select(
  @.internalLink->slug.current == "index" => "/",
  string::startsWith(@.internalLink->slug.current, "/") => @.internalLink->slug.current + "/",
  defined(@.internalLink->slug.current) => "/" + @.internalLink->slug.current + "/"
)`;
