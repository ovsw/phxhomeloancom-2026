import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const storyFeatureQuery = groq`
  _type == "storyFeature" => {
    useCreamBackground,
    eyebrow,
    title,
    image {
      ${imageQuery}
    },
    imageCaption,
    richText[]{
      ...,
      markDefs[]{
        ...,
        _type == "customLink" => {
          "_type": "link",
          "href": select(
            customLink.type == "internal" => customLink.internal->slug.current,
            customLink.type == "external" => customLink.external,
            customLink.href
          ),
          "openInNewTab": customLink.openInNewTab
        }
      }
    },
    keyDetails {
      title,
      items[]
    },
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
    }
  }
`;
