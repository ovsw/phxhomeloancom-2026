import { groq } from "next-sanity";
import { customLinkInternalHref } from "./internal-href";

// @sanity-typegen-ignore
export const richTextContentQuery = groq`
  ...,
  _type == "block" => {
    ...,
    children[]{...},
    markDefs[]{
      ...,
      _type in ["customLink", "buttonLink"] => {
        "href": select(
          customLink.type == "internal" => ${customLinkInternalHref},
          customLink.type == "external" => customLink.external,
          customLink.href
        ),
        "openInNewTab": customLink.openInNewTab
      }
    }
  },
  _type == "image" => {
    ...,
    "resolvedAsset": asset->{
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
  _type == "table" => {
    ...,
    rows[]{
      ...,
      cells[]
    }
  }
`;
