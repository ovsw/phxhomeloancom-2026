# Plan: Home Value Estimator page with HomeBot widget block
_Locked via grill — by Claude + Ovi_

## Goal
Recreate the live site's `/home-value-estimator/` page locally: a new dedicated page-builder section that renders the HomeBot home-value widget, placed on a published `page` document with the same slug in the `development` dataset. The page gets modest supporting content (FAQ + CTA, reusing existing blocks) so it is a real page with crawlable text, not just a host for an embed script.

## Approach
1. **Obtain the HomeBot embed contract.** Extract the widget token and loader snippet from the live site's JS bundle (it is the account's own deployed embed, so it's authorized by construction). Verification is empirical, not documentary: the integration is proven by the widget actually booting in the browser in step 7. If the snippet can't be extracted or the widget won't boot with it, stop and ask Ovi for the dashboard-generated snippet ("Share → Embed a Widget") instead of guessing.
2. **New block schema** `studio/schemas/blocks/homebot-widget.ts` — object type `homebotWidget`, modeled on `phxEmbedSocialReviews` / `richTextBlock`. Fields: optional `heading` (string), `sectionNavField()`. No editor-facing token or URLs.
3. **Register at the actual registry points** (verified in repo):
   - `studio/schema-types.ts` (schema registration)
   - `studio/schemas/blocks/page-builder.ts` — add to `generalPageBuilderBlockTypes` and the insert-menu group there
   - preview image `studio/static/images/preview/homebotWidget.jpg`
4. **GROQ projection** `frontend/sanity/queries/homebot-widget.ts` (heading + sectionNav), composed into the page-builder query the same way neighboring blocks are (follow `frontend/sanity/queries/page-builder.ts` / existing composition exactly). Run TypeGen.
5. **React renderer** `frontend/components/blocks/` + registration in `frontend/components/blocks/index.tsx`: `componentMap`, and `serverFieldEditingBlockTypes` with a `dataAttribute` on the heading so click-to-edit works in Presentation.
   - Container `<div>` with an id derived from the block `_key` (`homebot_<_key>`), passed to `Homebot('#homebot_<_key>', TOKEN)` — no fixed `homebot_homeowner` id, so multiple instances or other pages can't collide on DOM ids. Whether HomeBot's global supports two live instances is unknown; browser verification includes a one-time two-instance check, and if it fails, a `blocks` array validation rule limits the block to one per page.
   - Loader via `next/script` `afterInteractive` (it is the page's primary feature, not below-fold garnish). Init in an effect that: no-ops if this container already booted, reuses the already-loaded script on soft navigation, and calls init once script `onReady`.
   - Failure path: `onError` / init timeout renders a short fallback that keeps the visitor's task intact — primary link to the account's hosted HomeBot landing page (URL taken from the same live-site extraction; if none exists, ask Ovi), secondary link to schedule a consult. No spinner animation (standing constraint).
   - The init/guard logic (init once, reuse loaded script, timeout → fallback) lives in a small extracted helper with **one focused unit test**. That test is in scope; no broader test scaffolding is.
6. **Content in `development` dataset** (mutations + publishing approved by Ovi):
   - Preflight: confirm no existing `page`, `post`, draft, or version claims the slug `home-value-estimator` in any slash variant, and no active `redirect` document claims that path (redirects compile into `next.config.mjs` and would shadow the page). Abort and report on collision.
   - All document writes go in **one transaction** hard-guarded to project `hv0545v9` + dataset `development` (abort if the client config resolves to anything else), using deterministic IDs. Preflight extends to those IDs: each target ID must be absent (or exactly the intended doc from a prior partial run) before writing — `createIfNotExists` alone would silently adopt an unrelated doc that happened to share the ID.
   - 4–5 new `faq` documents (deterministic IDs) with home-value Q&A drafted by Claude. Copy stays factual and generic; includes the line that online estimates are not appraisals; anything decision-shaped routes to "talk to the team." Ovi reviews/edits in Studio — flagged at sign-off as the editorial approval step.
   - One `page` document, slug `home-value-estimator`, published, blocks: page header ("Free Home Value Estimator") → `homebotWidget` → `faqAccordion` referencing the new FAQs → `ctaBanner` → Schedule Consult (verify the CTA's link target exists before writing). SEO title/description filled in.
   - Post-write audit: fetch the published page, confirm every FAQ reference resolves, and confirm the fetched block sequence is exactly the four intended `_type`s in order (the dispatcher silently renders nothing for unknown types, so the audit checks the data, not the rendered page).
7. **Verify**: `pnpm typegen`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --dir frontend build`; then on the dev server confirm the widget boots (network call to HomeBot, UI renders), survives soft navigation away and back, and Studio preview works.

## Key decisions & tradeoffs
- **Dedicated block, not a generic embed block or rich-text object.** One vendor today; a generic "paste embed code" field is an XSS surface and YAGNI. Follows the `phxEmbedSocialReviews` precedent.
- **Near-zero configuration.** Only editor field is an optional heading. Token hardcoded in the frontend component (public widget identifier, not a secret) — editors can't break or retarget the widget.
- **Page is more than the embed.** FAQ accordion (referenced `faq` docs) + CTA banner reuse existing blocks — crawlable text on an otherwise-empty page, zero new design.
- **Per-instance container ids from `_key`** rather than a one-per-page validation rule — cheaper and removes the whole duplicate-id failure class.
- **`afterInteractive`, not `lazyOnload`** — the widget is the point of the page.
- **No mock round.** The only new UI is a heading in the existing section pattern plus a third-party widget whose look we don't control; there is nothing meaningful to mock. Flagged for Ovi's confirmation at sign-off.
- **No consent gate — documented decision, not an omission.** The widget starts an address-and-email lead flow. Decision: load unconditionally, matching the live site, because the site has no consent framework and adding one is a site-wide product decision. Recorded here so it's revisited if a consent framework ever lands.
- **Publish, not draft**, in `development` — explicitly approved.

## Risks / open questions
- Scraped token/snippet may be stale — the gate is empirical: the widget must boot in the browser, otherwise stop and ask Ovi for the dashboard snippet.
- HomeBot's script behavior on repeated init/soft navigation is only truly knowable in the browser — covered by the verification step.

## Out of scope
- No generic third-party embed system, no rich-text inline embed object.
- No recreation of the old page's sidebar cards.
- No production dataset changes of any kind.
- No cookie-consent framework.
- No test scaffolding beyond the single focused helper test named in step 5 (browser verification covers the rest; existing `pnpm test` suite must stay green).
- No design work beyond existing tokens/section patterns.
