import { describe, expect, it } from "vitest";
import {
  getSeoTitleWarnings,
  resolveSeoTitle,
  stripLegacySeoTitleSuffix,
} from "../../shared/seo-title";

describe("resolveSeoTitle", () => {
  it("uses a page-specific override and appends the brand once", () => {
    expect(
      resolveSeoTitle({
        fallbackTitle: "Conventional Loans",
        overrideTitle: "Phoenix Conventional Mortgage Loan",
      }),
    ).toEqual({
      finalTitle: "Phoenix Conventional Mortgage Loan | PHX Home Loan",
      metadataTitle: "Phoenix Conventional Mortgage Loan",
      openGraphTitle: "Phoenix Conventional Mortgage Loan | PHX Home Loan",
      pageTitle: "Phoenix Conventional Mortgage Loan",
      twitterTitle: "Phoenix Conventional Mortgage Loan | PHX Home Loan",
    });
  });

  it("falls back to the content title", () => {
    expect(
      resolveSeoTitle({ fallbackTitle: "What Is Earnest Money?" }).pageTitle,
    ).toBe("What Is Earnest Money?");
  });

  it("returns an absolute homepage title", () => {
    expect(
      resolveSeoTitle({
        fallbackTitle: "Phoenix Mortgage Lender",
        isHomepage: true,
      }).metadataTitle,
    ).toEqual({
      absolute: "Phoenix Mortgage Lender | PHX Home Loan",
    });
  });

  it("removes repeated recognized legacy suffixes", () => {
    expect(
      stripLegacySeoTitleSuffix(
        "FHA Loans | Phoenix Mortgage Lenders | PHX Home Loan",
      ),
    ).toBe("FHA Loans");
  });

  it("removes the legacy Phoenix Mortgage suffix", () => {
    expect(
      stripLegacySeoTitleSuffix(
        "5 Reasons A Mortgage Is Denied After Pre-Approval | Phoenix Mortgage",
      ),
    ).toBe("5 Reasons A Mortgage Is Denied After Pre-Approval");
  });

  it("does not remove ordinary page-specific wording", () => {
    expect(stripLegacySeoTitleSuffix("About PHX Home Loan")).toBe(
      "About PHX Home Loan",
    );
  });
});

describe("getSeoTitleWarnings", () => {
  it("warns without rejecting manual suffixes, repetition, or length", () => {
    const warnings = getSeoTitleWarnings({
      fallbackTitle: "Fallback",
      overrideTitle:
        "Phoenix Mortgage Options and Mortgage Guidance | PHX Home Loan",
    });

    expect(warnings).toEqual([
      "Remove the pipe and brand suffix; branding is automatic.",
      "Review the repeated term “mortgage” for readability.",
      "The final 62-character title may be shortened in search results.",
    ]);
  });
});
