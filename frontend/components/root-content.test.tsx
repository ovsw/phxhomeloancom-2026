import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";
import { RootContentView } from "./root-content";

vi.mock("@/components/video-json-ld", () => ({
  default: function MockVideoJsonLd() {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
          }),
        }}
        type="application/ld+json"
      />
    );
  },
}));

const page = {
  _id: "page-1",
  _type: "page",
  blocks: [],
  description: null,
  title: "Ordinary page",
} as unknown as NonNullable<PAGE_QUERY_RESULT>;

const post = {
  _createdAt: "2026-08-02T00:00:00.000Z",
  _id: "post-1",
  _type: "post",
  _updatedAt: "2026-08-03T00:00:00.000Z",
  body: [],
  excerpt: "Post introduction",
  publishedAt: "2026-08-02T00:00:00.000Z",
  slug: { _type: "slug", current: "post-title" },
  title: "Post title",
} as unknown as NonNullable<POST_QUERY_RESULT>;

function isBlogPosting(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "@type" in value &&
    value["@type"] === "BlogPosting"
  );
}

function countBlogPostingScripts(container: HTMLElement) {
  let count = 0;

  for (const script of container.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    const value: unknown = JSON.parse(script.textContent ?? "null");
    if (isBlogPosting(value)) count += 1;
  }

  return count;
}

describe("RootContentView", () => {
  it("gates the post sidebar to post root content", () => {
    const { rerender } = render(
      <RootContentView content={page} perspective="published" stega={false} />,
    );
    expect(screen.queryByRole("complementary", { name: "Post sidebar" })).not.toBeInTheDocument();

    rerender(<RootContentView content={post} perspective="published" stega={false} />);
    expect(screen.getByRole("complementary", { name: "Post sidebar" })).toBeInTheDocument();
    expect(screen.getByText("Post introduction")).toBeInTheDocument();
  });

  it("emits exactly one BlogPosting script for posts and none for pages", () => {
    const { container, rerender } = render(
      <RootContentView content={post} perspective="published" stega={false} />,
    );
    expect(countBlogPostingScripts(container)).toBe(1);

    rerender(
      <RootContentView content={page} perspective="published" stega={false} />,
    );
    expect(countBlogPostingScripts(container)).toBe(0);
  });
});
