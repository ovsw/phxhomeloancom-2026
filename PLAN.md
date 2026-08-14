# Plan: Home Value Estimator page with HomeBot widget block
_Locked via grill — by Claude + Ovi_

## Goal
Recreate the live site's `/home-value-estimator/` page locally: a new dedicated page-builder section that renders the HomeBot home-value widget, placed on a published `page` document with the same slug in the `development` dataset. The page gets modest supporting content (FAQ + CTA, reusing existing blocks) so it is a real page with crawlable text, not just a host for an embed script.

## Approach
1. **New block schema** `studio/schemas/blocks/homebot-widget.ts` — object type `homebotWidget`, modeled on `phxEmbedSocialReviews` / `richTextBlock` conventions. Fields: optional `heading` (string), `sectionNavField()`. No other editor configuration; the HomeBot account token is not editor-facing.
2. **Register** per `docs/agents/page-builder.md`: `studio/schema-types.ts`, Page schema `blocks.of` + insert-menu group in `studio/schemas/documents/page.ts`, preview image at `studio/static/images/preview/homebotWidget.jpg`.
3. **GROQ projection** in `frontend/sanity/queries/` (heading + sectionNav), interpolated into `frontend/sanity/queries/page.ts`. Run TypeGen.
4. **React renderer** `frontend/components/blocks/` + `componentMap` registration. Renders optional heading (existing section heading pattern / `SectionContainer`), the `<div id="homebot_homeowner">` container, and loads the HomeBot loader script via `next/script` (`lazyOnload`), calling `Homebot('#homebot_homeowner', TOKEN)`. The token is extracted from the live site's JS bundle and hardcoded as a constant in the component (it is a public widget identifier, not a secret). Guard against double-initialization on client navigation.
5. **Content in `development` dataset** (mutations approved by Ovi, including publishing):
   - 4–5 new `faq` documents with home-value Q&A drafted by Claude. Copy stays factual and generic (how estimates work, what moves value); anything decision-shaped routes to "talk to the team," never personalized financial advice.
   - One `page` document, slug `home-value-estimator`, published, with blocks: page header ("Free Home Value Estimator") → `homebotWidget` (heading e.g. "What's your home worth?") → `faqAccordion` referencing the new FAQs → `ctaBanner` pointing at Schedule Consult. Basic SEO title/description filled in.
6. **Verify**: `pnpm typegen`, `pnpm typecheck`, `pnpm lint`, `pnpm --dir frontend build`; load the page on the dev server and confirm the widget boots (network call to HomeBot, widget UI renders) and Studio preview works.

## Key decisions & tradeoffs
- **Dedicated block, not a generic embed block or rich-text object.** One vendor today; a generic "paste embed code" field is an XSS surface and YAGNI. Follows the existing `phxEmbedSocialReviews` precedent.
- **Near-zero configuration.** Only editor field is an optional heading. Token hardcoded in the frontend component, not in Sanity — editors can't break or retarget the widget.
- **Page is more than the embed.** FAQ accordion (referenced `faq` docs) + CTA banner reuse existing blocks, add crawlable text to an otherwise-empty page, and give non-converting visitors somewhere to go. Nothing new is designed.
- **Script via `next/script` with hardcoded loader URL** — no editor-supplied script URLs anywhere.
- **Publish, not draft**, in `development` — explicitly approved.

## Risks / open questions
- HomeBot token must be scraped from the live site's bundled JS; if it can't be found, ask Ovi to pull it from the HomeBot dashboard.
- HomeBot widget behavior inside Next.js client-side navigation (script re-init) needs a real check in the browser.
- Exact insert-menu group placement is a judgment call; will follow the closest analogous block.

## Out of scope
- No generic third-party embed system, no rich-text inline embed object.
- No recreation of the old page's sidebar cards ("Apply Online" / "What's My Home Worth?").
- No production dataset changes of any kind.
- No design work beyond existing tokens/section patterns.
