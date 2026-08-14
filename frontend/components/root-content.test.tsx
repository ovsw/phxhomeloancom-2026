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
  loanType: null,
  slug: "ordinary-page",
  title: "Ordinary page",
} as unknown as NonNullable<PAGE_QUERY_RESULT>;

const loanPage = {
  ...page,
  _id: "loan-page-1",
  description: "VA loan page description.",
  loanType: "VA Loan",
  slug: "/phoenix-va-loan",
  title: "VA loan page",
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

function isJsonLdType(value: unknown, type: string) {
  return (
    typeof value === "object" &&
    value !== null &&
    "@type" in value &&
    value["@type"] === type
  );
}

function jsonLdNodesByType(container: HTMLElement, type: string) {
  const nodes: unknown[] = [];

  for (const script of container.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    const value: unknown = JSON.parse(script.textContent ?? "null");
    if (isJsonLdType(value, type)) nodes.push(value);
  }

  return nodes;
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
    expect(jsonLdNodesByType(container, "BlogPosting")).toHaveLength(1);

    rerender(
      <RootContentView content={page} perspective="published" stega={false} />,
    );
    expect(jsonLdNodesByType(container, "BlogPosting")).toHaveLength(0);
  });

  it("emits one LoanOrCredit for a loan page and none for an ordinary page or post", () => {
    const { container, rerender } = render(
      <RootContentView
        content={loanPage}
        perspective="published"
        stega={false}
      />,
    );
    const loanNodes = jsonLdNodesByType(container, "LoanOrCredit");
    expect(loanNodes).toHaveLength(1);
    expect(loanNodes[0]).toMatchObject({
      "@type": "LoanOrCredit",
      name: "VA Loan",
      loanType: "VA Loan",
      description: "VA loan page description.",
    });

    rerender(
      <RootContentView content={page} perspective="published" stega={false} />,
    );
    expect(jsonLdNodesByType(container, "LoanOrCredit")).toHaveLength(0);

    rerender(
      <RootContentView content={post} perspective="published" stega={false} />,
    );
    expect(jsonLdNodesByType(container, "LoanOrCredit")).toHaveLength(0);
  });
});
