# Issue 75 completion evidence

Reviewed and published on 2026-09-03 for GitHub issue [#75](https://github.com/ovsw/phxhomeloancom-2026/issues/75).

## Source decisions

The update applies the FHA and Home in Five decisions in the [issue 72 factual source ledger](./issue-72-factual-source-ledger.md):

- Preserve the mature FHA page, its six FAQ references, FHA video, contact links, phone links, and Apply route.
- Keep Jimmy's FAQ topics from the [FHA rebuild task](https://app.basecamp.com/6230954/buckets/47793039/todos/10024681267), but qualify each answer against program rules, lender requirements, property review, and full approval.
- Describe FHA and conventional loans as a borrower-specific cost comparison. Do not state that one is always better.
- Replace Home in Five's universal figures and terms with product-specific language.
- Remove the unsupported military bonus and all promises of funding, eligibility, approval, or forgiveness.
- Treat the duplicate factual-review attachment noted in the ledger as a verified no-op.

The publication-day Home in Five review found no basis for one set of current terms. The program resources showed exhausted or closed funding notices and distinct 3-, 7-, 10-, and 30-year lien structures. The overview and product material also conflicted on income limits. Direct requests to the ledger's overview, resources, and three linked product documents returned HTTP 404 on 2026-09-03. The page therefore gives no assistance percentage, income cap, score, debt-to-income limit, education duration, interest rate, payment schedule, lien duration, forgiveness schedule, or availability promise.

Current CFPB consumer pages confirmed the narrower FHA explanation:

- [What is an FHA loan?](https://www.consumerfinance.gov/ask-cfpb/what-is-an-fha-loan-en-112/)
- [FHA loans](https://www.consumerfinance.gov/owning-a-home/fha-loans/)
- [Conventional loans](https://www.consumerfinance.gov/owning-a-home/conventional-loans/)
- [What is private mortgage insurance?](https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/)

HUD Handbook 4000.1 remains the controlling program source for the FHA score tiers and mortgage-insurance duration rules. HUD blocked the automated publication-day request with HTTP 403. To avoid claims that could not be rechecked, the update removed exact seller-contribution and gift-fund percentages. The remaining copy tells readers that lender overlays and full underwriting apply.

## Basecamp mapping

- [FHA rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024681267): retained the supplied FAQ topics and FHA video `H-2VebTO_YU`.
- [Down-payment assistance factual data](https://app.basecamp.com/6230954/buckets/47793039/todos/10225421495): followed Jimmy's direction to use active official information rather than the old figures.
- [FHA versus Conventional](https://app.basecamp.com/6230954/buckets/47793039/todos/10024684227): retained the comparison and interim video `2-5z3fhUAOA` where already used.

These Basecamp tasks were already complete. Issue 75 did not reopen, close, or change them.

## Sanity state

Project `hv0545v9`, dataset `development`:

- Page: `fhaLoan`, revision `MfE7T9i1Cy3CNY6r5N6vCg`
- FAQs: `faq-fha-what-is-it`, `faq-fha-down-payment`, `faq-fha-credit-score`, `faq-fha-mip-vs-pmi`, `faq-fha-first-time-buyers`, and `faq-fha-refinance-later`
- Mutation: one revision-guarded transaction for the page and six FAQ documents
- Verification: intended state present in both `published` and `raw` perspectives
- Target drafts: zero

Sanity validation found no target errors and no new warnings. The page still has its existing `migrationSource` warning because that provenance field is outside the current schema. The update did not add or remove that field.

## Rendered proof

The page was checked at `http://localhost:3107/phoenix-fha-loan/` with the Next.js development server:

- Page title: `FHA Mortgage Loan in Phoenix | The Vercellino Team`
- H1: `The FHA Home Loan`
- Metadata and `LoanOrCredit` description use the same revised description.
- The page contains the qualified Home in Five language and none of the removed dollar, percentage, or forgiveness claims.
- Contact, Apply, and phone links resolve to the intended routes.
- Six canonical FAQ questions render. `FAQPage` JSON-LD contains the same six questions and answers.
- The FHA `VideoObject` uses Jimmy's supplied video.
- FAQ pointer interaction opened its answer.

The shared browser's resize command timed out, so it could not produce a new mobile viewport capture. Its keyboard command also did not activate the focused FAQ button. These were preview-control failures, not page runtime errors. The route compiled without Next.js errors, and the focused structured-data and component tests passed. A final human mobile and keyboard check remains appropriate before production publication.

## Automated proof

- FHA mutation tests: 4 passed.
- Frontend FAQ, loan, and video structured-data tests: 28 passed.
- Studio typecheck: passed.
- Next.js runtime diagnostics: no compilation or session errors.
- Repository typecheck: passed.
- Full Vitest suite: 68 files and 448 tests passed.
