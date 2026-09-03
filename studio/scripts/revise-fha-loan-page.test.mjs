import assert from "node:assert/strict";
import { test } from "vitest";

import {
  FAQ_IDS,
  buildFaqMutation,
  buildPageMutation,
  validatePage,
} from "./revise-fha-loan-page.ts";

const paragraph = (key, text) => ({
  _key: key,
  _type: "block",
  children: [{ _key: `${key}-old`, _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});

const source = {
  _id: "fhaLoan",
  _rev: "page-revision",
  _type: "page",
  slug: { current: "/phoenix-fha-loan" },
  description: "old",
  meta: { title: "FHA Mortgage Loan in Phoenix", noindex: false, description: "old" },
  blocks: [
    {
      _key: "page-header-fha",
      statistics: [
        { _key: "stat-down" },
        { _key: "stat-score" },
        { _key: "stat-seller" },
      ],
    },
    {
      _key: "chapter-what-it-is",
      richText: [paragraph("what-p1", "old"), paragraph("what-p2", "old")],
      supportingContent: [{ _key: "impact-down-payment", statement: "$14,000" }],
    },
    {
      _key: "table-fha-vs-conventional",
      table: {
        rows: ["row-down", "row-credit", "row-mi", "row-seller", "row-best"].map(
          (_key) => ({ _key, cells: ["old", "old", "old"] }),
        ),
      },
    },
    {
      _key: "benefit-cards-advantages",
      cards: ["adv-down", "adv-gift", "adv-credit", "adv-seller", "adv-prepay"].map(
        (_key) => ({ _key, title: "old", body: [paragraph(`${_key}-p`, "old")] }),
      ),
    },
    {
      _key: "loan-requirements",
      chapters: [
        {
          _key: "credit",
          body: [paragraph("credit-p1", "old")],
        },
        {
          _key: "money-up-front",
          body: [paragraph("money-p1", "old")],
          evidence: [
            {
              _key: "money-stats",
              stats: [{ _key: "stat-gift" }],
            },
          ],
        },
        {
          _key: "mortgage-insurance",
          body: [paragraph("mip-p1", "old")],
          evidence: [
            {
              _key: "mip-tiers",
              tiers: [{ _key: "tier-duration" }],
            },
          ],
        },
      ],
    },
    {
      _key: "chapter-home-in-five",
      richText: [paragraph("hi5-p1", "old"), paragraph("hi5-p2", "old")],
      supportingContent: [{ _key: "impact-hi5" }],
    },
    {
      _key: "fha-faq",
      faqs: FAQ_IDS.map((_ref) => ({ _key: `ref-${_ref}`, _ref, _type: "reference" })),
    },
    {
      _key: "advisor-cta-why-fha",
      richText: [paragraph("why-p1", "old"), paragraph("why-p2", "old")],
      buttons: [
        { _key: "apply", url: { internal: { _ref: "apply" } } },
        { _key: "phone", url: { external: "tel:4808008387" } },
      ],
    },
  ],
};

test("validates the stable FHA page identity", () => {
  assert.equal(validatePage(source), undefined);
  assert.match(validatePage(undefined), /does not exist/);
  assert.match(validatePage({ ...source, _type: "post" }), /Expected the published page/);
  assert.match(validatePage({ ...source, slug: { current: "/other" } }), /slug.current/);
});

test("revises risky claims while preserving canonical references and routes", () => {
  const mutation = buildPageMutation(source);
  const text = JSON.stringify(mutation.set);

  assert.equal(mutation.id, "fhaLoan");
  assert.equal(mutation.ifRevisionID, "page-revision");
  assert.equal(mutation.set.meta.title, "FHA Mortgage Loan in Phoenix");
  assert.equal(mutation.set.meta.noindex, false);
  assert.match(text, /There is no single Home in Five percentage/);
  assert.match(text, /Lenders can require a higher score/);
  assert.match(text, /11 years/);
  assert.doesNotMatch(
    text,
    /\$157,360|\$24,000|3% to 6%|Up to 6%|Up to 100%|forgiven step by step/,
  );

  const faq = mutation.set.blocks.find((block) => block._key === "fha-faq");
  assert.deepEqual(
    faq.faqs.map(({ _ref }) => _ref),
    FAQ_IDS,
  );
  const advisor = mutation.set.blocks.find(
    (block) => block._key === "advisor-cta-why-fha",
  );
  assert.equal(advisor.title, "Your Phoenix FHA loan team");
  assert.equal(advisor.buttons[0].url.internal._ref, "apply");
  assert.equal(advisor.buttons[1].url.external, "tel:4808008387");
});

test("builds two-paragraph mutations for all canonical FAQ documents", () => {
  for (const id of FAQ_IDS) {
    const mutation = buildFaqMutation({ _id: id, _rev: `${id}-rev`, _type: "faq" });
    assert.equal(mutation.id, id);
    assert.equal(mutation.ifRevisionID, `${id}-rev`);
    assert.equal(mutation.set.body.length, 2);
    assert.ok(mutation.set.body.every((block) => block.children[0].text.length > 30));
  }
});

test("does not accept an unknown or wrong-type FAQ", () => {
  assert.throws(
    () => buildFaqMutation({ _id: "other", _rev: "rev", _type: "faq" }),
    /Unexpected FAQ/,
  );
  assert.throws(
    () =>
      buildFaqMutation({
        _id: FAQ_IDS[0],
        _rev: "rev",
        _type: "page",
      }),
    /is not an FAQ/,
  );
});
