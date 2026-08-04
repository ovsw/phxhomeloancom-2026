import type { PortableTextProps } from "@portabletext/react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RichTextContent from "@/components/rich-text-content";
import { createPostBodyModel, POST_CONTACT_SIDEBAR } from "./model";
import { PostSidebar } from "./post-sidebar";

function heading(key: string, style: string, text: string) {
  return {
    _key: key,
    _type: "block",
    children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
    markDefs: [],
    style,
  };
}

const twoHeadings = [
  heading("first", "h2", "First section"),
  heading("child", "h3", "Child section"),
] as PortableTextProps["value"];

describe("PostSidebar", () => {
  it("renders the exact CTA order, destinations, and target behavior", () => {
    render(<PostSidebar bodyModel={createPostBodyModel([])} />);

    const sidebar = screen.getByRole("complementary", { name: "Post sidebar" });
    expect(within(sidebar).getByRole("heading", { name: "Contact Jimmy" })).toBeInTheDocument();
    expect(
      within(sidebar).getByText(
        "Choose the next step that fits where you are in the mortgage process.",
      ),
    ).toBeInTheDocument();
    expect(
      within(sidebar).getAllByRole("heading", { level: 3 }).map((item) => item.textContent),
    ).toEqual([
      "Call Jimmy",
      "Apply online for a loan today!",
      "Mortgage Calculator",
      "What's My Home Worth?",
    ]);
    expect(
      within(sidebar)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.nextElementSibling?.textContent),
    ).toEqual([
      "Speak with Jimmy's team about your home loan options.",
      "Fast and easy online application.",
      "Find out what you can expect to pay for your home loan.",
      "Get a ballpark estimate for your home with our online calculator.",
    ]);

    const phone = within(sidebar).getByRole("link", { name: "Call 480-800-8387" });
    expect(phone).toHaveAttribute("href", "tel:+14808008387");
    expect(phone).not.toHaveAttribute("target");

    const apply = within(sidebar).getByRole("link", { name: "Apply Online" });
    expect(apply).toHaveAttribute(
      "href",
      "https://applynow.goluminate.com/homehub/signup/jimmy.vercellino@goluminate.com",
    );
    expect(apply).toHaveAttribute("target", "_blank");
    expect(apply).toHaveAttribute("rel", "noopener noreferrer");

    for (const [name, href] of [
      ["Mortgage Calculator", "/mortgage-calculator/"],
      ["What's My Home Worth?", "/home-value-estimator/"],
    ] as const) {
      const card = within(sidebar).getByRole("heading", { name }).closest("section");
      const link = within(card as HTMLElement).getByRole("link", { name: "Calculate Now" });
      expect(link).toHaveAttribute("href", href.slice(0, -1));
      expect(link).not.toHaveAttribute("target");
    }
    expect(POST_CONTACT_SIDEBAR.actions.map((action) => action.href).slice(2)).toEqual([
      "/mortgage-calculator/",
      "/home-value-estimator/",
    ]);
  });

  it.each([
    ["zero", []],
    ["one", [heading("only", "h2", "Only heading")]],
  ])("hides the table of contents for %s valid headings", (_label, body) => {
    render(
      <PostSidebar
        bodyModel={createPostBodyModel(body as PortableTextProps["value"])}
      />,
    );

    expect(screen.queryByRole("navigation", { name: "Table of Contents" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact Jimmy" })).toBeInTheDocument();
  });

  it("shows a native open table of contents for two headings", () => {
    render(<PostSidebar bodyModel={createPostBodyModel(twoHeadings)} />);

    expect(screen.getByText("Table of Contents").closest("details")).toHaveAttribute("open");
    expect(screen.getByRole("navigation", { name: "Table of Contents" })).toBeInTheDocument();
  });

  it("renders hierarchical anchors that match the scoped post heading IDs", () => {
    const bodyModel = createPostBodyModel(twoHeadings);
    render(
      <>
        <RichTextContent getHeadingId={bodyModel.getHeadingId} value={twoHeadings} />
        <PostSidebar bodyModel={bodyModel} />
      </>,
    );

    const firstLink = screen.getByRole("link", { name: "First section" });
    const childLink = screen.getByRole("link", { name: "Child section" });
    expect(firstLink).toHaveAttribute("href", "#first-section");
    expect(childLink).toHaveAttribute("href", "#child-section");
    expect(document.querySelector("h2#first-section")).toBeInTheDocument();
    expect(document.querySelector("h3#child-section")).toBeInTheDocument();
    expect(firstLink.closest("li")).toContainElement(childLink);
  });

  it("matches an ID for a valid heading even when its Portable Text key is absent", () => {
    const unkeyedHeading = heading("temporary", "h2", "Unkeyed heading");
    delete (unkeyedHeading as { _key?: string })._key;
    const body = [unkeyedHeading, heading("second", "h2", "Second heading")];
    const bodyModel = createPostBodyModel(body as PortableTextProps["value"]);

    render(
      <>
        <RichTextContent getHeadingId={bodyModel.getHeadingId} value={body} />
        <PostSidebar bodyModel={bodyModel} />
      </>,
    );

    expect(screen.getByRole("link", { name: "Unkeyed heading" })).toHaveAttribute(
      "href",
      "#unkeyed-heading",
    );
    expect(document.querySelector("h2#unkeyed-heading")).toBeInTheDocument();
  });

});
