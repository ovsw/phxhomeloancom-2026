import { groq } from "next-sanity";
import { urlInternalHref } from "./shared/internal-href";

export const SETTINGS_QUERY = groq`*[_type == "settings" && _id == "settings"][0]{
  _type,
  siteName,
  logo{
    dark{
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
      }
    },
    light{
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
      }
    },
    width,
    height,
  },
  secondaryLogo{
    dark{
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
      }
    },
    light{
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
      }
    },
    width,
    height,
  },
  blogPostSidebar{
    title,
    description,
    "actions": array::compact(actions[]{
      _key,
      title,
      description,
      actionType,
      ...button{
        "text": text,
        "variant": variant,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => ${urlInternalHref},
          url.type == "external" => url.external,
          url.href
        )
      }
    })
  }
}`;
