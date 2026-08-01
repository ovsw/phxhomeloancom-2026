import {
  defineLocations,
  defineDocuments,
  PresentationPluginOptions,
} from "sanity/presentation";
import { resolveContentPath } from "./routes";

export { resolveContentPath } from "./routes";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: resolveContentPath(doc?.slug),
          },
        ],
      }),
    }),
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: resolveContentPath(doc?.slug),
          },
          { title: "Blog", href: "/blog/" },
        ],
      }),
    }),
  },
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: `_type == 'page' && slug.current == 'index'`,
    },
    {
      route: "/:slug/",
      filter: `_type in ['page', 'post'] && slug.current in [$slug, "/" + $slug]`,
    },
  ]),
};
