import {
  defineLocations,
  defineDocuments,
  PresentationPluginOptions,
} from "sanity/presentation";

function contentPath(value?: string | null) {
  const slug = value?.replace(/^\/+|\/+$/g, "");
  if (!slug || slug === "index") return "/";
  return `/${slug}/`;
}

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    // Add more locations for other post types
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: contentPath(doc?.slug),
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
