# Plan: No-skeleton cacheComponents architecture (turbo-start-sanity PR #432 pattern, improved)
_Locked via grill — by Claude + Ovi_

## Goal

Eliminate every flash of skeleton/unloaded content on this site by making the published
site fully prerendered static HTML, while keeping full Sanity Presentation editing
(draft preview, visual editing overlays, perspective switcher) working. The pattern is
the one robotostudio landed in turbo-start-sanity PR #432: branch once on `draftMode()`
per route, render the published path straight from `"use cache"` fetchers with literal
`perspective: "published", stega: false` (no Suspense, no cookie reads), and let the
draft path block instead of suspend. Improvements over the starter: header/footer draft
preview is kept, and the revalidation action is fixed to next-sanity 13's official
semantics.

Stack: Next 16.3.0, next-sanity 13.3.1, `cacheComponents: true`. All data fetches are
already `"use cache"` via `sanityFetch` from `defineLive` (frontend/sanity/lib/live.ts is
the verbatim official setup). Pagination is path-based (`/blog/2/`, `/blog/category/x/2/`),
so no route depends on `searchParams`.

## Approach

0. **Spike first, then roll out**: convert ONE representative route (`[...slug]`) plus
   the layout, run `next build`, and confirm the route table shows it fully
   prerendered with real content and no fallback markers in its HTML. Only then apply
   the pattern to the remaining routes. (The starter's build demonstrably behaves this
   way, but we prove it in this repo before committing to the global rewrite.)

1. **Config** (frontend/next.config.mjs): remove `partialPrefetching: true`. With fully
   prerendered pages, default `<Link>` prefetching downloads whole pages — instant
   navigation with zero streaming gap. `cacheLife: { default: sanity }` is already set;
   keep it.

2. **Layout** (frontend/app/(main)/layout.tsx): replace the Suspense-wrapped dual tree.
   Branch on `await draftMode()`: published → render `CachedHeader`/`CachedFooter`
   directly (literal `perspective="published"`, `stega={false}`), no Suspense boundary;
   draft → render the Dynamic header/footer (cookie-resolved perspective), also without
   skeleton fallbacks. Delete `HeaderFallback`/`FooterFallback`. `SanityLive` (and
   draft-only `VisualEditing`/`DisableDraftMode`) stay in the layout; placement details
   are implementation-level, constrained by "must not reintroduce a fallback into the
   published shell". Note: layout.tsx currently carries an uncommitted interim edit
   (real-content fallbacks) — this step supersedes it.

