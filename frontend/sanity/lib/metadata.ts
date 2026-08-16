import { urlFor } from "@/sanity/lib/image";
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
const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

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
          origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          publishedAt: page.publishedAt,
          slug: page.slug?.current || "",
          title: postTitle,
        })
      : null;
  const image = postImage
    ? {
        url: postImage,
        width: 1200,
        height: 630,
        alt: `${postTitle} | PHX Home Loan`,
      }
    : {
        url: page?.meta?.image
          ? urlFor(page?.meta?.image).quality(100).url()
          : `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
        width: page?.meta?.image?.asset?.metadata?.dimensions?.width || 1200,
        height: page?.meta?.image?.asset?.metadata?.dimensions?.height || 630,
      };

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
    twitter: isPost
      ? {
          card: "summary_large_image",
          images: [image],
        }
      : undefined,
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
  const title = blogIndex?.meta?.title || blogIndex?.title || "Blog";
  const description =
    blogIndex?.meta?.description || blogIndex?.description || undefined;

  return {
    title: getBlogPageTitle(title, page),
    description: getBlogPageDescription(description, page),
    openGraph: {
      images: [
        {
          url: blogIndex?.meta?.image
            ? urlFor(blogIndex.meta.image).quality(100).url()
            : `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
          width:
            blogIndex?.meta?.image?.asset?.metadata?.dimensions?.width || 1200,
          height:
            blogIndex?.meta?.image?.asset?.metadata?.dimensions?.height || 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
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
  const title = category.meta?.title || category.title || "Blog category";
  const description = category.meta?.description || category.description || undefined;
  const slug = category.slug?.current || "";
  const isIndexable = isIndexableCategory({
    description: category.description,
    metaNoindex: category.meta?.noindex,
    publishedPostCount: category.publishedPostCount,
  });

  return {
    title: getBlogPageTitle(title, page),
    description: getBlogPageDescription(description, page),
    openGraph: {
      images: [
        {
          url: category.meta?.image
            ? urlFor(category.meta.image).quality(100).url()
            : `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
          width: category.meta?.image?.asset?.metadata?.dimensions?.width || 1200,
          height: category.meta?.image?.asset?.metadata?.dimensions?.height || 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
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
