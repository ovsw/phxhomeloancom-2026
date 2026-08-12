import { sanityFetch, type DynamicFetchOptions } from "@/sanity/lib/live";
import { PAGE_QUERY, PAGES_SLUGS_QUERY } from "@/sanity/queries/page";
import { NAVIGATION_QUERY } from "@/sanity/queries/navigation";
import { SETTINGS_QUERY } from "@/sanity/queries/settings";
import { FOOTER_QUERY } from "@/sanity/queries/footer";
import { HOME_PAGE_QUERY } from "@/sanity/queries/home-page";
import {
  POST_QUERY,
  POSTS_QUERY,
  POSTS_SLUGS_QUERY,
} from "@/sanity/queries/post";
import {
  PAGE_QUERY_RESULT,
  POST_QUERY_RESULT,
  POSTS_QUERY_RESULT,
  NAVIGATION_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
  FOOTER_QUERY_RESULT,
  HOME_PAGE_QUERY_RESULT,
} from "@/sanity.types";
import type { BLOG_INDEX_QUERY_RESULT } from "@/sanity.types";
import type { BlogPost } from "@/sanity/queries/blog-index";
import type { CategoryArchive } from "@/sanity/queries/category";
import {
  BLOG_INDEX_QUERY,
  LATEST_POST_QUERY,
  REGULAR_POSTS_COUNT_QUERY,
  REGULAR_POSTS_QUERY,
} from "@/sanity/queries/blog-index";
import {
  CATEGORY_POSTS_COUNT_QUERY,
  CATEGORY_POSTS_QUERY,
  CATEGORY_QUERY,
} from "@/sanity/queries/category";

export async function fetchSanityPageBySlug({
  slug,
  perspective,
  stega,
}: {
  slug: string;
} & DynamicFetchOptions): Promise<PAGE_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug },
    perspective,
    stega,
  });

  return data as PAGE_QUERY_RESULT;
}

export async function fetchHomePage({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<HOME_PAGE_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    perspective,
    stega,
  });

  return data as HOME_PAGE_QUERY_RESULT;
}

export async function fetchSanityPosts({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<POSTS_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: POSTS_QUERY,
    perspective,
    stega,
  });

  return data as POSTS_QUERY_RESULT;
}

export async function fetchBlogIndex({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<BLOG_INDEX_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: BLOG_INDEX_QUERY,
    perspective,
    stega,
  });
  return data as BLOG_INDEX_QUERY_RESULT;
}

export async function fetchLatestPost({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<BlogPost | null> {
  "use cache";
  const { data } = await sanityFetch({
    query: LATEST_POST_QUERY,
    perspective,
    stega,
  });
  return data as unknown as BlogPost | null;
}

export async function fetchRegularPosts({
  end,
  latestPostId,
  perspective,
  start,
  stega,
}: {
  end: number;
  latestPostId: string;
  start: number;
} & DynamicFetchOptions): Promise<BlogPost[]> {
  "use cache";
  const { data } = await sanityFetch({
    query: REGULAR_POSTS_QUERY,
    params: { end, latestPostId, start },
    perspective,
    stega,
  });
  return data as unknown as BlogPost[];
}

export async function fetchRegularPostsCount({
  latestPostId,
  perspective,
  stega,
}: { latestPostId: string } & DynamicFetchOptions): Promise<number> {
  "use cache";
  const { data } = await sanityFetch({
    query: REGULAR_POSTS_COUNT_QUERY,
    params: { latestPostId },
    perspective,
    stega,
  });
  return data as number;
}

export async function fetchCategory({
  perspective,
  slug,
  stega,
}: {
  slug: string;
} & DynamicFetchOptions): Promise<CategoryArchive | null> {
  "use cache";
  const { data } = await sanityFetch({
    query: CATEGORY_QUERY,
    params: { slug },
    perspective,
    stega,
  });
  return data as unknown as CategoryArchive | null;
}

export async function fetchCategoryPosts({
  categoryId,
  end,
  perspective,
  start,
  stega,
}: {
  categoryId: string;
  end: number;
  start: number;
} & DynamicFetchOptions): Promise<BlogPost[]> {
  "use cache";
  const { data } = await sanityFetch({
    query: CATEGORY_POSTS_QUERY,
    params: { categoryId, end, start },
    perspective,
    stega,
  });
  return data as unknown as BlogPost[];
}

export async function fetchCategoryPostsCount({
  categoryId,
  perspective,
  stega,
}: { categoryId: string } & DynamicFetchOptions): Promise<number> {
  "use cache";
  const { data } = await sanityFetch({
    query: CATEGORY_POSTS_COUNT_QUERY,
    params: { categoryId },
    perspective,
    stega,
  });
  return data as number;
}

export async function fetchSanityPostBySlug({
  slug,
  perspective,
  stega,
}: {
  slug: string;
} & DynamicFetchOptions): Promise<POST_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: POST_QUERY,
    params: { slug },
    perspective,
    stega,
  });

  return data as POST_QUERY_RESULT;
}

export async function fetchSanityNavigation({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<NAVIGATION_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: NAVIGATION_QUERY,
    perspective,
    stega,
  });

  return data as NAVIGATION_QUERY_RESULT;
}

export async function fetchSanitySettings({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<SETTINGS_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: SETTINGS_QUERY,
    perspective,
    stega,
  });

  return data as SETTINGS_QUERY_RESULT;
}

export async function fetchSanityFooter({
  perspective,
  stega,
}: DynamicFetchOptions): Promise<FOOTER_QUERY_RESULT> {
  "use cache";
  const { data } = await sanityFetch({
    query: FOOTER_QUERY,
    perspective,
    stega,
  });

  return data as FOOTER_QUERY_RESULT;
}

export async function getCurrentYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export { PAGES_SLUGS_QUERY, POSTS_SLUGS_QUERY };