3. **Every route** (home, `[...slug]`, blog index, `blog/[page]`,
   `blog/category/[slug]`, `blog/category/[slug]/[page]`): same restructure. Top of the
   route: `const { isEnabled } = await draftMode()`. Draft → existing Dynamic component,
   no Suspense (navigation blocks; previous page stays on screen). Published → await the
   cached fetcher directly with published literals, `notFound()` before any HTML is sent
   (hard 404 restored), render the content component. Delete all `PageFallback` skeleton
   components. Since no route reads `searchParams`, no Suspense boundary should survive
   in production; if implementation turns up a genuine exception, its fallback must
   render real cached published content (starter's blog-shell trick), never a skeleton.

   Two sub-requirements surfaced in review:
   - **Static params coverage**: every paginated route must have `generateStaticParams`
     covering all currently existing pages (audit found `blog/[page]` may lack one).
     Paths NOT known at build time (brand-new posts, future pagination pages) block on
     the server on first visit, then get cached — a deliberate decision. Mechanism:
     `export const instant = false` (documented in Next 16.3's instant-navigation
     guide) on each param-bearing segment: `[...slug]`, `blog/[page]`,
     `blog/category/[slug]`, `blog/category/[slug]/[page]`. Spike/build must confirm
     the known paths of those segments remain prerendered while an unlisted path
     blocks and resolves correctly. No skeleton boundary is added for them.
   - **Metadata goes published-only**: every `generateMetadata` currently calls
     `getDynamicFetchOptions()` (draftMode + potentially cookies), which risks making
     otherwise-static routes request-bound. Change all `generateMetadata` to literal
     `perspective: "published", stega: false` via `sanityFetchMetadata`. Draft sessions
     get published metadata — irrelevant to editing, invisible to visitors.

4. **Revalidation** (frontend/app/actions/revalidate.ts): delete the custom action and
   the `action` prop on `SanityLive`, falling back to next-sanity 13's built-in
   `revalidateSyncTagsAction`. The custom action has the semantics inverted (calls
   `revalidateTag` in draft mode where cache is bypassed, `updateTag` in production).
   Official default = stale-while-revalidate for visitors, `router.refresh()` for draft
   sessions — the freshness semantics Ovi chose.

5. **Fetch layer — separate, last, independently revertable**: consolidating the ~14
   per-query `"use cache"` wrappers into one generic cached wrapper (official
   sanity-live-cache-components skill pattern) is orthogonal to skeleton removal, so it
   lands as its own final step/commit after the architecture is verified — not mixed
   into the route rewrite. Before it, prove sync-tag invalidation empirically as part
   of step 4's verification (publish in Studio → public page updates without rebuild,
   checked in a separate non-draft browser session). Installed next-sanity 13.3.1
   already calls `cacheTag(...tags)` inside the active cache boundary, so no
   re-registration is added unless that empirical check fails (turbo-start-sanity
   needed it on older 13.x — their PRs #396/#406/#421).

6. **Prefetch policy (explicit inventory)**: dropping partialPrefetching makes every
   viewport `<Link>` to a static route eligible for full-page prefetch. Policy:
   header nav, in-content links, blog cards, and pagination keep default prefetch
   (that fan-out IS the chosen UX — Next's scheduler already queues, prioritizes, and
   discards off-screen links); footer link lists get `prefetch={false}`. The
   implementation inventories dense link collections and applies exactly this policy,
   documenting any judgment call that deviates.

7. **Verification** (acceptance criteria):
   - `next build`: all known slugs prerender; the build's route table shows no
     unexpected dynamic routes.
   - A script enumerates every known route from the same complete slug queries that
     feed `generateStaticParams` (the sitemap filters out noindex content, so it
     under-counts), plus the pagination/category index math, issues real GET
     requests against the production server, and asserts on the RESPONSE bodies: zero layout/page
     fallback markers (`aria-busy` loaders, the fallback components'
     `animate-pulse` classes) and presence of real footer/header markup.
     Block-level component skeletons (video posters etc.) are unrelated and stay.
     `.next` build artifacts are never inspected directly (repo rule).
   - Same GET pass asserts status codes: 200 on known routes, 404 on unknown ones —
     GET, not HEAD.
   - Negative-caching check: request a not-yet-existing slug (cached 404), then
     publish a document with that slug, and confirm the URL reaches 200 with content
     without a rebuild. If the cached miss doesn't invalidate, the fix is scoped
     before merging (this is exactly the silent failure mode we refuse to ship).
     The fixture uses a generated unique ID and slug in the development dataset,
     aborting if either already exists; both draft and published variants are
     deleted afterwards (even on test failure), their absence verified, and the
     fixture URL confirmed to return 404 again without a rebuild — which doubles
     as the unpublish-propagation check.
   - Real browser, one route per family (home, page, post, blog index, paginated
     blog, category, paginated category): navigate forward and back — no flash of
     fallback content.
   - Presentation (draft browser session): editing works with overlays, perspective
     switcher toggles published/drafts, header/footer edits preview.
   - Publish propagation: from a separate NON-draft browser session, publish in
     Studio → public page updates without a rebuild (proves tag invalidation,
     step 5's precondition).

## Key decisions & tradeoffs

- **Drop `partialPrefetching`** (Ovi): full-page prefetch on viewport links. Trades
  bandwidth for instant navigation; mitigated by `prefetch={false}` on footer lists.
- **Keep header/footer draft preview** (Ovi): diverges from the starter (published-only
  nav). Costs a small draft-only branch; public site unaffected.
- **Official SWR revalidation** (Ovi): a just-published change may take one request to
  appear for a visitor. Chosen over read-your-writes.
- **Draft navigation blocks, no spinner** (Ovi): Presentation keeps the previous page
  on screen during navigation; no draft-only loading UI.
- **Hard 404s** (Ovi): `notFound()` resolves before streaming; no soft-404 shells.
- **Content Releases are irrelevant** (Ovi: no client uses them), but this pattern
  keeps the Presentation perspective switcher working anyway (draft path still resolves
  the `sanity-preview-perspective` cookie outside the cache boundary).
- **No `loading.tsx` variant, no draftMode-inside-use-cache collapse**: both were
  considered and rejected (the former reintroduces fallback flashes; the latter breaks
  the perspective switcher for no additional benefit over this pattern).

## Risks / open questions

- **Core prerender assumption** (step 0 exists to retire this): branching on
  `draftMode()` at the route top must not make the published branch request-bound.
  Evidence says it doesn't (the starter ships it; Next 16.3 docs treat `draftMode` as
  cache-compatible), but the spike proves it in this repo before the global rewrite.
- **Sync-tag invalidation on 13.3.1** (step 5): if tags don't reach the cache entries,
  publishes silently stop propagating. The plan proves it empirically before shipping.
- **Hosting semantics**: cacheComponents ISR + tag invalidation assumes a host with a
  persistent shared cache (Vercel or equivalent). Verify against the actual deploy
  target before merging.
- **Brand-new slugs** (published after the last build) render on first visit
  (blocking, standard ISR); acceptable by decision, but confirm on-demand rendering
  of unlisted params behaves under cacheComponents in the spike.
- **`<SanityLive>` in the static shell**: 13.1.7+ is built to coexist with prerendered
  HTML; confirm no bailout markers appear in built output.

## Out of scope

- Dark-mode/surface-contrast work (separately deferred).
- Content Release preview support.
- Any redesign of blocks, queries, or the Sanity schema.
- The `wizard`-style migration of other projects to this pattern.
