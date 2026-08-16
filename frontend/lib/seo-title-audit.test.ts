import { describe, expect, it } from "vitest";
import {
  createSeoTitleAuditRows,
  serializeSeoTitleAuditCsv,
} from "../../shared/seo-title-audit";

describe("createSeoTitleAuditRows", () => {
  it("groups safe cleanup, human review, and unchanged fallbacks", () => {
    const rows = createSeoTitleAuditRows([
      {
        _id: "homePage",
        _type: "homePage",
        currentSeoTitle: "Phoenix Mortgage Lender | PHX Home Loan",
        title: "Home",
      },
      {
        _id: "page-1",
        _type: "page",
        currentSeoTitle:
          "Phoenix Mortgage Options and Mortgage Guidance | PHX Home Loan",
        slug: "mortgage-options",
        title: "Mortgage Options",
      },
      {
        _id: "post-1",
        _type: "post",
        currentSeoTitle: null,
        slug: "earnest-money",
        title: "What Is Earnest Money?",
      },
    ]);

    expect(rows.map(({ group, route }) => ({ group, route }))).toEqual([
      { group: "safe suffix removal", route: "/" },
      { group: "no change", route: "/earnest-money/" },
      { group: "human rewrite required", route: "/mortgage-options/" },
    ]);
  });

  it("serializes every required audit column", () => {
    const [row] = createSeoTitleAuditRows([
      {
        _id: "category-1",
        _type: "category",
        slug: "loan-types",
        title: "Loan Types",
      },
    ]);
    const csv = serializeSeoTitleAuditCsv([row]);

    expect(csv.split("\n")[0]).toBe(
      "documentId,route,contentTitle,currentSeoTitle,proposedPageSpecificTitle,finalRenderedTitle,length,reason,group",
    );
    expect(csv).toContain("/blog/category/loan-types/");
  });

  it("removes Phoenix Mortgage before adding the shared brand suffix", () => {
    const [row] = createSeoTitleAuditRows([
      {
        _id: "post-1",
        _type: "post",
        currentSeoTitle:
          "5 Reasons A Mortgage Is Denied After Pre-Approval | Phoenix Mortgage",
        slug: "reasons-mortgage-rejection-pre-approval",
        title: "The 5 Reasons for Mortgage Rejection After Pre-Approval",
      },
    ]);

    expect(row).toMatchObject({
      finalRenderedTitle:
        "5 Reasons A Mortgage Is Denied After Pre-Approval | PHX Home Loan",
      length: 65,
      proposedPageSpecificTitle:
        "5 Reasons A Mortgage Is Denied After Pre-Approval",
      reason:
        "The final 65-character title may be shortened in search results.",
    });
  });
});
