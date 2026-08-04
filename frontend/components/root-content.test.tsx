import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";
import { RootContentView } from "./root-content";

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
  body: [],
  excerpt: "Post introduction",
  slug: { _type: "slug", current: "post-title" },
  title: "Post title",
} as unknown as NonNullable<POST_QUERY_RESULT>;

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
});
