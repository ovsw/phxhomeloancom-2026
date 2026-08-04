import { defineQuery } from "next-sanity";
import { internalReferenceHref } from "./shared/internal-href";

const destinationProjection = `{
  openInNewTab,
  "href": select(
    kind == "internal" => select(
      internal->_id == "blogIndex" => "/blog/",
      ${internalReferenceHref}
    ),
    kind == "external" => external
  )
}`;

export const NAVIGATION_QUERY = defineQuery(`
  *[_type == "navigation" && _id == "navigation"][0]{
    _id,
    items[]{
      _key,
      _type == "navigationLink" => {
        "kind": "link",
        label,
        destination${destinationProjection}
      },
      _type == "navigationGroup" => {
        "kind": "group",
        label,
        links[]{
          _key,
          label,
          description,
          icon,
          destination${destinationProjection}
        }
      }
    },
    actions[]{
      _key,
      label,
      destination${destinationProjection}
    }
  }
`);
