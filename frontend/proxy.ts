import {
  calculateBlogPagination,
  isBlogPageOutOfRange,
  parseBlogPageSegment,
} from "@/lib/blog-index";
import { isGoneRoute } from "@/lib/gone-routes";
import { client } from "@/sanity/lib/client";
import { ELIGIBLE_BLOG_POSTS_COUNT_QUERY } from "@/sanity/queries/blog-index";
import { NextRequest, NextResponse } from "next/server";

const BLOG_POST_COUNT_TTL_MS = 60_000;

let blogPostCountCache:
  | { expiresAt: number; value: number }
  | undefined;
let blogPostCountPromise: Promise<number> | undefined;

function getBlogPostCount() {
  if (blogPostCountCache && blogPostCountCache.expiresAt > Date.now()) {
    return Promise.resolve(blogPostCountCache.value);
  }

  if (!blogPostCountPromise) {
    blogPostCountPromise = client
      .fetch<number>(ELIGIBLE_BLOG_POSTS_COUNT_QUERY)
      .then((value) => {
        blogPostCountCache = {
          expiresAt: Date.now() + BLOG_POST_COUNT_TTL_MS,
          value,
        };
        return value;
      })
      .finally(() => {
        blogPostCountPromise = undefined;
      });
  }

  return blogPostCountPromise;
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

function goneResponse() {
  return new NextResponse("Gone", {
    headers: {
      "cache-control": "public, max-age=0, must-revalidate",
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex",
    },
    status: 410,
  });
}

function trailingSlashResponse(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = `${request.nextUrl.pathname}/`;
  return new NextResponse(null, {
    headers: { location: url.toString() },
    status: 308,
  });
}

function shouldRedirectToTrailingSlash(pathname: string) {
  return pathname !== "/" && !pathname.endsWith("/") && !pathname.includes(".");
}

function hasValidatedDraftMode(request: NextRequest) {
  const cookieValue = request.cookies.get("__prerender_bypass")?.value;
  const previewModeId = process.env.__NEXT_PREVIEW_MODE_ID;
  return Boolean(
    cookieValue &&
      previewModeId &&
      (cookieValue === previewModeId ||
        (process.env.NODE_ENV !== "production" &&
          previewModeId === "development-id")),
  );
}

export async function proxy(request: NextRequest) {
  if (isGoneRoute(request.nextUrl.pathname)) return goneResponse();
  if (shouldRedirectToTrailingSlash(request.nextUrl.pathname)) {
    return trailingSlashResponse(request);
  }
  if (!request.nextUrl.pathname.startsWith("/blog/")) {
    return NextResponse.next();
  }

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 1) return NextResponse.next();
  if (segments.length !== 2) return notFoundResponse();

  const page = parseBlogPageSegment(segments[1]);
  if (!page) return notFoundResponse();

  if (hasValidatedDraftMode(request)) return NextResponse.next();

  const postCount = await getBlogPostCount();
  const regularPostCount = Math.max(postCount - 1, 0);
  const { totalPages } = calculateBlogPagination(regularPostCount, page);
  return isBlogPageOutOfRange(page, totalPages)
    ? notFoundResponse()
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
