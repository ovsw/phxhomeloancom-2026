import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";
import { describe, expect, it } from "vitest";
import { verifyPostOgImageSignature } from "@/lib/post-og-image";
import { generatePageMetadata } from "./metadata";

const post = {
  _id: "post-1",
  _type: "post",
  _updatedAt: "2026-08-15T12:00:00Z",
  publishedAt: "2026-08-10T12:00:00Z",
  slug: { _type: "slug", current: "mortgage-rates" },
  title: "Why Mortgage Rates Are Going Up",
  meta: {
    title: "Mortgage rates",
    description: "A practical mortgage rate explanation.",
    image: null,
    noindex: false,
  },
} as unknown as NonNullable<POST_QUERY_RESULT>;

const page = {
  _id: "page-1",
  _type: "page",
  _updatedAt: "2026-08-15T12:00:00Z",
  slug: "about",
  title: "About",
  meta: {
    title: "About PHX Home Loan",
    description: "About PHX Home Loan.",
    image: null,
    noindex: false,
  },
} as unknown as NonNullable<PAGE_QUERY_RESULT>;

describe("generatePageMetadata", () => {
  it("uses one signed generated card for post Open Graph and Twitter metadata", () => {
    const metadata = generatePageMetadata({ page: post, path: "/mortgage-rates/" });
    const image = metadata.openGraph.images[0];
    const url = new URL(image.url);

    expect(metadata.openGraph.type).toBe("article");
    expect(metadata.openGraph).toHaveProperty(
      "publishedTime",
      post.publishedAt,
    );
    expect(image).toMatchObject({
      width: 1200,
      height: 630,
      alt: `${post.title} | PHX Home Loan`,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [image],
    });
    expect(
      verifyPostOgImageSignature({
        identity: {
          slug: "mortgage-rates",
          revision: url.searchParams.get("rev") || "",
          version: url.searchParams.get("v") || "",
        },
        secret: process.env.OG_IMAGE_SECRET || "",
        signature: url.searchParams.get("sig") || "",
      }),
    ).toBe(true);
  });

  it("leaves ordinary pages on the existing website image behavior", () => {
    const metadata = generatePageMetadata({ page, path: "/about/" });

    expect(metadata.openGraph).toMatchObject({
      type: "website",
      images: [
        {
          url: "https://phxhomeloan.test/images/og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
    });
    expect(metadata.twitter).toBeUndefined();
  });
});
