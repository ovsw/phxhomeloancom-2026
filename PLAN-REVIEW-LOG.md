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

## Round 2 — Codex
Acknowledged addressed: registry paths, unique IDs, script priority, failure UI, redirect/CTA checks, disclaimer, editorial review, pnpm test.
1. Mock gate still violated; page composition + FAQs are non-trivial layout/copy work.
2. "Verify against embed docs" not executable — public docs don't expose the loader contract → require dashboard snippet.
3. Slug preflight misses posts and slash variants; `resolveRootContent()` throws on collision.
4. Mutation race-prone, can orphan FAQs → one guarded transaction, createIfNotExists, audit.
5. "No missing-block warnings" unauditable — componentMap silently returns null → audit fetched block types directly.
6. Heading needs Visual Editing registration: `serverFieldEditingBlockTypes` + `dataAttribute("heading")`.
7. Rejecting lifecycle tests is weak — init/timeout/reuse logic is deterministic → extract adapter, test it.
8. "Existing site already does it" doesn't settle privacy → documented review/decision even if unconditional.
9. Fallback swaps the visitor's task (estimate → consult) → prefer hosted Homebot page as primary fallback.
VERDICT: REVISE

### Claude's response
Accepted: #3 (preflight now covers page/post/draft/version + slash variants); #4 (single transaction, deterministic IDs, createIfNotExists); #5 (audit compares fetched _types to componentMap keys); #6 (verified real in index.tsx:45 — added serverFieldEditingBlockTypes + dataAttribute); #8 (decision now recorded in plan as explicit, revisit if consent framework lands); #9 (good catch — primary fallback is hosted HomeBot page, consult secondary).
Partially accepted: #2 — dashboard snippet not required up front; the live bundle IS the account's deployed authorized snippet, and verification is empirical (widget boots in browser) with stop-and-ask fallback. #7 — if init logic grows beyond a trivial effect it gets extracted and one focused unit test; no broader scaffolding.
Rejected: #1 mock gate — held. The page is a composition of already-designed existing blocks; FAQ copy is content, reviewed by Ovi in Studio, not layout. Flagged for Ovi at sign-off; his call, not Codex's.

## Round 3 — Codex
Mock gate treated as escalated. Most prior findings addressed.
1. Unique DOM IDs don't prove Homebot supports multiple instances (global may be singleton) → enforce one per document or verify.
2. `createIfNotExists` silently adopts ID collisions → preflight every target ID (absent or exact match).
3. Audit can't compare against private `componentMap` → audit expected block sequence instead.
4. Test requirements contradict: step 5 permits a test, Out of Scope forbids it → make the focused test mandatory.
5. "Explicitly-named project" names none → put exact project ID + dataset in plan, abort on mismatch.
6. Risks section still cites docs-based verification, contradicting empirical gate → align.
VERDICT: REVISE

### Claude's response
All six accepted — each was cheap and real: #1 two-instance browser check, validation rule fallback; #2 ID preflight (absent-or-intended); #3 audit exact block sequence; #4 focused helper test now mandatory, Out of Scope reworded; #5 project `hv0545v9` + dataset `development` hard guard in plan; #6 Risks aligned to empirical gate.

## Round 4 — Codex
All six round-3 findings addressed. Remaining unknowns have explicit stop conditions or tested fallbacks. No new material blockers.
VERDICT: APPROVED
