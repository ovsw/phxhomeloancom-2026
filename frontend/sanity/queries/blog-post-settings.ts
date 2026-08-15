import { groq } from "next-sanity";
import { urlInternalHref } from "./shared/internal-href";

const actionProjection = `{
  _key,
  title,
  description,
  ...button{
    "text": text,
    "openInNewTab": url.openInNewTab,
    "href": select(
      url.type == "internal" => ${urlInternalHref},
      url.type == "external" => url.external,
      url.href
    )
  }
}`;

export const BLOG_POST_SETTINGS_QUERY = groq`coalesce(
  *[
    _type == "blogPostSettings" &&
    _id == "blogPostSettings" &&
    defined(actions)
  ][0]{
    _id,
    _type,
    title,
    description,
    "actions": array::compact(actions[]${actionProjection})
  },
  *[
    _type == "settings" &&
    _id == "settings" &&
    defined(blogPostSidebar.actions)
  ][0]{
    _id,
    _type,
    "title": blogPostSidebar.title,
    "description": blogPostSidebar.description,
    "actions": array::compact(blogPostSidebar.actions[]${actionProjection})
  }
)`;
