import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QuickNav from "./quick-nav";

describe("QuickNav", () => {
  it("follows the live site-header offset", () => {
    render(
      <QuickNav
        items={[
          { id: "why-refinance", key: "a", label: "Why refinance" },
          { id: "loan-options", key: "b", label: "Loan options" },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "On this page" });

    expect(nav).toHaveClass(
      "top-[var(--site-header-offset,var(--header-height))]",
    );
    expect(screen.getByRole("link", { name: "Why refinance" })).toHaveAttribute(
      "href",
      "#why-refinance",
    );
  });
});
