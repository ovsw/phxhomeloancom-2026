# Plan Review Log: Home Value Estimator page with HomeBot widget block
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex
1. Plan skips the repo's mock-and-approval gate for UI/copy changes → build static mocks first.
2. Registration targets wrong: block inventory in `studio/schemas/blocks/page-builder.ts`, projections in `frontend/sanity/queries/page-builder.ts`, not the files named.
3. Scraping token from old bundle assumes obsolete embed code → get dashboard-generated snippet, verify loader URL/init contract.
4. Fixed `id="homebot_homeowner"` breaks with multiple instances → enforce one per document or derive ids from `_key`.
5. `lazyOnload` unsuitable for primary feature; double-init guard undefined → idempotent lifecycle, prompt load, test navigations.
6. Blocked/failed vendor script leaves empty section → loading/error states, fallback link, onError reporting, timeout.
7. Privacy work absent (widget collects address+email) → consent review, disclosures.
8. Content mutation lacks safety design → deterministic IDs, preflight, atomic apply, post-write audit.
9. Slug preflight ignores active redirects compiled into `next.config.mjs` → check redirect ownership before writing.
10. Assumes CTA target and FAQ references resolve → preflight strong-reference targets, audit after.
11. FAQ copy has no sources/compliance step → state estimates aren't appraisals, require editorial approval.
12. Verification omits `pnpm test` and adds no focused tests → add lifecycle/migration tests, run pnpm test.
VERDICT: REVISE

### Claude's response
Accepted (plan updated): #2 (real — registry points corrected to `studio/schemas/blocks/page-builder.ts` and query composition per repo); #4 (ids derived from `_key`); #5 (`afterInteractive` + defined init lifecycle); #6 (fallback link + onError, no spinner per standing constraints); #9 (redirect preflight — confirmed redirects compile into next.config.mjs); #10 (reference preflight + post-write audit); #12 partially (run `pnpm test`).
Partially accepted: #3 — scrape from the user's own live site first, but verify shape against current HomeBot embed docs and stop/ask for the dashboard snippet if stale; #8 — deterministic IDs, preflight, post-write audit, but no heavy migration framework for creating ~6 documents in a dev dataset; #11 — added "not an appraisal" line; editorial approval = Ovi reviewing in Studio, flagged at sign-off.
Rejected: #1 mock round — only new UI is a heading in an existing section pattern plus a third-party widget whose appearance we don't control; nothing to mock; flagged for Ovi at sign-off. #7 consent gate — rebuild parity, site has no consent framework, site-wide decision out of scope. #12 new test files — script-loading lifecycle isn't meaningfully unit-testable; browser verification instead; avoids test slop per repo owner's preferences.
