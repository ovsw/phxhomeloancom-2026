# V2 UX/UI preservation acceptance matrix

## Decision

The four-route rebuild is accepted only when every **release gate** below passes and its evidence is attached to the implementation pull request or migration review bundle. A gate may not be waived by a green build, a screenshot alone, or an editor saying that a page “looks right.”

The boundary is explicit:

- **V1 is a reference, not a donor application.** It supplies the pinned content, rendered composition, responsive behavior, interactions, links, unavailable/empty states, and a few separately approved isolated assets or pure helpers.
- **V2 owns the implementation.** Do not bring V1 workspace packages, repository layout, build/test tooling, routing, Sanity client/live-query architecture, aggregate query, dispatcher, root layout, environment wrapper, logger, or global application stylesheet into V2.
- Any test or evidence harness introduced for these gates is **V2-owned and appropriate to V2's setup**. The pinned V1 checkout may run separately only to capture the reference UX/UI.

This applies the visitor-contract and V2-owned-module decisions in [Define V1 dependency adaptation into V2](https://github.com/ovsw/phxhomeloancom-2026/issues/7) and the protected foundation in [Pin the V1 reference and protected V2 baseline](https://github.com/ovsw/phxhomeloancom-2026/issues/5).

## Authority and terms

Evidence is evaluated in this order:

1. The pinned V1 code commit `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a`, the four published V1 document revisions, and their separately rendered pages establish the **visitor reference**.
2. The pinned V2 source commit `b8504a2bf6099cbfe73785e1b0cfbeff3e835912` establishes the **protected V2 foundation**. The current source is unchanged from that pin; later commits through `13e87c2` add research documents only.
3. Closed Wayfinder decisions define intentional adaptations, migration scope, and accepted differences.
4. The implementation under test supplies generated, automated, browser, editor, and migration evidence.

A **visitor contract** is observable content, composition, responsive behavior, accessibility behavior, interaction, link destination, third-party outcome, and empty/unavailable state. **Scaffolding** is the repository, package, build, routing, data-access, caching, preview, and application-shell machinery used to deliver it. Only the visitor contract crosses from V1; V2 scaffolding remains V2-owned.

Primary local evidence is indexed by:

- [V1 reference and protected V2 baseline](./v1-reference-and-v2-baseline.md)
- [V1 selected-route content graph](./v1-selected-route-content-graph.md)
- [V2 Page Builder catalog removal boundary](./v2-page-builder-catalog-removal-boundary.md)
- [V2 minimal V1 block contract](./v2-minimal-v1-block-contract.md)
- [V1 dependency adaptation into V2](./v1-dependency-adaptation-into-v2.md)
- [V2 routing, SEO, and Presentation contract](./v2-four-route-routing-seo-presentation-contract.md)
- [Selective Sanity content and asset migration contract](./selective-sanity-content-asset-migration-contract.md)

## Required evidence packet before implementation

These are capture tasks, not V1-to-V2 tooling migrations.

| ID | Evidence | Pass condition |
| --- | --- | --- |
| `BASE-01` | Re-run the V1 published-revision query from the baseline asset. | The four `_rev` values still equal the pinned revisions. Drift stops the program for explicit review; it is not silently accepted. |
| `BASE-02` | From the pinned V1 checkout, capture full-page desktop `1440x1000` and mobile `390x844` screenshots plus keyboard/interaction recordings for the four routes, with no Draft Mode cookie. Record OS, browser, viewport, commit, dataset, perspective, date, and any masks used for mutable third-party frames. | Eight screenshots and the interaction notes are reviewable and reproducible. Dynamic masks are limited to named third-party content; selected first-party content is never masked. |
| `BASE-03` | From a production build of the pinned V2 source, record build output, route/client chunk inventory, and five fixed-profile Lighthouse runs for the available published control page. Record Node, pnpm, Chrome, Lighthouse, OS, CPU/network profile, and environment. | The packet exists before implementation. It is a foundation/control measurement, not a claim that the old V2 content is the visual reference. |

The baseline research expressly did **not** establish pixel fidelity, responsive behavior, accessibility, or production performance. Those claims require this packet; see its [limitations](./v1-reference-and-v2-baseline.md#limitations).

## Acceptance matrix

### 1. Scope and content graph

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `SCOPE-01` | Only the four destination pages enter the rebuilt page graph. | Published and draft GROQ inventory keyed by slug and `_id`; route crawl. | Exactly `index`, `our-team`, `phoenix-loan-originator`, and `contact` exist because of this program. No other V1 page, home-page type, redirect document, global, or unused block content was copied. |
| `SCOPE-02` | Adapted route order is exact. | Query-contract snapshot of `_type` and `_key` for every page. | `/`: `home-hero`, `loan-feature-cards`, `video-feature`, `phx-embed-social-reviews`, `latest-articles`, `faq-accordion`, `award-cta`; `/our-team`: `page-header`, `team-members`; `/phoenix-loan-originator`: `page-header`, `story-feature`, `big-video-feature`, `editorial-chapter`, `editorial-chapter`, `youtube-channel-feature`, `person-cta`; `/contact`: `page-header`, `contact-form`, `person-contact-cta`, `location-map`. Counts are exactly `7/2/7/4` (20 instances, 17 identities). |
| `SCOPE-03` | Referenced content and assets are dependency-closed. | Migration manifest, resolved-reference query, asset checksum report. | Exactly three `faq`, three `team-member`, eleven logical Sanity images, and the repository trophy asset support the pages. Every selected reference resolves; nothing else entered transitively. |
| `SCOPE-04` | The observable content is complete. | Field-level comparison against the pinned V1 snapshot plus rendered text/link inventory. | Selected headings, rich text, labels, statistics, FAQs, people, contact details, office hours, images/crop/hotspot, captions, video/embed inputs, and button/link outcomes match the approved transform. The intentional Contact `page-header` adaptation is present. |

### 2. Page Builder replacement and deletion

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `PB-01` | All top-level registration surfaces have exact-set parity. | A V2-owned contract test extracts `page.blocks.of`, flattened insert-menu groups, `PAGE_QUERY` branches, generated `PAGE_QUERY_RESULT`, dispatcher registry, and preview basenames. | Every set equals exactly the 17 hyphenated identities in `SCOPE-02`; no surface has a missing or extra identity. Generated `studio/schema.json` and `frontend/sanity.types.ts` agree after regeneration. |
| `PB-02` | The current V2 catalog is gone, not hidden. | Exact-set scan plus recursive schema/query/renderer/export/import discovery. | `hero-1`, `hero-2`, `section-header`, `split-row`, `grid-row`, `carousel-1`, `carousel-2`, `timeline-row`, `cta-1`, `logo-cloud-1`, `faqs`, `form-newsletter`, and `all-posts` are absent from every top-level source/generated/runtime set. No retired dependency-closed schema, query, renderer, preview, export, or import remains reachable unless the removal decision identifies a protected non-catalog consumer. |
| `PB-03` | V1 aliases and shadow implementations do not survive. | Source/generated exact-set scan and import graph. | The 17 camel-case V1 input identities appear only in migration fixtures/transforms. There is one V2 dispatcher and one `PAGE_QUERY` path; no route-local or page-wide fallback renderer bypasses them. |
| `PB-04` | Nested identities are reachable and projections are complete. | Recursive ownership test and schema/query/renderer field-coverage test. | Every registered replacement nested identity is reachable from a selected top-level slice or is the referenced `team-member` document. Every rendered field is projected; every projected business field is consumed or justified as `_id`, `_type`, `_key`, or `_ref`. |
| `PB-05` | Failure behavior is deterministic. | Dispatcher and query contract tests. | Empty arrays render nothing; unknown `_type` values fail through the agreed explicit unknown-block path; one bad block cannot silently select another renderer; `_key` is the React identity; there is no `all-posts` special branch. |

### 3. V2 application and module boundaries

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `ARCH-01` | Selected blocks remain behind the V2 Page Builder seam. | Import graph and diff review. | Route and layout modules import no selected block implementation. They fetch a V2 `page` and dispatch `Blocks`; the 17 slices are V2-owned modules. |
| `ARCH-02` | V2 routing, cache, live, and Presentation mechanisms remain the foundation. | Focused diff plus behavioral tests around [`frontend/app/(main)/page.tsx`](../../frontend/app/%28main%29/page.tsx), [`frontend/app/(main)/[...slug]/page.tsx`](../../frontend/app/%28main%29/%5B...slug%5D/page.tsx), [`frontend/sanity/lib/live.ts`](../../frontend/sanity/lib/live.ts), [`frontend/sanity/lib/fetch.ts`](../../frontend/sanity/lib/fetch.ts), [`frontend/app/actions/revalidate.ts`](../../frontend/app/actions/revalidate.ts), and [`studio/presentation/resolve.ts`](../../studio/presentation/resolve.ts). | No V1 route/data/cache/preview mechanism appears. Any change to a protected file is narrow, separately justified by a fixed V2 contract, and passes the matching behavior gate. No selected-block conditional enters these files. |
| `ARCH-03` | No V1 scaffolding or runtime dependency is ported. | Lockfile/package diff, forbidden-import scan, and source ownership review. | No V1 workspace package or runtime import exists. No new runtime dependency is added for `@t3-oss/env-nextjs`, `sanity-image`, `slugify`, `@sanity/codegen`, or the V1 logger path. Existing V2 dependencies and narrow V2-owned adapters deliver the UX/UI. |
| `ARCH-04` | Browser code remains narrow and route-scoped. | RSC/client-boundary test and production network traces. | New client code is limited to the shared YouTube modal leaf, unavailable contact-form/status leaf, and EmbedSocial adapter; the existing Accordion remains its own island. Third-party scripts/frames load only on routes containing their block and never move to a root/main layout. |
| `ARCH-05` | External Header and Footer work participates without scope expansion. | Integration crawl and the separate specifications' own evidence. | [Reproduce the legacy PHX main header navigation UX in the current architecture](https://github.com/ovsw/phxhomeloancom-2026/issues/1) and [Reproduce the legacy PHX main footer UX in the current architecture](https://github.com/ovsw/phxhomeloancom-2026/issues/2) pass their own acceptance contracts and render through the existing main-layout seams on all four pages. This matrix does not redesign or reimplement them. |

### 4. Sanity schema, migration, and exclusion

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `DATA-01` | The migration is allowlist- and digest-bound. | `plan` review bundle and SHA-256 digest from the selective migration contract. | The plan contains exactly four `page`, three `faq`, three `team-member`, and eleven asset inputs, with source revisions, target preflight, transforms, identity map, collision dispositions, and expected operation counts. `plan` is read-only. |
| `DATA-02` | IDs and collisions follow the fixed policy. | Authenticated `raw` preflight and target ID map. | Existing V2 Home keeps its ID; nine other content documents use persisted random Sanity-compatible IDs. Exact-ID, draft/release, slug, semantic, asset, and inbound-reference collisions are classified. Existing-target updates are `_rev` guarded. No public ID contains a dot or is derived from a V1 ID/slug/path. |
| `DATA-03` | Staging is draft-first and publication is ordered. | Mutation receipt plus draft and published graph queries. | The first approved digest permits only asset uploads and ten draft writes. Referenced documents publish before referring pages; references end strong; Home publishes last after a second digest-bound approval and fresh preflight. Published Home and unrelated content remain unchanged before that gate. |
| `DATA-04` | Assets are byte-verified. | Source document metadata, downloaded SHA-256 values, target asset metadata, and resolved image-reference query. | All eleven target assets match approved bytes, MIME types, and dimensions; transforms use returned target IDs. Required visible images have nonblank contextual alt text; no V1 project URL or asset/document ID remains. |
| `DATA-05` | Blog/post/category content is outside the write set. | Manifest, mutation receipt, and pre/post `_id`/`_rev` inventory for `blog`, `post`, and `category`; dynamic-image inventory. | There are zero creates, patches, deletes, or publishes for those types and zero V1 dynamic article images. Every pre-existing V2 `post` and `category` has the same `_id` and `_rev` after the migration. Counts may drift independently and are not migration preconditions. |
| `DATA-06` | Rollback is reviewable rather than implicit. | `rollback-plan`, pre-stage target snapshot, and mutation receipt. | The inverse plan accounts for every mutation. It is read-only; executing it remains a separately approved destructive action. |

### 5. Routing, metadata, links, and live content

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `ROUTE-01` | Canonical route behavior is preserved. | Production browser/HTTP tests. | `/`, `/our-team`, `/phoenix-loan-originator`, and `/contact` return 200. `/` reads `index`; named pages use slashless slugs, published static params, and `notFound()` for missing pages. `/index` permanently redirects to `/`; `/contact-me` permanently redirects to `/contact`; normal trailing-slash normalization remains. |
| `ROUTE-02` | Metadata and discovery use the existing V2 mechanism. | HTML/head assertions, sitemap/robots assertions, and the exact table in the routing contract. | Each route has the approved PHX page title, final templated title, description, canonical on `https://phxhomeloan.com`, `noindex=false`, and non-starter OG fallback. Production discovery and non-production `noindex,nofollow` behavior remain correct. Metadata contains no Stega. |
| `ROUTE-03` | Internal, fragment, contact, and external links preserve intended outcomes. | Link inventory plus browser interaction tests. | Page references normalize to V2 root-relative URLs; `#meet-jimmy` and `#contact` reach stable visible targets; `tel:`, `mailto:`, HTTPS, YouTube, Maps, Bookings, and EmbedSocial retain approved outcomes and safe new-tab attributes. |
| `ROUTE-04` | The seven accepted missing destinations remain intentionally missing. | Crawl the seven URLs and inspect their source affordances. | The five loan-card paths, `/blog/`, and the award-article path remain unchanged in content, return the V2 not-found response, and have no redirect, substitute, placeholder, or accidental page. This is the decision in [Decide the seven selected-content links beyond the four-route rebuild](https://github.com/ovsw/phxhomeloancom-2026/issues/13). |
| `LIVE-01` | Published, Draft Mode, cache, and invalidation paths remain distinct. | Browser tests in normal traffic and authenticated Presentation; tag-revalidation test. | Normal requests use `published` with Stega off; Draft Mode uses the cookie-selected draft/release perspective with Stega and Visual Editing; cached functions receive perspective/Stega as explicit inputs; `SanityLive` updates the right path without a client-side page refetch architecture. |

### 6. Presentation and editorial integrity

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `EDIT-01` | Every visible editable field has a correct source path. | Presentation overlay/path audit across all 17 identities. | Text, Portable Text, images, links, array containers/items, and referenced-document fields resolve to the owning document and field. A visible field has Stega or an explicit `data-sanity` path; visible text is not used as a substitute for image/link/array paths. |
| `EDIT-02` | Representative structural edits update live without corrupting identity. | Recorded smoke test editing and reverting one top-level block, one nested array item, one image, one link, one FAQ, and one team member. | Reorder/edit updates the preview at the correct `_key`/field path; referenced edits target the referenced document; draft changes do not leak into published traffic; no duplicate block or stale renderer appears. |
| `EDIT-03` | All failure and missing-data states remain editable and intelligible. | Draft fixtures for unresolved references and incomplete required content. | Studio validation identifies invalid content; frontend failure is deterministic and attributable to the block. It never silently renders the wrong slice or publishes an unresolved final reference. |

### 7. Visitor UX/UI fidelity

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `UX-01` | Stable first-party composition matches the visitor reference. | Side-by-side V1/V2 desktop and mobile packet from `BASE-02`, reviewed by route and block instance. | All 20 adapted instances have approved composition, hierarchy, typography role, imagery/art direction, spacing rhythm, surfaces, responsive state, and content. Differences are limited to already-decided V2 adaptations or an explicit signed exception; dynamic third-party pixels are excluded, not their container/label/outcome. |
| `UX-02` | Interactions and special states match the selected behavior. | Browser tests plus manual recording. | YouTube modal, Accordion, EmbedSocial container, Maps/Bookings links, mobile/desktop images, buttons, fragments, contact methods, and reduced-motion states work. The contact form remains intentionally non-submitting and exposes the stored unavailable message. |
| `UX-03` | `latest-articles` works with and without posts. | Query/renderer tests using a V2-owned fixture for zero posts and fixtures for one and more than six posts; staged route smoke. | Zero posts renders no article section/cards and throws no error. Nonzero results use only retained V2 `post`/`category` data, order newest first, cap at six, and never trigger content migration. No production data is deleted merely to exercise the zero case. |
| `UX-04` | Images, fonts, and motion preserve the intended result through V2 mechanisms. | DOM/network assertions and visual review. | Selected images use the V2 image interface with dimensions or `fill`, responsive `sizes`, crop/hotspot, LQIP where projected, and priority only above the fold. Archivo and Source Serif 4 load through `next/font`. Motion respects `prefers-reduced-motion`; desktop and mobile eager hero sources are not both fetched. |

### 8. Accessibility

WCAG conformance applies to each **full page and each responsive variation**, not only to the new block container. The target is [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/#conformance-reqs). Automated tools are supporting evidence only: Lighthouse excludes manual audits from its accessibility score ([Chrome documentation](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)).

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `A11Y-01` | Automated checks are clean. | V2-owned axe browser tests and five-run Lighthouse reports for all four routes at desktop and mobile. | Zero axe violations under the configured WCAG 2.2 A/AA rules; every `incomplete` result is manually resolved and recorded; Lighthouse accessibility is 100. These results do not alone claim conformance. |
| `A11Y-02` | Keyboard, focus, semantics, and status behavior pass manually. | Signed checklist and recordings for each unique interaction. | Logical heading/landmark structure; descriptive names/roles/values; visible focus; no keyboard trap; correct modal open/close/focus return; operable accordions, links, form controls, and mobile/header/footer disclosures; unavailable-form status is announced without stealing focus. |
| `A11Y-03` | Visual and responsive AA criteria pass. | Contrast measurements and manual tests at `320px`, `390px`, desktop, 200% text resize, and 400% browser zoom/reflow where applicable. | Text/non-text/focus contrast passes AA; content reflows without two-dimensional page scrolling except essential media; text is not clipped; targets, labels, error/status content, and sticky elements remain usable. |
| `A11Y-04` | Motion and third-party content do not interfere. | Reduced-motion browser test and iframe/media audit. | Nonessential motion pauses or is removed under `prefers-reduced-motion`; no flashing or autoplay audio; frames have meaningful titles; unsupported third-party content does not block access to the page or its first-party alternative/outcome. |

### 9. Performance and verification

Lighthouse scores vary with the environment, so runs use the fixed profile recorded by `BASE-03` and the median of five runs ([Chrome documentation](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)). Field Core Web Vitals are evaluated at the 75th percentile; “good” is LCP `<=2.5s`, INP `<=200ms`, and CLS `<=0.1` ([web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds)). INP is a field gate after sufficient traffic, not something a lab Lighthouse run can prove before launch.

| ID | Release gate | Objective evidence | Pass condition |
| --- | --- | --- | --- |
| `PERF-01` | Each page meets a reproducible lab floor. | Five fixed-profile Lighthouse CI production runs per route, using the median; reports retained as artifacts. | Performance score `>=0.90`, LCP `<=2500ms`, and CLS `<=0.10` for every route. Any approved environment change requires recapturing the baseline and all candidates in the same environment. |
| `PERF-02` | The V2 performance architecture is preserved. | Production build output, client-boundary inventory, route network traces, and source assertions from `ARCH-02`/`ARCH-04`. | Cache Components and Sanity tag invalidation remain enabled; server-first rendering remains; no page-wide client renderer exists; only named islands hydrate; third-party resources are route-scoped; no unexpected duplicate font/image/script download or layout-shift source is present. |
| `PERF-03` | Field health is monitored truthfully after launch. | CrUX/RUM report once the route has enough data for a representative 75th percentile. | LCP `<=2.5s`, INP `<=200ms`, and CLS `<=0.1`. Before sufficient data exists, report “insufficient field data”; do not substitute lab TBT or a Lighthouse score and call it field INP. This is a rollout-monitor gate, not an initial publication blocker. |
| `VERIFY-01` | Generated and static verification is clean. | Run `pnpm typegen`, verify no second-run generated diff, then `pnpm typecheck`, `pnpm lint`, `pnpm --dir frontend build`, and `pnpm --dir studio build`. Run the V2-owned contract/browser/accessibility/Lighthouse scripts added by the implementation program. | Every command exits 0. `studio/schema.json` and `frontend/sanity.types.ts` are regenerated, committed/current, and never hand-edited. No test is claimed merely because today's repository had no test runner; the implementation must add the required V2-owned verification surface. |

## Phase gates and ownership

| Phase | Gates required before advancing |
| --- | --- |
| Before implementation | `BASE-01` through `BASE-03` |
| Before schema/catalog merge | `PB-01` through `PB-05`, `ARCH-01` through `ARCH-04`, `VERIFY-01` static/generated portion |
| Before first dataset write | `DATA-01`, `DATA-02`, first explicit digest approval |
| Before draft review | `DATA-03` staging portion, `DATA-04`, `DATA-05`, `SCOPE-01` through `SCOPE-04` |
| Before publication approval | All `PB`, `ARCH`, `DATA`, `ROUTE`, `LIVE`, `EDIT`, `UX`, `A11Y`, `PERF-01`, `PERF-02`, and `VERIFY-01` release gates; fresh source/target preflight; second digest approval |
| Immediately after publication | Re-run route/content/reference/link checks, verify unrelated V2 content revisions, retain mutation receipt and `rollback-plan` |
| After sufficient real traffic | `PERF-03` |

The implementation program may split these gates across issues, but it may not weaken a pass condition or treat a later manual/editor gate as implicitly satisfied by an earlier build gate.

## Current repository gap

At the time of this decision the repository exposes `typegen`, `typecheck`, `lint`, frontend build, and Studio build commands, but no unit, browser, axe, visual-regression, or Lighthouse test surface. That is a V2 implementation-program gap. Filling it does not import V1 tooling; it creates the minimum V2-owned evidence harness needed to make the acceptance claims objective.

## Map impact

This resolves the acceptance decision without adding another investigation. It introduces no new fog: [Sequence the migration implementation program and handoff](https://github.com/ovsw/phxhomeloancom-2026/issues/10) can allocate the fixed gates to implementation issues, approval boundaries, rollout, and rollback work.
