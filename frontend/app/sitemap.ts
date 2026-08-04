import { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { getDynamicFetchOptions, sanityFetchMetadata } from "@/sanity/lib/live";

const VIEWABLE_TYPES = ["homePage", "page", "post", "blogIndex"] as const;

const urlQuery = `
  'url': select(
    _id == "homePage" && _type == "homePage" => $baseUrl + "/",
    _id == "blogIndex" => $baseUrl + "/blog/",
    string::startsWith(slug.current, "/") => $baseUrl + slug.current + "/",
    $baseUrl + "/" + slug.current + "/"
  )
`;

/** A single query that fetches all documents with a viewable url/page */
const SITEMAP_QUERY = groq`
  *[
    _type in $viewableTypes
    && meta.noindex != true
    && !(_type == "page" && string::lower(slug.current) in ["index", "/index", "index/", "/index/"])
    && (defined(slug.current) || _id in ["homePage", "blogIndex"])
  ] {
    ${urlQuery},
    "lastModified": _updatedAt,
    "changeFrequency": select(_type in ["homePage", "page", "blogIndex"] => "daily", "weekly"),
    "priority": select(
      _id == "homePage" && _type == "homePage" => 1,
      _id == "blogIndex" => 0.7,
      _type == "page" => 0.5,
      0.7
    )
  } | order(priority desc, url asc)
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { perspective } = await getDynamicFetchOptions();
  const { data } = await sanityFetchMetadata({
    query: SITEMAP_QUERY,
    params: {
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
      viewableTypes: [...VIEWABLE_TYPES],
    },
    perspective,
  });

  return (data as MetadataRoute.Sitemap) || [];
}
