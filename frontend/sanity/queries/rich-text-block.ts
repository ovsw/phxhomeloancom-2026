import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const richTextBlockQuery = groq`
  _type == "richTextBlock" => {
    eyebrow,
    title,
    richText[]{
      ...,
      _type == "block" => {
        ...,
        children[]{...},
        markDefs[]{
          ...,
          _type in ["customLink", "buttonLink"] => {
            "href": select(
              customLink.type == "internal" => customLink.internal->slug.current,
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
    }
  }
`;
