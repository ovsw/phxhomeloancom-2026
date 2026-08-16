import {
  BLOG_INDEX_QUERY_RESULT,
  HOME_PAGE_QUERY_RESULT,
  PAGE_QUERY_RESULT,
  POST_QUERY_RESULT,
} from "@/sanity.types";
import {
  getCategoryArchivePath,
  getBlogCanonicalPath,
  getBlogPageDescription,
  getBlogPageTitle,
  isIndexableCategory,
} from "@/lib/blog-index";
import type { CategoryArchive } from "@/sanity/queries/category";
import { buildPostOgImageUrl } from "@/lib/post-og-image";
import {
  buildPageOgImageUrl,
  getPageOgImageTitle,
  type PageOgImageTarget,
} from "@/lib/page-og-image";
const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function sharingImage(url: string, title: string) {
  return {
    url,
    width: 1200,
    height: 630,
    alt: `${title} | PHX Home Loan`,
  };
}

function fallbackSharingImage() {
  return sharingImage(
    `${siteOrigin}/images/og-post-fallback.png`,
    "Straightforward mortgage guidance",
  );
}

export function generatePageMetadata({
  page,
  path,
}: {
  page: HOME_PAGE_QUERY_RESULT | PAGE_QUERY_RESULT | POST_QUERY_RESULT;
  path: string;
}) {
  const isPost = page?._type === "post";
  const postTitle = isPost ? page.title?.trim() : undefined;
  const postImage =
    isPost && postTitle && page.publishedAt
      ? buildPostOgImageUrl({
          origin: siteOrigin,
          publishedAt: page.publishedAt,
          slug: page.slug?.current || "",
          title: postTitle,
        })
      : null;
  const rawPageTitle =
    page?._type === "homePage"
      ? page.meta?.title || page.title
      : page?._type === "page"
        ? page.title || page.meta?.title
        : undefined;
  const pageTitle = rawPageTitle
    ? getPageOgImageTitle(rawPageTitle)
    : undefined;
  const pageTarget: PageOgImageTarget | null =
    page?._type === "homePage"
      ? { kind: "home" }
      : page?._type === "page" && path !== "/"
        ? { kind: "page", slug: path.replace(/^\/+|\/+$/g, "") }
        : null;
  const pageImage =
    pageTitle && pageTarget
      ? buildPageOgImageUrl({
          origin: siteOrigin,
          target: pageTarget,
          title: pageTitle,
        })
      : null;
  const image = postImage && postTitle
    ? sharingImage(postImage, postTitle)
    : pageImage && pageTitle
      ? sharingImage(pageImage, pageTitle)
      : fallbackSharingImage();

  return {
    title: page?.meta?.title,
    description: page?.meta?.description,
    openGraph: {
      images: [image],
      locale: "en_US",
      type: isPost ? "article" : "website",
      ...(isPost && page.publishedAt
        ? { publishedTime: page.publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
    robots: !isProduction
      ? "noindex, nofollow"
      : page?.meta?.noindex
        ? "noindex"
        : "index, follow",
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL + path,
    },
  };
}

export function generateBlogIndexMetadata({
  blogIndex,
  page,
}: {
  blogIndex: BLOG_INDEX_QUERY_RESULT;
  page: number;
}) {
  const title = getPageOgImageTitle(
    blogIndex?.title || blogIndex?.meta?.title || "Blog",
  );
  const description =
    blogIndex?.meta?.description || blogIndex?.description || undefined;
  const cardTitle = getBlogPageTitle(title, page);
  const image = sharingImage(
    buildPageOgImageUrl({
      origin: siteOrigin,
      target: { kind: "blog", page },
      title: cardTitle,
    }),
    cardTitle,
  );

  return {
    title: cardTitle,
    description: getBlogPageDescription(description, page),
    openGraph: {
      images: [image],
      locale: "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [image] },
    robots: !isProduction
      ? "noindex, nofollow"
      : blogIndex?.meta?.noindex
        ? "noindex"
        : "index, follow",
    alternates: {
      canonical:
        process.env.NEXT_PUBLIC_SITE_URL + getBlogCanonicalPath(page),
    },
  };
}

export function generateCategoryMetadata({
  category,
  page,
}: {
  category: CategoryArchive;
  page: number;
}) {
  const title = getPageOgImageTitle(
    category.title || category.meta?.title || "Blog category",
  );
  const description = category.meta?.description || category.description || undefined;
  const slug = category.slug?.current || "";
  const cardTitle = getBlogPageTitle(title, page);
  const image = sharingImage(
    buildPageOgImageUrl({
      origin: siteOrigin,
      target: { kind: "category", page, slug },
      title: cardTitle,
    }),
    cardTitle,
  );
  const isIndexable = isIndexableCategory({
    description: category.description,
    metaNoindex: category.meta?.noindex,
    publishedPostCount: category.publishedPostCount,
  });

  return {
    title: cardTitle,
    description: getBlogPageDescription(description, page),
    openGraph: {
      images: [image],
      locale: "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [image] },
    robots: !isProduction
      ? "noindex, nofollow"
      : isIndexable
        ? "index, follow"
        : "noindex, follow",
    alternates: {
      canonical:
        process.env.NEXT_PUBLIC_SITE_URL +
        getBlogCanonicalPath(page, getCategoryArchivePath(slug)),
    },
  };
}
