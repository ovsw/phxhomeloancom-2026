import { PostOgImage } from "@/components/post-og-image";
import {
  POST_OG_IMAGE_VERSION,
  createPostOgImageRevision,
  formatPostOgDate,
  getPostOgImageSecret,
  isValidPostOgSlug,
  verifyPostOgImageSignature,
} from "@/lib/post-og-image";
import { sanityFetchMetadata } from "@/sanity/lib/live";
import { POST_OG_IMAGE_QUERY } from "@/sanity/queries/post";
import type { POST_OG_IMAGE_QUERY_RESULT } from "@/sanity.types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const sourceSerifSemibold = readFile(
  join(
    process.cwd(),
    "node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff",
  ),
);
const jimmyPortrait = readFile(
  join(process.cwd(), "assets/og/jimmy-portrait.png"),
);

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000, immutable",
  "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
  "Content-Security-Policy": "default-src 'none'",
  "X-Content-Type-Options": "nosniff",
};

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=60",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function hasExactQueryShape(searchParams: URLSearchParams) {
  const keys = [...searchParams.keys()];
  return (
    keys.length === 3 &&
    searchParams.getAll("v").length === 1 &&
    searchParams.getAll("rev").length === 1 &&
    searchParams.getAll("sig").length === 1
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug: slugSegments } = await params;
  const slug = slugSegments.join("/");
  const { searchParams } = new URL(request.url);

  if (!isValidPostOgSlug(slug) || !hasExactQueryShape(searchParams)) {
    return notFound();
  }

  const version = searchParams.get("v") || "";
  const revision = searchParams.get("rev") || "";
  const signature = searchParams.get("sig") || "";
  if (
    version !== POST_OG_IMAGE_VERSION ||
    !/^[A-Za-z0-9_-]{22}$/.test(revision) ||
    !verifyPostOgImageSignature({
      identity: { slug, revision, version },
      secret: getPostOgImageSecret(),
      signature,
    })
  ) {
    return notFound();
  }

  const { data: post } = (await sanityFetchMetadata({
    query: POST_OG_IMAGE_QUERY,
    params: { slug },
    perspective: "published",
  })) as { data: POST_OG_IMAGE_QUERY_RESULT };

  const title = post?.title?.trim();
  const date = post?.publishedAt && formatPostOgDate(post.publishedAt);
  if (
    !title ||
    !post?.publishedAt ||
    !date ||
    createPostOgImageRevision({ publishedAt: post.publishedAt, title }) !==
      revision
  ) {
    return notFound();
  }

  try {
    const [font, portrait] = await Promise.all([
      sourceSerifSemibold,
      jimmyPortrait,
    ]);

    const portraitData = portrait.buffer.slice(
      portrait.byteOffset,
      portrait.byteOffset + portrait.byteLength,
    );

    return new ImageResponse(
      <PostOgImage date={date} portrait={portraitData} title={title} />,
      {
        width: 1200,
        height: 630,
        headers: CACHE_HEADERS,
        fonts: [
          {
            name: "Source Serif 4",
            data: font,
            style: "normal",
            weight: 600,
          },
        ],
      },
    );
  } catch (error) {
    console.error("Post OG image generation failed", error);
    return new Response(null, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=300",
        Location: new URL(
          "/images/og-post-fallback.png",
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        ).toString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
