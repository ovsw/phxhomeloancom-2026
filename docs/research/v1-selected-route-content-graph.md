# V1 selected-route content graph

Research for [Inventory the selected V1 route content graph](https://github.com/ovsw/phxhomeloancom-2026/issues/9). Evidence was captured read-only on 2026-07-31.

## Answer

The four selected V1 routes contain **19 ordered Page Builder instances across 17 top-level block identities**. The dependency-closed minimum is those 17 identities, not V1's complete 24-identity catalog.

The stored published-content closure is:

- four route documents;
- six referenced content documents: three `faq` documents and three `teamMember` documents;
- eleven Sanity image assets reached from the route documents and referenced team members;
- one repository-owned runtime image, `apps/web/public/brand/phx-award-trophy.png`;
- four shared registered schema types: `button`, `customUrl`, `faq`, and `teamMember`, plus the inline objects and Sanity built-ins named below.

The `latestArticles` block also performs a live subquery. It currently adds six blog cards, six blog images, and one shared category to the rendered home page, but the map explicitly permits zero articles at launch. Those records are a runtime read dependency, not migration-prerequisite content.

The V1 source closure for the selected block implementations is 33 value-runtime files plus two type-support files. The content-model closure is 17 block schema files plus three shared schema helpers, and 17 block GROQ files plus one shared GROQ fragment. V1's dispatcher and aggregate page query statically include all 24 catalog entries, so they are superset mechanisms and must not be ported wholesale. V2's protected schema/GROQ/TypeGen/dispatcher seam should host only the selected union.

## Pinned evidence and drift check

- V1 code: `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a` in `/Users/ovs/Work/Dev/phx/phxhomeloan.com-2026`.
- V1 Sanity: project `e4y15utr`, dataset `production-v2`, API version `2025-08-29`, `perspective=published`, Stega disabled.
- The four route revisions still match [Pin the V1 reference and protected V2 baseline](https://github.com/ovsw/phxhomeloancom-2026/issues/5):

| Route | Document | Revision |
| --- | --- | --- |
| `/` | `homePage` (`homePage`) | `3NHMz2D08XS0FRS44z4bbV` |
| `/our-team` | `kRTGqiPtwZ1pXIol9E5iGF` (`page`) | `jrGondNvXH2thrLSSob87Y` |
| `/phoenix-loan-originator` | `mystory` (`page`) | `3NHMz2D08XS0FRS452v7ak` |
| `/contact` | `contactMe` (`page`) | `KEqdEdvzfB7fb5MaXif9Qi` |

## Ordered route graphs

Fields are the stored top-level fields on each block instance. Nested types are the `_type` values observed transitively inside that instance. References name the direct Sanity targets; referenced documents are expanded later in this report.

### `/`

| # | Identity and key | Fields | Nested types | References |
| ---: | --- | --- | --- | --- |
| 1 | `homeHero` — `phx-home-hero` | `backgroundImage`, `buttons`, `marketPositioning`, `mobileBackgroundImage`, `portraitImage`, `richText`, `servicePromise` | `block`, `button`, `customUrl`, `image`, `span` | three image assets |
| 2 | `loanFeatureCards` — `phx-loan-options` | `cards`, `eyebrow`, `title` | `customUrl`, `phxLoanFeatureCard` | none |
| 3 | `videoFeature` — `phx-meet-jimmy-video` | `buttons`, `eyebrow`, `richText`, `thumbnailImage`, `title`, `youtubeUrl` | `block`, `button`, `customUrl`, `image`, `span` | one image asset |
| 4 | `phxEmbedSocialReviews` — `phx-google-reviews` | `iframeSrc`, `iframeTitle`, `resizerScriptSrc` | none | none |
| 5 | `latestArticles` — `phx-latest-educational-content` | `buttons`, `eyebrow`, `title` | `button`, `customUrl` | live blog subquery |
| 6 | `faqAccordion` — `phx-home-faqs` | `eyebrow`, `faqs`, `title` | none inline | three `faq` references |
| 7 | `awardCta` — `phx-award-cta` | `buttons`, `description`, `highlight`, `title` | `button`, `customUrl` | repository trophy image |

### `/our-team`

| # | Identity and key | Fields | Nested types | References |
| ---: | --- | --- | --- | --- |
| 1 | `pageHeader` — `phx-team-page-header` | `description`, `eyebrow`, `title` | none | none |
| 2 | `teamMembers` — `phx-team-members` | `eyebrow`, `members`, `richText`, `title` | `block`, `span` | three `teamMember` references; each member references an image |

### `/phoenix-loan-originator`

| # | Identity and key | Fields | Nested types | References |
| ---: | --- | --- | --- | --- |
| 1 | `pageHeader` — `meet-jimmy-page-header` | `description`, `eyebrow`, `statistics`, `title` | `statistic` | none |
| 2 | `storyFeature` — `meet-jimmy-early-years` | `eyebrow`, `image`, `imageCaption`, `keyDetails`, `richText`, `title` | `block`, `image`, inline `object`, `sanity.imageHotspot`, `span` | one image asset |
| 3 | `bigVideoFeature` — `meet-jimmy-big-video` | `description`, `eyebrow`, `title`, `youtubeUrl` | none | none |
| 4 | `editorialChapter` — `meet-jimmy-new-mission` | `eyebrow`, `richText`, `supportingContent`, `title` | `block`, `quoteCallout`, `span` | none |
| 5 | `editorialChapter` — `meet-jimmy-career` | `eyebrow`, `richText`, `supportingContent`, `title` | `block`, `impactStatement`, `proofPoint`, `proofPoints`, `span` | none |
| 6 | `youtubeChannelFeature` — `6cebccdb700f` | `channelImage`, `eyebrow`, `facts`, `mobileChannelImage`, `richText`, `title`, `youtubeButton` | `block`, `channelFact`, `image`, `span` | two image assets |
| 7 | `personCta` — `meet-jimmy-person-cta` | `buttons`, `eyebrow`, `keyDetails`, `personImage`, `richText`, `title` | `block`, `button`, `customUrl`, `image`, `span` | one image asset |

### `/contact`

| # | Identity and key | Fields | Nested types | References |
| ---: | --- | --- | --- | --- |
| 1 | `contactForm` — `contact-form` | `description`, `emailField`, `eyebrow`, `formTitle`, `messageField`, `nameField`, `officeHours`, `officeHoursTitle`, `phoneField`, `privacyNote`, `submitLabel`, `title`, `unavailableMessage` | inline `object`, `officeHoursRow` | none |
| 2 | `personContactCta` — `contact-jimmy-directly` | `contactMethods`, `credentialLine`, `eyebrow`, `personImage`, `title` | `image`, `personContactMethod` | one image asset |
| 3 | `locationMap` — `contact-location-map` | `address`, `businessName`, `credentialLine`, `directionsLabel`, `directionsUrl`, `eyebrow`, `image`, `imageEyebrow`, `imageTitle`, `mapEmbedUrl`, `mapTitle`, `title` | `image` | one image asset |

## Exact top-level union

The exact set, sorted by identity, is:

```text
awardCta
bigVideoFeature
contactForm
editorialChapter
faqAccordion
homeHero
latestArticles
loanFeatureCards
locationMap
pageHeader
personContactCta
personCta
phxEmbedSocialReviews
storyFeature
teamMembers
videoFeature
youtubeChannelFeature
```

`pageHeader` is the only top-level identity shared by more than one selected route. `editorialChapter` has two instances on one route. The other 15 identities occur once.

V1's full registry has 24 identities. The seven catalog identities not reached by the selected routes are `advisorCta`, `cta`, `featureCardsIcon`, `hero`, `imageLinkCards`, `richTextBlock`, and `subscribeNewsletter`. They are outside this dependency-closed minimum.

The aggregate registry is in `packages/sanity/src/query.ts` lines 31–56 at the pinned ref. The aggregate frontend dispatcher is in `apps/web/src/components/pagebuilder.tsx` lines 77–182. Both are deliberate supersets.

## Content-model closure

Every selected identity has one schema and one GROQ projection at the pinned ref:

```text
packages/sanity-blocks/src/<block-directory>/<block-directory>.schema.ts
packages/sanity-blocks/src/<block-directory>/<block-directory>.groq.ts
```

The block directories are:

```text
award-cta
big-video-feature
contact-form
editorial-chapter
faq-accordion
home-hero
latest-articles
loan-feature-cards
location-map
page-header
person-contact-cta
person-cta
phx-embedsocial-reviews
story-feature
team-members
video-feature
youtube-channel-feature
```

The GROQ closure adds only `packages/sanity-blocks/src/internal/groq-fragments.ts`. The schema import closure adds:

```text
packages/sanity-blocks/src/big-video-feature/youtube.ts
packages/sanity-blocks/src/internal/sanity-rich-text.ts
packages/sanity-blocks/src/internal/schema-fields.ts
```

The selected schemas refer to four separately registered project types:

| Type | Definition | Required by |
| --- | --- | --- |
| `button` | `apps/studio/schemaTypes/definitions/button.ts` | blocks with CTA buttons |
| `customUrl` | `apps/studio/schemaTypes/definitions/custom-url.ts` | buttons and card/link objects |
| `faq` | `apps/studio/schemaTypes/documents/faq.ts` | `faqAccordion` references |
| `teamMember` | `apps/studio/schemaTypes/documents/team-member.ts` | `teamMembers` references |

All other named nested types observed above are inline objects inside the selected block schemas or Sanity built-ins. The V1 root types are `homePage` for `/` and `page` for the other routes. That is source evidence, not a recommendation to add `homePage` to V2: V2's protected URL model resolves `/` through a `page` with slug `index`, so a later compatibility/cutover decision must adapt this source shape.

The selected page projections enter through `queryHomePageData` and `querySlugPageData` in `packages/sanity/src/query.ts` lines 268–287. The shared `pageBuilderFragment` starts at line 226 and interpolates all V1 catalog projections; V2 should instead compose the exact selected set while retaining complete field projections and TypeGen.

## Referenced document closure

| Type | Document | Revision | Content fields | Further reference |
| --- | --- | --- | --- | --- |
| `faq` | `faq-home-faq-loan-types` | `wyBoXRpm5psD7comxCACfX` | `title`, `richText` | none |
| `faq` | `faq-home-faq-conventional-mortgage` | `wCKSa6ZolfDZcVa7wnhcfv` | `title`, `richText` | none |
| `faq` | `faq-home-faq-fha-mortgage` | `kRTGqiPtwZ1pXIol9EsEHN` | `title`, `richText` | none |
| `teamMember` | `kRTGqiPtwZ1pXIol9E5hNx` | `wVGk2y5qfSmFJfPDRX347Y` | `name`, `role`, `bio`, `email`, `phone`, `nmlsId`, `sortOrder`, `image`, migration provenance | `image-599b…-4024x6048-jpg` |
| `teamMember` | `wyBoXRpm5psD7comxC0xU7` | `wVGk2y5qfSmFJfPDRX34IL` | same | `image-e783…-1122x1402-png` |
| `teamMember` | `4t9n08s0qRtngWyh9gAwrt` | `fQCzqycfrifaVEP2JkbwwT` | same | `image-9e4b…-2848x4287-jpg` |

The query projections expand these references only to the fields their renderers need. The full referenced documents do not make their unrelated metadata part of the V2 interface.

## Asset closure

### Required published images

| Asset | Source filename | Dimensions | Used by |
| --- | --- | ---: | --- |
| `image-e43cf9e…-1536x1024-jpg` | `building-photo-2026.jpg` | 1536×1024 | `/` `homeHero`; `/contact` `locationMap` |
| `image-869d0d9…-1144x1323-jpg` | `hero-image-bg-mobile.jpg` | 1144×1323 | `/` `homeHero` |
| `image-e9a1c04…-1022x858-png` | `jimmy-v-portrait-no-bg.png` | 1022×858 | `/` `homeHero` |
| `image-201875f…-1280x720-jpg` | `i-gave-up-video-thumbnail.jpg` | 1280×720 | `/` `videoFeature` |
| `image-599b4fb…-4024x6048-jpg` | `ED1_9251.jpg` | 4024×6048 | `/our-team` member |
| `image-e783e7f…-1122x1402-png` | `brian-coakley-with-background.png` | 1122×1402 | `/our-team` member |
| `image-9e4bc27…-2848x4287-jpg` | `Jack_Roche-headshot.jpg` | 2848×4287 | `/our-team` member |
| `image-e99e268…-574x596-jpg` | `jimmy-marine-iraq.jpg` | 574×596 | `/phoenix-loan-originator` `storyFeature` |
| `image-5d3e458…-552x2288-jpg` | `jimmy-v-youtube-channel-video-list.jpg` | 552×2288 | `/phoenix-loan-originator` `youtubeChannelFeature` |
| `image-f75b433…-770x962-jpg` | `jimmy-v-youtube-mobile-video-grid.jpg` | 770×962 | `/phoenix-loan-originator` `youtubeChannelFeature` |
| `image-b6f3a25…-960x806-png` | `jimmy-vercellino-person-cta.png` | 960×806 | `/phoenix-loan-originator` `personCta`; `/contact` `personContactCta` |

The two cross-route shared assets are the building photo and Jimmy person-CTA portrait. All eleven asset documents have empty document-level `altText`; block projections therefore rely on block-local alt/caption fallbacks and the asset filename fallback.

### Repository-owned runtime asset

`awardCta` reads `/brand/phx-award-trophy.png`, stored at `apps/web/public/brand/phx-award-trophy.png` (1,419,037 bytes) at the pinned ref.

### Studio preview assets

V1 has `thumbnail.png` for eight selected block directories: `award-cta`, `faq-accordion`, `home-hero`, `latest-articles`, `loan-feature-cards`, `phx-embedsocial-reviews`, `story-feature`, and `video-feature`. The other nine selected blocks have no V1 thumbnail. This is a source gap, not permission to omit V2 previews: the V2 Page Builder guide requires a preview image for each top-level identity.

## Dynamic `latestArticles` closure

`packages/sanity-blocks/src/latest-articles/latest-articles.groq.ts` lines 3–33 performs a top-six subquery ordered by `publishedAt desc, _updatedAt desc`. On the pinned snapshot it returns:

| Blog document | Published | Slug |
| --- | --- | --- |
| `blog-a894b20b-1977-4045-88b8-793d168942d6` | 2026-06-30 | `/where-americans-are-moving` |
| `blog-7646a8e8-c88b-496a-9f30-087df67b6f90` | 2026-06-23 | `/why-now-is-the-best-window-for-buyers` |
| `blog-dc73560e-5eed-43fd-a5ad-3d3a69ba4169` | 2026-03-16 | `/why-mortgage-rates-are-rising-oil-prices-inflation` |
| `blog-56144c2f-3e60-4fa0-b163-865d26d236b7` | 2026-02-17 | `/rent-vs-buy-investing-vs-homeownership` |
| `blog-ed298ccb-58eb-4799-8f3f-37b1682f9666` | 2026-02-09 | `/local-vs-out-of-state-lender-does-it-really-matter` |
| `blog-ec89fde3-2ee6-46b6-bea4-16288bec9f6c` | 2022-09-27 | `/scottsdale-jumbo-loan` |

Each card adds one image asset; all six resolve the same category document, `9c4c1393-afe8-4eb4-b662-a20789de0c1b`. These are mutable read-time results. The renderer returns `null` when the array is empty, so no blog, category, or blog-image migration is required to make the block valid.

## Shared application and global-data dependencies

These dependencies affect all four rendered routes but are outside the selected block catalog. They remain governed by V2's protected foundation and the external Site Header and Site Footer specifications.

### Published global documents

| Purpose | Document | Revision | Notes |
| --- | --- | --- | --- |
| Header navigation | `navbar` (`navbar`) | `6UCg2e3aZL324TBHtrn56d` | columns, links, buttons; 13 internal page references are projected only to target slugs |
| Footer | `footer` (`footer`) | `4t9n08s0qRtngWyh9gnJ5O` | columns and compliance data; no references |
| Site metadata | `settings` (`settings`) | `vIRgxpFJftYhIRohhkYfme` | site/contact settings; no references in the stored document |

V1's root layout loads the global stylesheet, Archivo and Source Serif 4, navigation/settings, footer, JSON-LD, preview tooling, and Sanity live integration (`apps/web/src/app/layout.tsx` lines 1–119). The corresponding queries are `queryNavbarData`, `queryFooterData`, and `queryGlobalSeoSettings` in `packages/sanity/src/query.ts` lines 430–557. These facts describe the rendered V1 graph; they do not expand this map to redesigning the header or footer.

### Route-shell behavior

- `/` fetches `queryHomePageData`, derives the first `videoFeature` URL for `HomeVideoJsonLd`, and passes the array to `PageBuilder` (`apps/web/src/app/page.tsx` lines 31–72).
- The other routes use the catch-all page query and add `LoanOrCreditJsonLd`; `/phoenix-loan-originator` also adds `JimmyPersonJsonLd` (`apps/web/src/app/[...slug]/page.tsx` lines 175–388).
- `/our-team` and `/phoenix-loan-originator` begin with `pageHeader`, so the catch-all route suppresses its synthetic heading. `/contact` begins with `contactForm`, so root `title` and `description` remain route-shell inputs in addition to the block content.
- `sidebarContactPathway` is queried by the catch-all projection but is absent on all three selected page documents, so no sidebar document or asset enters the selected content closure.

## Code, helper, style, and package closure

### Selected block value-runtime files

```text
apps/web/src/components/key-details.tsx
apps/web/src/components/page-builder-renderers/award-cta-section.tsx
apps/web/src/components/page-builder-renderers/big-video-feature.tsx
apps/web/src/components/page-builder-renderers/contact-form.tsx
apps/web/src/components/page-builder-renderers/editorial-chapter.tsx
apps/web/src/components/page-builder-renderers/location-map.tsx
apps/web/src/components/page-builder-renderers/person-contact-cta.tsx
apps/web/src/components/page-builder-renderers/person-cta-shell.tsx
apps/web/src/components/page-builder-renderers/person-cta.tsx
apps/web/src/components/page-builder-renderers/story-feature.tsx
apps/web/src/components/page-builder-renderers/youtube-channel-feature.module.css
apps/web/src/components/page-builder-renderers/youtube-channel-feature.tsx
apps/web/src/lib/page-builder-surfaces.ts
apps/web/src/lib/phx-visual-system.ts
packages/env/src/client.ts
packages/logger/src/index.ts
packages/sanity-blocks/src/big-video-feature/youtube.ts
packages/sanity-blocks/src/faq-accordion/index.tsx
packages/sanity-blocks/src/home-hero/index.tsx
packages/sanity-blocks/src/internal/rich-text.tsx
packages/sanity-blocks/src/internal/sanity-buttons.tsx
packages/sanity-blocks/src/internal/sanity-image.tsx
packages/sanity-blocks/src/latest-articles/index.tsx
packages/sanity-blocks/src/loan-feature-cards/index.tsx
packages/sanity-blocks/src/page-header/index.tsx
packages/sanity-blocks/src/phx-embedsocial-reviews/index.tsx
packages/sanity-blocks/src/team-members/index.tsx
packages/sanity-blocks/src/video-feature/index.tsx
packages/ui/src/components/accordion.tsx
packages/ui/src/components/badge.tsx
packages/ui/src/components/button.tsx
packages/ui/src/components/particle-field.tsx
packages/ui/src/lib/utils.ts
```

Type inference adds `apps/web/src/types.ts` and generated `packages/sanity/src/sanity.types.ts`. The generated file is evidence only; V2 must regenerate its own types.

The shared source hot spots are `packages/ui/src/lib/utils.ts` (15 block identities), `packages/env/src/client.ts` and `packages/sanity-blocks/src/internal/sanity-image.tsx` (12 each), `packages/ui/src/components/button.tsx` (11), `apps/web/src/types.ts` and the generated Sanity types (9), `packages/logger/src/index.ts` and `internal/rich-text.tsx` (8), and `internal/sanity-buttons.tsx` plus `page-builder-surfaces.ts` (6). These counts are import-closure facts, not a recommendation to reproduce V1's package seams.

### Styles

- All four routes inherit `packages/ui/src/styles/globals.css` from the V1 root layout. It owns the Tailwind theme, global tokens, base styles, and the Archivo/Source Serif font variables.
- Selected renderers also depend on `apps/web/src/lib/phx-visual-system.ts`, `apps/web/src/lib/page-builder-surfaces.ts`, component-local utility class strings, and `youtube-channel-feature.module.css`.
- V2 should preserve the visible contracts through its own design-system seam. Copying V1's global stylesheet wholesale would violate the protected V2 foundation.

### External npm runtime packages

The selected block value-runtime closure reaches:

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

Type-only support additionally reaches `@sanity/client` and `@sanity/codegen`. These are V1 implementation facts. The implementation spec should map behavior onto existing V2 packages before proposing any dependency addition.

## External runtime services and links

- Sanity provides all published page, referenced-document, dynamic-article, and image data.
- `videoFeature` and `bigVideoFeature` transform the shared video `OOfeMMtcOCI` into `youtube-nocookie.com` embeds and `img.youtube.com` thumbnails. `youtubeChannelFeature` links to the same YouTube video.
- `phxEmbedSocialReviews` loads an iframe and resizer script from `embedsocial.com` using content-controlled URLs.
- The home page links to Microsoft Bookings and several internal paths stored as external URL strings.
- `locationMap` embeds Google Maps and links to Google directions; `personContactCta` uses `tel:`, `mailto:`, and a Google Maps short link.
- `contactForm` has **no submission endpoint**. Its submit handler prevents the browser submission and exposes the stored `unavailableMessage` (`apps/web/src/components/page-builder-renderers/contact-form.tsx` lines 113–121). A functioning form would be a new product/integration decision, not part of reproducing V1 behavior.

## What this resolves for the map

1. The selected catalog is exactly the 17 identities above; seven V1 catalog entries are excluded.
2. The content migration prerequisite is four roots, six referenced content documents, eleven Sanity images, and the repository trophy image. The current six latest-article records and their dependencies are optional runtime content.
3. Shared dependencies are explicit: `pageHeader`; two cross-route Sanity images; the repeated YouTube video; the global navbar/footer/settings documents; and the shared render helpers/styles listed above.
4. V1's aggregate query, dispatcher, app shell, generated types, and global stylesheet are source evidence but not migration units. V2 must retain its own protected routing, Sanity live/cache, Presentation, TypeGen, dispatcher, layout, and design-system mechanisms.
5. The remaining implementation slicing and compatibility questions can now use a stable 17-identity union instead of the full V1 catalog.

## Reproduction

```bash
# Immutable V1 source
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 \
  show 40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a:packages/sanity/src/query.ts

git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 \
  show 40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a:apps/web/src/components/pagebuilder.tsx

# Published roots; recurse through every _ref returned by these documents.
# Endpoint parameters: perspective=published and query=<encoded GROQ>.
curl -sS 'https://e4y15utr.api.sanity.io/v2025-08-29/data/query/production-v2?perspective=published&query=...'
```

No Sanity document, application source file, configuration, issue other than the Wayfinder claim, or V1 tracked file was mutated while gathering this evidence.
