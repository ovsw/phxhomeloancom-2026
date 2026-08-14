# Plan Review Log: Automatic FAQ JSON-LD + one-FAQ-per-page validation
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex
1. UI shows title-only FAQs, while JSON-LD omits them — visible content and markup diverge. Fix: normalize once, render both from the same list.
2. Studio validation cannot guarantee one schema per page; API writes/migrations bypass it → multiple scripts. Fix: aggregate all FAQ blocks into one FAQPage at the page renderer; keep validation as editor guidance.
3. Dedup affects JSON-LD but not the visible accordion — another content mismatch. Fix: dedupe in shared normalization used by both outputs.
4. Escape unspecified incorrectly; literal `<` must become `<` (Next.js documents the pattern). Fix: JSON.stringify(v).replace(/</g, "\\u003c") + test a </script> payload.
5. Builder-only tests don't prove Studio limit, script count, UI/schema parity, injection safety. Fix: add 0/1/2-block validation tests + rendered/parseable/escaped JSON-LD tests.
6. A local unit test is not Google's Rich Results Test. Fix: call it an internal structural check or actually validate.

VERDICT: REVISE

### Claude's response
- Accepted #2: emission moved to the Blocks renderer, merging all faqAccordion blocks into one FAQPage. Validation stays as the editor-facing guard; merge is defense in depth.
- Accepted #4: exact escape pattern (`<`) and a `</script>` payload test added to the plan.
- Accepted #6: reworded — internal structural check, optional manual Schema Markup Validator pass.
- Partially accepted #1/#3: schema derives from a shared builder, but title-only FAQs and duplicates stay visible on the page and are excluded only from the schema. Schema-as-subset-of-visible is compliant with Google's guideline (the prohibited direction is schema content NOT visible on page). Changing visible accordion behavior is out of scope.
- Partially accepted #5: builder tests extended (merge, subset filtering, escaping). Rejected Studio-validation runtime tests — the rule is a trivial array count; standing up Sanity's validation harness for it is test slop by this repo's standards.

## Round 2 — Codex
Escaping, merged output, malicious-content testing, and validator wording addressed. Three gaps:
1. `Blocks` is not page-level; `PageContent` renders separate `Blocks` instances (hero/content slices), so the one-script guarantee depends on today's slicing. Fix: build JSON-LD in the route/page owner receiving the complete block array.
2. Studio rule gets no test despite "existing pure validation-test patterns". Fix: extract the count validator, test 0/1/2 blocks.
3. `@portabletext/toolkit` is transitive; fallback can fail under pnpm. Fix: use confirmed `toPlainText` from `@portabletext/react`.

VERDICT: REVISE

### Claude's response
- Accepted #1 (verified in root-content.tsx — PageContent does split blocks across two Blocks instances): emission moved to a `FaqPageJsonLd` component rendered by the three route owners with the full block array.
- Accepted #3: pinned to `toPlainText` from `@portabletext/react`; export verified in its dist types.
- Rejected #2: the premise is false — the studio workspace has zero test files and no test script (verified). Standing up a test harness for `count <= 1` violates the repo's "focused tests, not slop" rule. Logged as a known risk; the frontend merge covers the failure mode.

## Round 3 — Codex
Route ownership and Portable Text dependency fixed. Three issues:
1. Key-decisions section still said emission lives in `Blocks`, contradicting the route-owner design. Fix: name FaqPageJsonLd + three route owners.
2. Plan's claim that Studio has no test infrastructure is wrong — it has multiple node:test validation suites. Fix: extract count validator, test 0/1/2 blocks.
3. Verification step said JSON-LD must match all visible Q&As, contradicting the intentional filtering. Fix: verify against the visible, usable, deduplicated subset.

VERDICT: REVISE

### Claude's response
All three accepted.
- #1/#3 were stale wording from earlier revisions — fixed.
- #2: Codex was right and my Round 2 rejection was based on a bad check (I searched only *.test.ts; the studio uses *.test.mjs with node:test, including schemas/validation/*.test.mjs — exactly the cited pattern). Validator now extracted to studio/schemas/validation/single-faq-block.ts with a 0/1/2-block .test.mjs.

## Round 4 — Codex
Route ownership, dependency choice, verification wording fixed. Three contradictions:
1. Tests section still said "No Studio-validation test", contradicting step 1's required test.
2. Builder said it accepts FAQ items while tests claim it proves block merging — make it accept the complete block array.
3. Key decision promised every FAQ block produces schema; title-only blocks intentionally produce none.

VERDICT: REVISE

### Claude's response
All three accepted — stale wording aligned; builder signature is now the complete block array so merge/filter/dedupe are tested in one unit.

## Round 5 — Codex
All prior implementation findings addressed. One remaining: the Goal still promised every FAQ block emits a script, contradicting the usable-Q&A condition elsewhere. Fix: reword the goal.

VERDICT: REVISE

### Claude's response
Accepted and applied (goal reworded). MAX_ROUNDS reached — loop terminated. No substantive disagreement remains; the final REVISE was a wording alignment, applied post-loop.

## Act 3 — Build

### Round 1 — Codex build
Implemented the full spec: studio validator + 0/1/2 test, validation wired into createBlocksField, pure builder frontend/lib/faq-json-ld.ts + 7 vitest tests, FaqPageJsonLd component, emission at the three route owners. One deviation: repaired a stale assertion in frontend/app/(main)/blog/category/category-routes.test.mjs that blocked a green suite.

### Claude's verdict
- Full diff read: on-spec, style-matched, nothing out of scope beyond the test repair.
- Deviation verified independently: the old assertion fails on main too (commit c35a691 changed the category route without updating the test) — pre-existing breakage, fix is correct.
- Proof re-run by Claude: pnpm test → 114 vitest + 164 node:test, all pass; pnpm typecheck → clean.
- Rendered check on the running dev server: /phoenix-usda-loan/ emits exactly one FAQPage script (7 questions, valid JSON, matches visible accordion); /blog/ (no FAQ block) emits none; home emits one (3 questions).
Rounds used: 1 of 2. Passed.
