# V2 four-route routing, SEO, and Presentation contract

Research for [Lock routing, SEO, and Presentation behavior for the four routes](https://github.com/ovsw/phxhomeloancom-2026/issues/12). Evidence was captured read-only on 2026-07-31.

The protected V2 baseline is `b8504a2bf6099cbfe73785e1b0cfbeff3e835912`, pinned by [Pin the V1 reference and protected V2 baseline](./v1-reference-and-v2-baseline.md). The current checkout differs from that ref only by research documents, so every V2 source citation below describes the pinned tree.

## Contract

The four routes must remain ordinary V2 App Router pages. Do not port V1's `homePage` document type, leading-slash slug model, catch-all multiplexing, dynamic redirect system, page-wide client renderer, or route-level knowledge of individual block identities.

| Public route | V2 document contract | Route module | Missing-document behavior |
| --- | --- | --- | --- |
| `/` | Exactly one published `page` with `slug.current == "index"` | dedicated root route | renders the existing `MissingSanityPage` diagnostic; it does not call `notFound()` |
| `/our-team` | Exactly one published `page` with `slug.current == "our-team"` | `[...slug]` | `notFound()` and the global 404 |
| `/phoenix-loan-originator` | Exactly one published `page` with `slug.current == "phoenix-loan-originator"` | `[...slug]` | `notFound()` and the global 404 |
| `/contact` | Exactly one published `page` with `slug.current == "contact"` | `[...slug]` | `notFound()` and the global 404 |

The root route always queries `index`; the catch-all joins URL segments with `/` and uses that slashless value as the page-query parameter. `generateStaticParams()` queries published `page` slugs, omits `index`, and splits nested slugs into segment arrays. The implementation does not set `dynamicParams = false`, so params absent from the build-time result retain Next.js's on-demand behavior. Sources: V2 [`(main)/page.tsx`](../../frontend/app/%28main%29/page.tsx) lines 23–70 and [`(main)/[...slug]/page.tsx`](../../frontend/app/%28main%29/%5B...slug%5D/page.tsx) lines 24–112 at the pinned ref; official Next.js [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) documentation.

The root's diagnostic-versus-404 difference is current V2 behavior, not a recommendation. Missing catch-all metadata and page data both call `notFound()`; the global not-found metadata title is `Page not found`. Sources: catch-all lines 40–58 and 95–112; V2 [`app/not-found.tsx`](../../frontend/app/not-found.tsx) lines 1–10; [`MissingSanityPage`](../../frontend/components/ui/missing-sanity-page.tsx) lines 3–26.

### Current V2 content state

A published read-only query of V2 project `hv0545v9`, dataset `production`, API version `2026-03-23`, returned only two `page` documents:

| Slug | Document | Current blocks | Revision |
| --- | --- | --- | --- |
| `index` | `20228855-9ff0-453f-809e-e24ce78f0491` | `hero-1` | `uRAaNS3DcI72FPZjqeJ1j8` |
| `test-page-1` | `fc780c1a-cbf1-4248-a012-b736aa8b8e80` | `hero-2`, `grid-row` | `Bk0wLbxlDiIlSPvlS6MwIu` |

Therefore the existing `index` document is the content cutover target; creating a second published `index` would make the query's `[0]` selection ambiguous. The three named route documents do not exist yet. `test-page-1` is not one of the selected routes and uses retiring catalog blocks; its cutover disposition must not justify retaining those blocks or silently expand this map to rebuild it.

## Static generation, cache, live data, and drafts

Preserve this path without route-specific forks:

1. Published requests pass `perspective: "published"` and `stega: false` into the cached page fetch.
2. Draft Mode reads its cookie-selected perspective outside the cache boundary, falls back to `drafts`, and enables Stega.
3. `fetchSanityPageBySlug`, static-params fetches, and metadata fetches keep their `"use cache"` boundaries. Slug, perspective, and Stega are explicit cached-function inputs where applicable.
4. `cacheComponents: true` and the `next-sanity` default cache-life profile remain configured.
5. `SanityLive` remains in the main layout. It includes drafts only in Draft Mode and routes published tag changes through `updateTag`; Draft Mode uses `revalidateTag(tag, "max")` and returns `refresh`.
6. Metadata queries use the active perspective but force Stega off.

Sources: V2 [`sanity/lib/live.ts`](../../frontend/sanity/lib/live.ts) lines 11–65; [`sanity/lib/fetch.ts`](../../frontend/sanity/lib/fetch.ts) lines 18–34; [`(main)/layout.tsx`](../../frontend/app/%28main%29/layout.tsx) lines 18–50; [`app/actions/revalidate.ts`](../../frontend/app/actions/revalidate.ts) lines 8–27; [`next.config.mjs`](../../frontend/next.config.mjs) lines 1–6. The official Next.js [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) documentation confirms that runtime request state must be read outside cached scopes and passed as inputs, matching the V2 design.

Selected block queries stay inside `PAGE_QUERY` so their Sanity dependencies participate in the same perspective, cache, and live-invalidation path. `latestArticles` may still return no articles, per [Inventory the selected V1 route content graph](./v1-selected-route-content-graph.md); that does not require a second page route or client-side fetch mechanism.

## Presentation resolution

No route-specific Presentation adapter is needed:

- `/` resolves `_type == "page" && slug.current == "index"`.
- Each named route matches the existing `/:slug` resolver and its slashless slug.
- Presentation enables the frontend's `/api/draft-mode/enable` route against the configured preview origin.
- A valid session renders the cookie-selected draft/release perspective with Stega, `VisualEditing`, draft-aware Header/Footer data, and draft-aware `SanityLive`.

Sources: V2 [`studio/presentation/resolve.ts`](../../studio/presentation/resolve.ts) lines 26–39; [`studio/sanity.config.ts`](../../studio/sanity.config.ts) lines 27–59; [`app/api/draft-mode/enable/route.ts`](../../frontend/app/api/draft-mode/enable/route.ts) lines 1–7; [`(main)/layout.tsx`](../../frontend/app/%28main%29/layout.tsx) lines 23–48.

The replacement Page Builder projections must continue to return `_key`, `_type`, and every rendered field so Stega source maps and overlays reach the new block renderers. Presentation resolution is a route/document concern; field editability remains a vertical-slice acceptance test, not logic to add to the route modules.

## Metadata, canonical URLs, and discovery

Preserve the V2 metadata mechanism:

- Each route queries `page.meta` through `PAGE_QUERY` and `metaQuery`.
- `generatePageMetadata` supplies title, description, Open Graph image, environment-sensitive robots, and a computed canonical.
- Production pages with `meta.noindex != true` remain indexable and enter the sitemap; non-production metadata remains `noindex, nofollow`.
- Canonicals use `NEXT_PUBLIC_SITE_URL`; the production origin must be `https://phxhomeloan.com`, the current first-party canonical origin. V2 paths are `/`, `/our-team`, `/phoenix-loan-originator`, and `/contact`.
- `robots.ts` continues to advertise `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

Sources: V2 [`sanity/queries/page.ts`](../../frontend/sanity/queries/page.ts) lines 17–38; [`sanity/queries/shared/meta.ts`](../../frontend/sanity/queries/shared/meta.ts) lines 3–12; [`sanity/lib/metadata.ts`](../../frontend/sanity/lib/metadata.ts) lines 5–37; [`app/sitemap.ts`](../../frontend/app/sitemap.ts) lines 5–46; [`app/robots.ts`](../../frontend/app/robots.ts) lines 1–12.

### Required content adaptation

The four pinned V1 documents still had the revisions recorded by [Pin the V1 reference and protected V2 baseline](./v1-reference-and-v2-baseline.md). All four had `seoNoIndex == false`; all four `seoImage` references were null. Map them into V2's nested `meta` shape:

| Route | V2 page title input | V2 `meta.title` input | V2 `meta.description` | `meta.noindex` |
| --- | --- | --- | --- | ---: |
| `/` | `PHX Home Loan` | `Phoenix Mortgage Lender` | `Jimmy Vercellino and the PHX Home Loan team help Phoenix and nationwide borrowers compare mortgage options and move into a home loan with clear next steps.` | `false` |
| `/our-team` | `Our Team` | `Our Team` | `Meet the PHX Home Loan team supporting Arizona home buyers with loan guidance, prequalification, processing, and long-term mortgage planning.` | `false` |
| `/phoenix-loan-originator` | `Meet Jimmy` | `Phoenix Loan Originator \| Phoenix Mortgage Lenders` | `Mortgage Loan Originator Jimmy Vercellino is a top producing, award-winning mortgage loan originator in the Phoenix area for Luminate Bank.` | `false` |
| `/contact` | `Contact` | `Contact Jimmy Vercellino \| Phoenix Mortgage Lenders` | `If you are looking to get a Mortgage Loan in Phoenix AZ, contact Jimmy Vercellino, an experienced Home Loan Specialist by website or phone at 480-800-8387.` | `false` |

The `meta.title` values above are page-specific inputs for the existing global title-template mechanism. Replace the starter template suffix `Schema UI` with `PHX Home Loan`; do not copy an already-suffixed `| PHX Home Loan` into `meta.title` and then append the global brand a second time. This yields the intended final titles without V1's duplicate-brand home/team output. This is content normalization, not a new metadata system.

The root layout's default title, title-template suffix, and default Open Graph image are Schema UI starter content. The fallback asset at [`frontend/public/images/og-image.jpg`](../../frontend/public/images/og-image.jpg) visibly says “NEXT.JS SANITY starter by schema UI.” Because all four V1 `seoImage` values are null, leaving the fallback unchanged would publish starter branding on every selected route. Rebrand the existing title/default-image inputs while preserving `metadataBase`, fallback selection, image dimensions, and the per-page metadata interface. Sources: V2 [`app/layout.tsx`](../../frontend/app/layout.tsx) lines 8–28 and [`sanity/lib/metadata.ts`](../../frontend/sanity/lib/metadata.ts) lines 12–36.

### Contact's route-shell content gap

V1 `/contact` visibly rendered route-level `title == "Contact"` and its route description before the three inventoried Page Builder blocks because the first block was not `pageHeader` (V1 `apps/web/src/app/[...slug]/page.tsx` lines 313–339 and 379–388 at `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a`). V2's `PAGE_QUERY` returns only `blocks` and `meta`, and the V2 `page` schema has `title` but no route-description field; both V2 route modules render only `Blocks`.

A three-block mechanical copy would therefore lose visible content. Keep the V2 route modules dispatch-only and express the missing `Contact` heading/description as one `pageHeader` instance before `contactForm`. `pageHeader` is already in the selected 17-identity union, so this raises the target instance count from 19 to 20 without adding another identity or route-level block conditional. This is an adaptation of the target content graph, not evidence that V1's route shell should be ported.

## Internal links and fragments

V2's shared `linkQuery` resolves a page reference with slug `index` to `/`, a post reference to `/blog/<slug>`, and another page reference to `/<slug>`. Preserve that interface and use a page reference for the in-scope V1 `/contact/` CTA so its target becomes the canonical V2 `/contact`; do not preserve the source trailing slash in new content. Source: V2 [`sanity/queries/shared/link.ts`](../../frontend/sanity/queries/shared/link.ts) lines 1–10 and [`studio/schemas/blocks/shared/link.ts`](../../studio/schemas/blocks/shared/link.ts) lines 8–42.

Preserve external HTTPS, `tel:`, `mailto:`, YouTube, Maps, and EmbedSocial values with their existing new-tab intent. Fragments stay same-document links, but their targets must work:

- Home's `#meet-jimmy` is intended to reach the video feature. The pinned V1 renderer hard-codes `id="video-feature"`, so the stored link and rendered target disagree (`packages/sanity-blocks/src/video-feature/index.tsx` lines 122–127 at the V1 ref).
- Originator's `#contact` is intended to reach `personCta`. The pinned V1 `PersonCtaShell` renders no section id (`apps/web/src/components/page-builder-renderers/person-cta-shell.tsx` lines 24–43 at the V1 ref).

Do not reproduce those broken fragment contracts. The replacement renderers must expose stable `meet-jimmy` and `contact` targets (or the migrated links must be changed to equally explicit stable targets) and tests must prove the click changes focus/scroll destination as intended.

### Seven targets beyond this map

The selected V1 homepage also links to these paths:

```text
/phoenix-conventional-loan/
/phoenix-fha-loan/
/phoenix-va-loan/
/phoenix-construction-to-permanent-loan/
/phoenix-jumbo-loan/
/blog/
/jimmy-vercellino-awarded-top-1-percent-mortgage-originators-in-us-2019/
```

None is one of the four destination routes, and none exists as a published V2 `page` in the captured dataset. Handling them is now a sharp product/editorial decision: separately bring a destination into scope, retarget or remove the link, or explicitly accept a missing destination. Do **not** silently create seven pages, invent unrelated redirects, or widen this map while implementing the four routes.

## Redirects that remain

1. Preserve V2's explicit permanent `/index` to `/` redirect. Source: V2 [`next.config.mjs`](../../frontend/next.config.mjs) lines 7–15.
2. Preserve V2's default trailing-slash normalization: `/our-team/`, `/phoenix-loan-originator/`, and `/contact/` redirect to their slashless counterparts. The official Next.js [`trailingSlash`](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash) documentation defines this default; V2 does not override it.
3. Preserve the one active V1 redirect whose destination is a selected route: both `/contact-me` and `/contact-me/` currently return `301` to `/contact/`. The pinned published Sanity document is `redirect-62e6f691217c`, revision `rvUPW097BGb4UcKOBOR1c3`, with `permanent == "true"`. Carry its permanent compatibility intent into V2 and target canonical `/contact`; this does not require porting V1's redirect schema/client architecture.

The first-party production site returned apex-host canonicals and redirected `www.phxhomeloan.com` to `phxhomeloan.com` on capture. Its current selected-route canonicals use V1 trailing slashes; V2's protected URL model deliberately changes the three named route canonicals to slashless paths while retaining inbound slash normalization.

## Acceptance contract for the implementation spec

- Published: all four canonical routes return their selected content with `published` perspective and no Stega; named trailing-slash requests normalize to slashless; `/index` redirects to `/`; `/contact-me` retains permanent compatibility to `/contact`.
- Static/cache: a production build generates the three named slugs from published Sanity data, excludes `index` from catch-all params, and retains cached Sanity fetches plus tag invalidation.
- Missing: an unknown catch-all slug reaches the global 404; root keeps its existing missing-`index` diagnostic unless a separate decision changes it.
- Presentation: each route resolves to its intended `page`; a valid Draft Mode session renders draft/release content with overlays and draft-aware live updates; disabling Draft Mode returns to published content.
- SEO: final title/description/robots/canonical/OG output is asserted for every route; canonicals use the apex production origin and V2 paths; no Schema UI asset or title survives.
- Links: `/contact` uses the in-scope route; `#meet-jimmy` and `#contact` resolve; external/scheme links retain their semantics; each of the seven out-of-scope targets has an explicit product disposition before implementation is called complete.
- Content graph: contact retains its route-level heading and description behind the Page Builder seam; `test-page-1` does not keep the retiring catalog alive.

## Reproduction

```bash
# Immutable V2 source
git show b8504a2bf6099cbfe73785e1b0cfbeff3e835912:'frontend/app/(main)/page.tsx'
git show b8504a2bf6099cbfe73785e1b0cfbeff3e835912:'frontend/app/(main)/[...slug]/page.tsx'
git show b8504a2bf6099cbfe73785e1b0cfbeff3e835912:frontend/sanity/lib/live.ts
git show b8504a2bf6099cbfe73785e1b0cfbeff3e835912:studio/presentation/resolve.ts

# Published V2 page inventory
# GET https://hv0545v9.api.sanity.io/v2026-03-23/data/query/production
#   ?perspective=published
#   &query=*[_type=="page"]|order(slug.current asc){_id,_rev,_updatedAt,title,"slug":slug.current,"blockTypes":blocks[]._type,meta{title,description,noindex}}

# Pinned V1 SEO fields and active selected-route redirects
# GET https://e4y15utr.api.sanity.io/v2025-08-29/data/query/production-v2
#   ?perspective=published
#   &query=<the four pinned documents or active redirect query>

# First-party redirect/canonical checks
curl -sSI https://phxhomeloan.com/contact-me
curl -sS https://phxhomeloan.com/contact/ | rg -o '<link[^>]+rel="canonical"[^>]*>'
```

No GitHub issue, Sanity document, application/configuration source, or generated file was mutated during this research.
