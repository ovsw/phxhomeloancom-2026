import { groq } from "next-sanity";
import { customLinkInternalHref } from "./internal-href";

// Projection for simpleRichText fields: passes blocks through unchanged but
// resolves each customLink annotation to a concrete href, mirroring
// richTextContentQuery.
// @sanity-typegen-ignore
export const simpleRichTextQuery = groq`
  ...,
  markDefs[]{
    ...,
    _type == "customLink" => {
      "href": select(
        customLink.type == "internal" => ${customLinkInternalHref},
        customLink.type == "external" => customLink.external,
        customLink.href
      ),
      "openInNewTab": customLink.openInNewTab
    }
  }
`;
