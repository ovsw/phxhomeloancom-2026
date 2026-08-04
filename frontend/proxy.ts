import {
  calculateBlogPagination,
  isBlogPageOutOfRange,
  parseBlogPageSegment,
} from "@/lib/blog-index";
import { client } from "@/sanity/lib/client";
import { ELIGIBLE_BLOG_POSTS_COUNT_QUERY } from "@/sanity/queries/blog-index";
import { NextRequest, NextResponse } from "next/server";

function notFoundResponse() {
  return new NextResponse("Not Found", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
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
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 1) return NextResponse.next();
  if (segments.length !== 2) return notFoundResponse();

  const page = parseBlogPageSegment(segments[1]);
  if (!page) return notFoundResponse();

  if (hasValidatedDraftMode(request)) return NextResponse.next();

  const postCount = await client.fetch<number>(ELIGIBLE_BLOG_POSTS_COUNT_QUERY);
  const regularPostCount = Math.max(postCount - 1, 0);
  const { totalPages } = calculateBlogPagination(regularPostCount, page);
  return isBlogPageOutOfRange(page, totalPages)
    ? notFoundResponse()
    : NextResponse.next();
}

export const config = {
  matcher: "/blog/:path*",
};
