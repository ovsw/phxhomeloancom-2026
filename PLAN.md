# Plan: Home Value Estimator page with HomeBot widget block
_Locked via grill — by Claude + Ovi_

## Goal
Recreate the live site's `/home-value-estimator/` page locally: a new dedicated page-builder section that renders the HomeBot home-value widget, placed on a published `page` document with the same slug in the `development` dataset. The page gets modest supporting content (FAQ + CTA, reusing existing blocks) so it is a real page with crawlable text, not just a host for an embed script.

## Approach
1. **Obtain the HomeBot embed contract.** Extract the widget token and loader snippet from the live site's JS bundle, then verify its shape against HomeBot's current embed docs ("Share → Embed a Widget": loader script URL, `window.__hb_namespace`, `Homebot(selector, token)` call). If the scraped snippet can't be found or looks stale, stop and ask Ovi for the dashboard-generated snippet instead of guessing.
2. **New block schema** `studio/schemas/blocks/homebot-widget.ts` — object type `homebotWidget`, modeled on `phxEmbedSocialReviews` / `richTextBlock`. Fields: optional `heading` (string), `sectionNavField()`. No editor-facing token or URLs.
3. **Register at the actual registry points** (verified in repo):
   - `studio/schema-types.ts` (schema registration)
   - `studio/schemas/blocks/page-builder.ts` — add to `generalPageBuilderBlockTypes` and the insert-menu group there
   - preview image `studio/static/images/preview/homebotWidget.jpg`
4. **GROQ projection** `frontend/sanity/queries/homebot-widget.ts` (heading + sectionNav), composed into the page-builder query the same way neighboring blocks are (follow `frontend/sanity/queries/page-builder.ts` / existing composition exactly). Run TypeGen.
5. **React renderer** `frontend/components/blocks/` + `componentMap` registration in `frontend/components/blocks/index.tsx`.
   - Container `<div>` with an id derived from the block `_key` (`homebot_<_key>`), passed to `Homebot('#homebot_<_key>', TOKEN)` — no fixed `homebot_homeowner` id, so multiple instances or other pages can't collide.
   - Loader via `next/script` `afterInteractive` (it is the page's primary feature, not below-fold garnish). Init in an effect that: no-ops if this container already booted, reuses the already-loaded script on soft navigation, and calls init once script `onReady`.
   - Failure path: `onError` / init timeout renders a short fallback ("The home value tool didn't load — " + link to schedule a consult). No spinner animation (standing constraint).
6. **Content in `development` dataset** (mutations + publishing approved by Ovi):
   - Preflight: confirm no existing page/draft with slug `home-value-estimator`, and no active `redirect` document claiming that path (redirects compile into `next.config.mjs` and would shadow the page). Abort and report on collision.
   - 4–5 new `faq` documents (deterministic IDs) with home-value Q&A drafted by Claude. Copy stays factual and generic; includes the line that online estimates are not appraisals; anything decision-shaped routes to "talk to the team." Ovi reviews/edits in Studio — flagged at sign-off as the editorial approval step.
   - One `page` document, slug `home-value-estimator`, published, blocks: page header ("Free Home Value Estimator") → `homebotWidget` → `faqAccordion` referencing the new FAQs → `ctaBanner` → Schedule Consult (verify the CTA's link target exists before writing). SEO title/description filled in.
   - Post-write audit: fetch the published page, confirm every FAQ reference resolves and the page renders without missing-block warnings.
7. **Verify**: `pnpm typegen`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --dir frontend build`; then on the dev server confirm the widget boots (network call to HomeBot, UI renders), survives soft navigation away and back, and Studio preview works.

## Key decisions & tradeoffs
- **Dedicated block, not a generic embed block or rich-text object.** One vendor today; a generic "paste embed code" field is an XSS surface and YAGNI. Follows the `phxEmbedSocialReviews` precedent.
- **Near-zero configuration.** Only editor field is an optional heading. Token hardcoded in the frontend component (public widget identifier, not a secret) — editors can't break or retarget the widget.
- **Page is more than the embed.** FAQ accordion (referenced `faq` docs) + CTA banner reuse existing blocks — crawlable text on an otherwise-empty page, zero new design.
- **Per-instance container ids from `_key`** rather than a one-per-page validation rule — cheaper and removes the whole duplicate-id failure class.
- **`afterInteractive`, not `lazyOnload`** — the widget is the point of the page.
- **No mock round.** The only new UI is a heading in the existing section pattern plus a third-party widget whose look we don't control; there is nothing meaningful to mock. Flagged for Ovi's confirmation at sign-off.
- **No consent gate.** Rebuild parity: the live site already loads HomeBot unconditionally and the site has no consent framework. Adding one is a site-wide decision, out of scope here.
- **Publish, not draft**, in `development` — explicitly approved.

## Risks / open questions
- Scraped token/snippet may be stale — mitigated by verifying against HomeBot docs and stopping to ask Ovi if unclear.
- HomeBot's script behavior on repeated init/soft navigation is only truly knowable in the browser — covered by the verification step.

## Out of scope
- No generic third-party embed system, no rich-text inline embed object.
- No recreation of the old page's sidebar cards.
- No production dataset changes of any kind.
- No cookie-consent framework.
- No new automated test files for the widget lifecycle (script-loading behavior is verified in the browser; existing `pnpm test` suite must stay green).
- No design work beyond existing tokens/section patterns.
