# V1 dependency adaptation into V2

Research date: 2026-07-31  
Wayfinder ticket: [Define V1 dependency adaptation into V2](https://github.com/ovsw/phxhomeloancom-2026/issues/7)

## Answer

Rebuild the 17 selected V1 block identities as V2-owned vertical slices behind V2's existing Page Builder seam. Preserve each block's visitor-visible structure, content behavior, responsive layout, accessibility behavior, and third-party outcome, but do not port V1's package graph, root layout, aggregate query, dispatcher, image runtime, environment wrapper, logger, or global stylesheet wholesale.

The dependency decision is:

- **Reuse directly:** the deterministic `ParticleField` implementation and its reduced-motion CSS, the pure YouTube URL parser, the award trophy PNG, the self-contained YouTube-channel animation CSS, and V1's distinctive inline SVG path data. These are isolated and do not pull V1 application or package seams into V2.
- **Adapt to V2 equivalents:** all 17 block renderers, V1 button/link handling, Accordion, Badge, class merging, Sanity images, Portable Text, shared CTA shells, surface selection, PHX visual tokens, fonts, and current third-party embed outcomes.
- **Independently reimplement:** the small V2-owned image presentation adapter, PHX Portable Text presentation profile, shared YouTube modal client leaf, unavailable contact-form client leaf, and EmbedSocial client adapter. Their interfaces should match the selected behavior rather than V1's broader implementation surfaces.
- **Omit:** V1 workspace packages as packages, `@t3-oss/env-nextjs`, `sanity-image`, `slugify`, `@sanity/codegen`, the selected path through V1's logger, unused rich-text capabilities, unused V1 catalog blocks, and every V1 application-shell mechanism protected by the V2 baseline.

No V1-only npm runtime package is required. Existing V2 dependencies cover the selected behavior.

## Pinned evidence and drift check

- V1 source: `chore/improve-codebase` at `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a`.
- V2 protected baseline: local `main` at `b8504a2bf6099cbfe73785e1b0cfbeff3e835912`.
- V2 inspected head: `6baad174d4105b8a6483b38cf7b4cdd0b1438129`. The three files added since the pinned V2 baseline are research assets; no `frontend/`, `studio/`, package-manifest, or lockfile source drift was present.
- The published V1 root revisions for `homePage`, `/our-team`, `/phoenix-loan-originator`, and `/contact` still matched the pinned revisions during this investigation.
- A read-only traversal of the four roots plus their selected `faq` and `teamMember` documents found 23 Portable Text blocks using only `normal`, `h3`, and `blockquote`; no lists, child marks, or mark definitions; button variants `default`, `outline`, and `secondary`; and no stored `useCreamBackground` values.

The V1 runtime closure and selected content graph are recorded in [V1 selected-route content graph](./v1-selected-route-content-graph.md). The protected V2 seam and removal boundary are recorded in [V2 Page Builder catalog removal boundary](./v2-page-builder-catalog-removal-boundary.md).

## Decision vocabulary

- **Visitor contract:** the observable content, layout, interaction, responsive behavior, accessibility behavior, link destination, and empty or unavailable state that the selected published V1 routes establish.
- **V2 equivalent:** an existing V2 module whose interface can express that contract without importing V1's package architecture.
- **Adapt:** preserve the visitor contract while translating implementation and types to V2's module interfaces.
- **Reuse directly:** copy an isolated source or binary asset into V2 ownership without carrying its former package seam or transitive dependencies.

Direct reuse never means importing files from the V1 checkout at V2 runtime.

## Block-by-block decision

| Identity | V1 source presentation | V2 dependency decision | Runtime boundary |
| --- | --- | --- | --- |
| `homeHero` | `packages/sanity-blocks/src/home-hero/index.tsx` | Adapt the exact art direction, overlay, portrait, typography, and CTA behavior to V2 `next/image`, Button, Link, and PHX Portable Text. Use a breakpoint-aware image source contract so desktop and mobile eager images are not both fetched. | Server block; LCP images receive dimensions, responsive `sizes`, and priority behavior. |
| `loanFeatureCards` | `packages/sanity-blocks/src/loan-feature-cards/index.tsx` | Adapt as a V2 block. Reuse its distinctive inline SVG path data inside the block rather than adding an icon package or replacing the illustrations with approximate icons. | Server block. |
| `videoFeature` | `packages/sanity-blocks/src/video-feature/index.tsx` | Adapt the section shell to V2 image, rich-text, button, and class helpers. Reuse the pure YouTube parser through a shared V2 helper; independently reimplement the play/open/close/focus interaction once in a shared YouTube-modal client leaf. | Server block plus shared client modal leaf. |
| `phxEmbedSocialReviews` | `packages/sanity-blocks/src/phx-embedsocial-reviews/index.tsx` | Independently reimplement a narrow EmbedSocial adapter. Preserve the lazy iframe, title, one-time resizer load, and resize initialization; do not create a generic arbitrary-script primitive. | Client adapter local to this block; load only on routes containing it. |
| `latestArticles` | `packages/sanity-blocks/src/latest-articles/index.tsx` | Adapt its V1 section and card presentation to V2's image and canonical blog-link conventions. Preserve top-six ordering and `articles.length === 0 -> null`. Do not retain V2 `all-posts` merely to obtain this capability. | Server block; its query/data contract belongs to the V2 Page Builder projection. |
| `faqAccordion` | `packages/sanity-blocks/src/faq-accordion/index.tsx` | Adapt the section and reuse V2's existing Accordion primitive directly. Use the V2 Badge/Link interfaces with PHX-specific classes instead of copying V1 primitives. | Server block containing V2's existing Accordion client primitive. |
| `awardCta` | `apps/web/src/components/page-builder-renderers/award-cta-section.tsx` | Adapt to V2 Button and image handling. Reuse the deterministic `ParticleField`, its animation/reduced-motion rules, and the exact trophy PNG. | Server block; decoration is static CSS/markup. |
| `pageHeader` | `packages/sanity-blocks/src/page-header/index.tsx` | Adapt the V1 header/stats/breadcrumb presentation and reuse `ParticleField`. It is a page-builder block, not a replacement for V2 route metadata or route-shell headings. | Server block. |
| `teamMembers` | `packages/sanity-blocks/src/team-members/index.tsx` | Adapt to V2 image and PHX Portable Text. Preserve the card semantics and distinctive inline icon geometry; do not add a people-card package. | Server block. |
| `storyFeature` | `apps/web/src/components/page-builder-renderers/story-feature.tsx` | Adapt to V2 image, rich text, buttons, and a V2-owned shared `KeyDetails` module. Replace `useId` with a stable `_key`-derived identifier so the whole block need not be client code. | Server block. |
| `bigVideoFeature` | `apps/web/src/components/page-builder-renderers/big-video-feature.tsx` | Adapt the V1 section shell and reuse the same pure YouTube parser and shared modal leaf as `videoFeature`. Preserve `youtube-nocookie.com` playback and the V1 poster/fallback outcome. | Server block plus shared client modal leaf. |
| `editorialChapter` | `apps/web/src/components/page-builder-renderers/editorial-chapter.tsx` | Adapt its quote, impact-statement, and proof-point variants as block-local nested renderers. Use V2 Portable Text and stable `_key` identifiers; no browser state is required. | Server block. |
| `youtubeChannelFeature` | `apps/web/src/components/page-builder-renderers/youtube-channel-feature.tsx` | Adapt to V2 image, Button, Link, and Lucide interfaces. Reuse the self-contained animation CSS, including the reduced-motion pause, after relocating it beside the V2 block. | Server block with CSS animation only. |
| `personCta` | `apps/web/src/components/page-builder-renderers/person-cta.tsx` | Adapt to a V2-owned shared person-CTA shell, `KeyDetails`, PHX Portable Text, V2 Button, and V2 image handling. | Server block. |
| `contactForm` | `apps/web/src/components/page-builder-renderers/contact-form.tsx` | Adapt the V1 layout and native fields. Independently reimplement only the submit/status leaf: prevent submission and announce the stored unavailable message. Do not attach V2 newsletter, Resend, React Hook Form, or validation infrastructure. | Server section with a small client form/status leaf. |
| `personContactCta` | `apps/web/src/components/page-builder-renderers/person-contact-cta.tsx` | Adapt through the same V2-owned person-CTA shell as `personCta`; reuse existing Lucide utility icons and V2 link/image primitives. | Server block. |
| `locationMap` | `apps/web/src/components/page-builder-renderers/location-map.tsx` | Adapt to V2 image handling and a lazy Google Maps iframe. Replace `useId` with a stable `_key` identifier; the iframe itself does not justify a client block. | Server block. |

## Shared module decisions

| V1 dependency | Evidence | V2 decision |
| --- | --- | --- |
| `packages/ui/src/components/button.tsx` | Same Radix Slot/CVA shape as V2 Button; V1 differs mainly in PHX sizing and visual classes. | Reuse `frontend/components/ui/button.tsx`; add PHX-specific classes or a narrowly named variant only if multiple blocks need the same contract. Do not copy the primitive. |
| `packages/ui/src/components/accordion.tsx` | Structurally equivalent to V2 Accordion and backed by the same Radix package. | Reuse `frontend/components/ui/accordion.tsx`; keep PHX section styling in `faqAccordion`. |
| `packages/ui/src/components/badge.tsx` | V2 already has a CVA Badge. V1 adds empty-content and `asChild` behavior. | Use V2 Badge for the selected FAQ presentation; add only behavior demonstrated by selected content. |
| `packages/ui/src/components/particle-field.tsx` | Deterministic, 82 lines, React-only, no environment or package coupling. | Reuse directly under V2 ownership, together with `particle-twinkle` and `prefers-reduced-motion` CSS. |
| `packages/ui/src/lib/utils.ts` | `clsx` plus `tailwind-merge`. | Use the existing `frontend/lib/utils.ts` `cn`; do not copy. |
| `internal/sanity-image.tsx` | Adds `sanity-image`, an environment package, client state, embedded-frame detection, and Stega cleaning. | Independently implement a V2-owned presentation adapter around `next/image`, `frontend/sanity/lib/image.ts`, projected dimensions/LQIP/hotspot/crop, and block-field `data-sanity`. Do not add `sanity-image`. |
| `internal/rich-text.tsx` | A 366-line superset supporting generated heading slugs, custom links, button links, images, tables, arbitrary iframes, and YouTube. The selected published content uses none of those custom types or marks. | Adapt the existing V2 Portable Text renderer through a small PHX presentation profile supporting the observed `normal`, `h3`, and `blockquote` contract. Preserve the broader V2 post renderer independently; do not make it depend on PHX block styling. |
| `internal/sanity-buttons.tsx` | Maps selected Sanity button data to the V1 Button/Link interface. | Reimplement as a small V2 block-shared adapter over V2 Button and Link. Preserve only `default`, `outline`, `secondary`, target, rel, broken-link, and `_key` behavior required by selected data. |
| `key-details.tsx` | Used by `storyFeature` and `personCta`. | Adapt once under `frontend/components/blocks/shared/`; its two callers make this a real shared module. |
| `person-cta-shell.tsx` | Used by `personCta` and `personContactCta`. | Adapt once under the same private block-shared area; do not promote it to generic UI. |
| `page-builder-surfaces.ts` | Converts one V1 boolean to `surface-cream`/`surface-white`; selected documents store no value. | Express the selected default surface through a PHX section wrapper or a retyped V2 `SectionContainer`. Do not retain generated `ColorVariant`/`SectionPadding` types solely for this helper. |
| `phx-visual-system.ts` | Repeated PHX layout, typography, surface, and prose classes. | Adapt its values into V2's global tokens plus a small private block-presentation module where repetition remains. Do not create a new workspace package. |
| V1 aggregate query and `PageBuilder` dispatcher | Both cover all 24 V1 identities and V1 route semantics. | Omit. Register the 17 identities behind V2's protected schema/GROQ/TypeGen/`Blocks` seam. |
| `packages/env` and `packages/logger` | Reached only through the V1 image and rich-text implementations. | Omit. Use V2's existing environment and framework behavior. |

This placement follows the deletion test: deleting the private PHX block-shared area should force repeated presentation and interaction logic back into multiple selected renderers, while deleting a copied V1 workspace package should not be necessary to understand V2's application foundation.

## Styles, fonts, icons, and media

### PHX tokens and fonts

Cherry-pick, do not wholesale-copy, the V1 PHX design contract into `frontend/app/globals.css`:

- PHX teal accent and hover colors;
- navy, cream, border, heading, body, muted, star, and on-dark label tokens;
- white/cream section and card-on-section surface tokens;
- PHX display/body font variables;
- the surface utilities and particle animation/reduced-motion rules;
- repeated PHX typography and prose behavior actually used by the selected blocks.

Keep V2's Tailwind v4 theme, base reset, container, theme provider, and existing non-PHX application tokens. Token names may be adapted, but the V1 visible values are the reference.

Load Source Serif 4 (`400`–`700`) and Archivo (`400`–`700`) through V2's existing `next/font` root-layout mechanism. Replace the current Inter mapping for PHX presentation through CSS variables; do not copy V1's root layout, scripts, providers, navigation, live-content setup, or JSON-LD composition. This preserves `next/font` self-hosting and layout-shift protection while restoring V1 typography.

### Icons

- Reuse the existing V2 `lucide-react` dependency for generic Play, Close, Mail, Phone, Map, Arrow, and similar utility icons.
- Reuse V1 inline SVG path data where the icon is part of the selected block's distinctive illustration, especially `loanFeatureCards`; copying those paths does not justify a new icon package.
- Studio icons may continue to use the already-installed Lucide or Sanity icon packages.

### Runtime and Studio media

- The eleven selected Sanity image assets remain content-migration inputs, not repository files for this ticket. Render them through V2 image projections and the V2 image adapter after migration.
- Reuse `apps/web/public/brand/phx-award-trophy.png` exactly as `frontend/public/brand/phx-award-trophy.png`. It is 900×1256 and 1,419,037 bytes at the pinned V1 ref.
- Reuse the eight existing 1200×800 V1 preview compositions for `awardCta`, `faqAccordion`, `homeHero`, `latestArticles`, `loanFeatureCards`, `phxEmbedSocialReviews`, `storyFeature`, and `videoFeature`, converting/naming them for V2's `_type`-keyed preview convention.
- Independently create previews for the nine selected identities that have none in V1: `bigVideoFeature`, `contactForm`, `editorialChapter`, `locationMap`, `pageHeader`, `personContactCta`, `personCta`, `teamMembers`, and `youtubeChannelFeature`.
- Reuse `youtube-channel-feature.module.css` beside the V2 renderer unless implementation proves the same isolated animation can be expressed more clearly without losing its reduced-motion behavior.

## Npm dependency decision

The selected V1 runtime closure reaches these external packages:

```text
@radix-ui/react-accordion
@radix-ui/react-slot
@t3-oss/env-nextjs
class-variance-authority
clsx
lucide-react
next
next-sanity
react
sanity-image
slugify
tailwind-merge
zod
```

Type support also reaches `@sanity/client` and `@sanity/codegen`.

| Package set | Decision |
| --- | --- |
| `@radix-ui/react-accordion`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `lucide-react`, `next`, `next-sanity`, `react`, `tailwind-merge` | Reuse the versions already owned by V2. Do not pin back to V1 versions. |
| `@sanity/client` | Already owned by V2 and used by its Sanity integration; no adaptation-specific addition. |
| `@portabletext/react`, `@sanity/image-url` | Use V2's existing equivalents for V1 rich text and images. |
| `@t3-oss/env-nextjs` | Omit. V2 already has an environment seam, and the selected V1 dependency exists only to support the discarded `sanity-image` wrapper. |
| `sanity-image` | Omit. It would add a second image interface and expand the client bundle; use V2 `next/image` plus `@sanity/image-url`. |
| `slugify` | Omit for the selected content. No selected published block requires generated heading IDs; stable block `_key` identifiers cover block labelling. |
| `@sanity/codegen` | Omit. V2's protected Sanity TypeGen workflow owns generated types. |
| `zod` | No selected block introduces a new need for it. Keep or remove the existing V2 dependency according to its remaining non-catalog consumers, not this migration. |

Do not add V1's `packages/ui`, `packages/sanity-blocks`, `packages/env`, or `packages/logger` as V2 workspaces. The equivalent ownership already exists in V2's `frontend/components/ui`, `frontend/components/blocks`, `frontend/lib`, `frontend/sanity`, and Studio directories.

The V1 contact form does not justify retaining or adding React Hook Form, Resend, React Email, or newsletter infrastructure. Existing V2 packages become removable only after the catalog-removal implementation proves they have no remaining consumer.

## External runtime services and links

| Dependency | Selected behavior | V2 adapter decision |
| --- | --- | --- |
| V2 Sanity project/dataset | Page, referenced document, latest-article, and image data. | Preserve V2 client, cache, live, draft, Presentation, and image-query seams. The selective migration ticket owns content movement. |
| YouTube | Two click-to-play embeds use video `OOfeMMtcOCI`; the channel block links to it. | Reuse the pure parser, render `youtube-nocookie.com`, and allow only the exact thumbnail host required by `next/image`. No new player package. |
| EmbedSocial | Content-controlled iframe and resizer script currently resolve to `embedsocial.com`. | Isolate in one adapter, validate the expected origin, load the resizer once, and keep it route-scoped. |
| Google Maps | Lazy map iframe, directions link, and short contact link. | Use native iframe and link behavior with the selected origins; no maps SDK. |
| Microsoft Bookings and stored internal/external URLs | Ordinary CTA navigation. | Use V2 Button/Link mapping and V2 canonical internal URL rules; no SDK. |
| `mailto:` and `tel:` | Direct contact actions. | Preserve as links. |
| Contact-form submission | No endpoint; submission is prevented and the stored unavailable message is announced. | Preserve exactly. A functioning form is outside this ticket and requires a separate product/integration decision. |

## Client and performance contract

- Keep every block renderer server-capable. Client code is limited to three private interaction modules: a shared YouTube modal used by two blocks, the unavailable contact form/status leaf, and the EmbedSocial adapter. The existing V2 Accordion primitive remains its own client island.
- Replace V1 `useId`-only client boundaries with stable `_key`-derived identifiers.
- Do not copy V1's client `SanityImage` wrapper. Use V2 `next/image` with explicit dimensions or `fill`, responsive `sizes`, LQIP where projected, and priority only for true above-the-fold images.
- Preserve hotspot/crop and useful alt/caption fallbacks. The eleven V1 asset documents have empty document-level `altText`, so block-local text and captions remain required inputs rather than optional polish.
- Add only exact remote image patterns required by selected media, such as `img.youtube.com`; do not broaden the image allowlist.
- Do not silently change V2's current `images.unoptimized: true` setting in this ticket. It is an existing performance limitation, not an adaptation decision; the acceptance/implementation program may benchmark and change it separately.
- Load third-party frames/scripts only on routes containing their block. Do not move them into V2's root or main layout.
- Preserve V2 Cache Components, Sanity tag invalidation, Draft Mode, `SanityLive`, Visual Editing, route generation, metadata, and Header/Footer composition unchanged.

## Explicit omissions

- V1 `apps/web/src/app/layout.tsx`, navigation/footer data loading, providers, Google Tag Manager, JSON-LD composition, preview bar, and live-content integration.
- V1 `packages/sanity/src/query.ts` aggregate 24-block fragment and `apps/web/src/components/pagebuilder.tsx` dispatcher.
- V1 `homePage` root-document behavior and leading-slash slug model.
- Unselected V1 identities: `advisorCta`, `cta`, `featureCardsIcon`, `hero`, `imageLinkCards`, `richTextBlock`, and `subscribeNewsletter`.
- Unused V1 rich-text types and dependencies: table, arbitrary iframe, rich-text YouTube, image, generated heading slugs, custom-link/button-link renderers, logger, and `slugify`. This omission is specific to the pinned selected content; V2's independent blog Portable Text capabilities remain protected.
- V1 blog/category documents and images solely to populate `latestArticles`.
- Any form endpoint or new analytics, consent, map, video-player, review-widget, or booking SDK.

## Implementation handoff constraints

The later implementation plan should enforce these gates:

1. The 17 renderers live only behind V2's existing `Blocks` dispatcher and complete Page Builder vertical-slice contract.
2. V2 package manifests gain no V1-only runtime dependency.
3. Browser-only code is limited to the named private client leaves; route, layout, query, and most block presentation remain server code.
4. The eleven Sanity images use the V2 image interface; the trophy and eight reusable Studio previews retain byte/content provenance.
5. Archivo and Source Serif 4 load through `next/font`; PHX tokens are merged into V2 globals without copying V1 application styles wholesale.
6. YouTube, EmbedSocial, Google Maps, Microsoft Bookings, `mailto:`, and `tel:` reproduce the selected outcomes without broad generic adapters or new SDKs.
7. `latestArticles` renders nothing for zero results, and the contact form remains explicitly unavailable.
8. Exact-set/deletion verification proves no V1 package seam, unused rich-text capability, retired V2 catalog identity, or duplicate dispatcher/query logic survives accidentally.
9. Visual and interaction verification covers the four pinned routes at desktop and mobile widths, keyboard/focus behavior, reduced motion, loading/CLS behavior, and Presentation field editing.

## Map impact

This resolution creates no new investigation ticket. It gives [Define the minimal V1 block contract for V2](https://github.com/ovsw/phxhomeloancom-2026/issues/8), [Define preservation and acceptance gates](https://github.com/ovsw/phxhomeloancom-2026/issues/6), and [Sequence the migration implementation program and handoff](https://github.com/ovsw/phxhomeloancom-2026/issues/10) a concrete package, module, client-boundary, media, and third-party decision.

No map fog graduates from this answer alone: route-specific slicing and cutover order still depend on the remaining block-contract, content-migration, and acceptance decisions.

## Reproduction

```bash
# Pinned sources
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 rev-parse HEAD
git -C /Users/ovs/Work/learn/phxhomeloancom-2026 rev-parse HEAD

# Selected runtime and package evidence
sed -n '236,316p' docs/research/v1-selected-route-content-graph.md
jq -r '.dependencies | to_entries[] | [.key,.value] | @tsv' frontend/package.json | sort

# V2 source drift from the protected baseline
git diff --name-only b8504a2bf6099cbfe73785e1b0cfbeff3e835912..HEAD

# Relevant V2 equivalents
sed -n '1,220p' frontend/components/ui/button.tsx
sed -n '1,220p' frontend/components/ui/accordion.tsx
sed -n '1,260p' frontend/components/portable-text-renderer.tsx
sed -n '1,220p' frontend/sanity/lib/image.ts
sed -n '1,260p' frontend/app/globals.css
```

The published-content profile was gathered through the read-only Sanity query endpoint for project `e4y15utr`, dataset `production-v2`, API version `2025-08-29`, `perspective=published`. No Sanity document, application source, package manifest, or configuration was mutated.
