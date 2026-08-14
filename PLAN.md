# Plan: Automatic FAQ JSON-LD + one-FAQ-per-page validation
_Locked via grill — by Claude + Ovi_

## Goal
Every page containing at least one usable FAQ Q&A (title + answer) automatically emits one valid `FAQPage` JSON-LD script, with no editor action required. The Studio enforces at most one FAQ block per page via a validation rule (Google: one `FAQPage` entity per page), and the renderer guarantees a single schema script even if content bypasses validation. FAQ content authoring for loan pages is a separate task and out of scope here.

## Approach
1. **Studio validation** — extract a pure validator (e.g. `studio/schemas/validation/single-faq-block.ts`) following the existing `schemas/validation/` pattern, and wire it into the shared `createBlocksField` factory in `studio/schemas/blocks/page-builder.ts`: error if `blocks` contains more than one item of `_type == "faqAccordion"`. Message: something like "Only one FAQ section per page." Test it with a sibling `.test.mjs` (node:test, matching the existing validation suites) covering zero, one, and two FAQ blocks. (Verified against the development dataset: no existing page violates this, so no content cleanup is needed.)
2. **JSON-LD emission at page level** — a `FaqPageJsonLd` component (e.g. `frontend/components/faq-json-ld.tsx`) that takes the COMPLETE block array, builds ONE merged `FAQPage` object, and renders a single `<script type="application/ld+json">` (or nothing). Rendered once by each route owner that receives the full array: `PageContent` in `components/root-content.tsx` (note: it slices blocks into two `Blocks` instances, so emission cannot live inside `Blocks`), the home page in `app/(main)/page.tsx`, and `blog/_components/blog-index-route.tsx`. Normally a page has exactly one FAQ block (validation enforces it), but merging from the full array guarantees a single valid entity even for content written via API/migrations that bypasses Studio validation.
3. **Schema builder** — a pure function (e.g. `frontend/lib/faq-json-ld.ts`) that takes the COMPLETE block array (so collection, merging, filtering, and deduplication live and are tested together) and returns the `FAQPage` object or `null` when there are no usable Q&As (no script tag rendered in that case):
   - A usable Q&A has a non-empty title AND a non-empty answer. FAQs failing this are excluded from the schema but the accordion keeps its current visible behavior (title-only FAQs still render). Schema-as-subset-of-visible is compliant with Google's guidelines (the inverse — schema content not visible on the page — is what's prohibited).
   - `Question.name`: FAQ title, `stegaClean`ed and trimmed.
   - `acceptedAnswer.text`: Portable Text flattened to plain text via `toPlainText` from `@portabletext/react` (verified: re-exported from its dist types; no new dependency needed), then `stegaClean`ed and trimmed.
   - Dedupe repeated FAQ documents by `_id` across all collected blocks (schema-side only; visible rendering unchanged — again subset, compliant).
4. **Serialization safety** — inject via `dangerouslySetInnerHTML` using `JSON.stringify(value).replace(/</g, "\\u003c")` (the pattern Next.js documents for JSON-LD) to prevent `</script>` breakout from content.
5. **Tests** — focused unit tests on the schema builder: correct `FAQPage` from a block array; merges multiple FAQ blocks into one entity; strips stega characters; dedupes by `_id`; excludes title-only FAQs; returns `null` for input with no usable Q&As; serialized output neutralizes a `</script>` payload. Plus the studio validator test from step 1. No snapshot/visual baselines.
6. **Verification** — render a page with an FAQ block in the dev preview and confirm the script tag's JSON parses and matches the visible, usable, deduplicated subset of Q&As (per the filtering rules in step 3). This is an internal structural check, not Google's Rich Results Test; optionally paste the rendered JSON into the Schema Markup Validator manually as a final sanity check.

## Key decisions & tradeoffs
- **Page-level emission (merged) + max-1 validation.** Emission lives in `FaqPageJsonLd`, rendered once per route by the three route owners (`PageContent`, home page, blog index) from the complete block array — not in the block component and not in `Blocks` (which `PageContent` instantiates twice). The page always produces at most one `FAQPage` entity regardless of how content was authored; the validation rule keeps editors from creating the situation in the first place.
- **Plain text answers** instead of Google's allowed limited-HTML. Simpler, no serializer edge cases; the text is what AI answer engines consume. Links inside answers are dropped from the schema (still visible on the page).
- **Schema is a filtered subset of visible content** (title-only FAQs and duplicates excluded from schema, unchanged on page). Compliant with Google's visibility requirement; avoids changing any visible behavior in this pass.
- **Automatic, no editor toggle.** Schema is emitted whenever the page contains at least one usable Q&A (title + answer); a FAQ block with none produces no script. No way to forget it, nothing to document for editors.
- **FAQ-only.** No Organization/LocalBusiness/breadcrumb schema in this pass, but the builder is a standalone pure function so a future schema pass can sit beside it without rework.

## Risks / open questions
- Validation rules don't retroactively fix existing content — mitigated twice: dataset audit found no page with >1 FAQ block, and the renderer merges regardless.
- Google no longer shows FAQ rich results for regular business sites (since 2023); the payoff is AI answer engines and future-proofing, not SERP dropdowns. Ovi is aware and on board.
- Even if the Studio rule regresses, the frontend merge keeps the rendered schema valid (single entity).

## Out of scope
- Writing/authoring the actual FAQ content for loan-type pages (separate session).
- Any other JSON-LD types (Organization, LocalBusiness, BreadcrumbList, Article).
- Editor-facing toggles or per-page schema controls.
- Migrating or restructuring existing FAQ documents.
