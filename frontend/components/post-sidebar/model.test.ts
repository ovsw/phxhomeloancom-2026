import type { PortableTextProps } from "@portabletext/react";
import { describe, expect, it } from "vitest";
import { createPostBodyModel } from "./model";

function heading(key: string, style: string, text: string) {
  return {
    _key: key,
    _type: "block",
    children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
    markDefs: [],
    style,
  };
}

describe("createPostBodyModel", () => {
  it("omits empty and unsupported headings and requires two valid headings for a table of contents", () => {
    const zero = createPostBodyModel([
      heading("normal", "normal", "Not a heading"),
      heading("empty", "h2", "   "),
    ] as PortableTextProps["value"]);
    const one = createPostBodyModel([
      heading("valid", "h2", "Only heading"),
    ] as PortableTextProps["value"]);

    expect(zero.headings).toEqual([]);
    expect(zero.showTableOfContents).toBe(false);
    expect(one.headings).toHaveLength(1);
    expect(one.showTableOfContents).toBe(false);
  });

  it("preserves source order and nests headings according to their levels", () => {
    const model = createPostBodyModel([
      heading("first", "h2", "First section"),
      heading("child", "h3", "Child section"),
      heading("grandchild", "h5", "Deep section"),
      heading("second", "h2", "Second section"),
    ] as PortableTextProps["value"]);

    expect(model.showTableOfContents).toBe(true);
    expect(model.headings.map(({ id, level, text }) => ({ id, level, text }))).toEqual([
      { id: "first-section", level: 2, text: "First section" },
      { id: "second-section", level: 2, text: "Second section" },
    ]);
    expect(model.headings[0]?.children[0]).toMatchObject({
      id: "child-section",
      level: 3,
      text: "Child section",
    });
    expect(model.headings[0]?.children[0]?.children[0]).toMatchObject({
      id: "deep-section",
      level: 5,
      text: "Deep section",
    });
  });

  it("creates deterministic IDs for duplicate text and text with an empty slug", () => {
    const blocks = [
      heading("repeat-1", "h2", "Repeat"),
      heading("literal-suffix", "h3", "Repeat 2"),
      heading("repeat-2", "h3", "Repeat"),
      heading("symbol", "h3", "💰"),
    ];
    const model = createPostBodyModel(blocks as PortableTextProps["value"]);

    expect(blocks.map((block) => model.getHeadingId(block))).toEqual([
      "repeat",
      "repeat-2",
      "repeat-3",
      "heading-4",
    ]);
  });
});
