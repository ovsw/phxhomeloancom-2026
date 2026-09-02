import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AwardCta from "./award-cta";
import Blocks from ".";

const award = {
  eyebrow: "A track record you can verify",
  title: "2026 Scotsman Guide Top Originator",
  description:
    "James Vercellino was listed among Scotsman Guide's 2026 Top Originators.",
  sealImage: {
    _type: "image" as const,
    alt: "Scotsman Guide Top Originators 2026 logo",
    asset: {
      _id: "image-b6f3a25737c58c82dd1931125c34f8577a1e60d8-960x806-png",
      mimeType: "image/png",
      url: null,
      metadata: {
        dimensions: { height: 806, width: 960 },
        lqip: "data:image/png;base64,test",
      },
    },
  },
  sealSize: "medium" as const,
  proofLink: {
    label: "View list",
    accessibleLabel: "View Scotsman Guide Top Originators 2026 ranking list",
    href: "https://www.scotsmanguide.com/rankings/top-originators/top-originators-rankings-2026/",
    openInNewTab: true,
  },
  ctaButton: {
    _key: null,
    _type: "button" as const,
    text: "Schedule a Consult",
    variant: null,
    href: "/contact/",
    openInNewTab: false,
  },
};

describe("AwardCta", () => {
  it("renders shared settings award content and actions", () => {
    render(
      <AwardCta
        _key="award"
        _type="awardCta"
        award={award}
        dataAttribute={(path) => `settings:${path}`}
        sectionNav={null}
      />,
    );

    expect(screen.getByText("A track record you can verify")).toHaveAttribute(
      "data-sanity",
      "settings:award.eyebrow",
    );
    expect(
      screen.getByRole("heading", {
        name: /2026 Scotsman Guide Top Originator/,
      }),
    ).toHaveAttribute("data-sanity", "settings:award.title");
    expect(
      screen.getByAltText("Scotsman Guide Top Originators 2026 logo"),
    ).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: "Schedule a Consult" });
    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta).not.toHaveAttribute("target");

    const proof = screen.getByRole("link", {
      name: "View Scotsman Guide Top Originators 2026 ranking list",
    });
    expect(proof).toHaveTextContent("View list");
    expect(proof).toHaveAttribute("target", "_blank");
    expect(proof).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hides the section when shared settings award content is missing", () => {
    const { container } = render(
      <AwardCta
        _key="award"
        _type="awardCta"
        award={null}
        sectionNav={null}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("targets Settings award fields for visual editing", () => {
    const { container } = render(
      <Blocks
        blocks={[{ _key: "award", _type: "awardCta", award, sectionNav: null }]}
        documentId="homePage"
        documentType="homePage"
        perspective="drafts"
        stega
      />,
    );

    expect(container.firstElementChild).toHaveAttribute("data-sanity");
    expect(container.querySelector("section")).toHaveAttribute("data-sanity");
    expect(container.querySelector('[data-sanity*="path=award"]')).toBeTruthy();
    expect(
      container.querySelector('[data-sanity*="id=settings"]'),
    ).toBeTruthy();
  });
});
