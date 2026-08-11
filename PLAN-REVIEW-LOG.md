# Plan Review Log: Make blog categories real, crawlable pages (branch 1 of 2)

Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

Decisions settled during the grill:

- Scope split into two branches. Branch 1 (this one) = routing + schema only.
  Branch 2 = renaming categories, reassigning posts, adding tags. User pushed back
  on the original single-branch plan and was right: build the pages first so the
  taxonomy imbalance becomes visible before deciding the final buckets.
- `post.categories[]` → `post.category`, single required reference (user overruled
  Claude's recommendation to keep the array with `max(1)` validation).
- URL shape `/blog/category/[slug]/` with pagination at `.../[page]/`. User
  questioned this given posts resolve from the root; investigation showed the root
  namespace already needs a collision guard, which strengthened rather than weakened
  the recommendation.
- Hand-authored slugs, two hand-tuned (`loan-types`, `mortgage-requirements`).
- Single `description` text field for archive intro copy; reuse the shared `meta`
  object for SEO overrides.
- Zero-post categories excluded from `generateStaticParams` and the sitemap.
- Single-shot migration via a committed script; dev dataset, backup taken by user.

## Round 1 — Codex

- Blocker: [proxy.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/frontend/proxy.ts:90) rejects every `/blog/category/**` request before Next routing. Fix: exempt category routes from the numeric blog-pagination guard and add proxy tests.

- [blog-pagination.tsx](/Users/ovs/Work/learn/phxhomeloancom-2026/frontend/components/blog-pagination.tsx:21) hardcodes global `/blog/` URLs, so category pagination navigates to the wrong archive. Fix: accept a base path or URL builder and add category-specific URL/canonical helpers.

- The Latest Articles card is already one large `<Link>`, so the planned category `<Link>` creates invalid nested anchors. Fix: restructure it as an article with separate post and category links.

- RegularPostCard’s full-card overlay can cover the new category link. Fix: give the category link an explicit higher stacking layer or remove the overlay-link pattern.

- Categories are already selectable in navigation and footer, but their href projections produce `/<slug>/`, not `/blog/category/<slug>/`. Fix: add category handling to every shared, navigation, and footer internal-reference resolver.

- Category documents are absent from Studio Presentation locations, main-document resolution, and supported document types. Fix: register `/blog/category/<slug>/` throughout Presentation and add tests.

- The route plan has no category-specific metadata generation. Fix: define metadata for both routes with category fallbacks, page-number titles, correct canonicals, Open Graph data, `meta.noindex`, and Stega disabled.

- Excluding empty categories from static params and the sitemap does not prevent direct URLs from being indexed. Fix: return 404 for empty archives or automatically emit `noindex, follow`.

- The plan calls descriptions essential for avoiding thin pages but backfills none and does not require them. Fix: backfill reviewed descriptions or withhold indexing until a description exists.

- The migration lists six required category slugs but only defines post mutations. Fix: include revision-guarded category slug patches and verify all six stored values.

- Merely reporting zero-, multiple-, or invalid-category posts still allows destructive data loss. Fix: abort before all writes unless every legacy post version has exactly one valid category reference.

- Migration handling for drafts, reruns, existing `category` values, dangling references, and array-only `_key` values is undefined. Fix: classify raw draft/published documents as safe, already migrated, or fatal, and construct clean `{_type, _ref}` references.

- Backup-and-rerun is weaker than established repo migrations. Fix: require default dry-run, explicit `--apply`, exact project/dataset guards, revision-guarded atomic writes, and a post-write parity audit.

- The category schema defines only `content` and `seo`, while leaving `slug` potentially assigned to nonexistent `settings`. Fix: choose `content` explicitly or define a `settings` group.

- The proposed slug regex accepts purely numeric values despite claiming otherwise. Fix: add a separate numeric-only rejection and validator tests.

- The uniqueness-validator requirements omit draft/published self-exclusion and draft collisions. Fix: follow `unique-root-slug.ts`’s paired-ID exclusion using raw perspective and test all collision cases.

- `publishedPostFilter` and `blogPostOrder` are private constants, so the planned new query cannot reuse them. Fix: export them or move the shared listing contract into a dedicated query module.

- `Rule.required()` is an error, not a warning as the plan states. Fix: correct the assumption and require every migrated post version to remain publishable.

- No verification section covers these changes, and [blog-index.test.mjs](/Users/ovs/Work/learn/phxhomeloancom-2026/frontend/lib/blog-index.test.mjs:54) explicitly asserts the old `categories[]` projection. Fix: specify validator/migration, proxy, href, pagination, metadata, sitemap, Presentation, TypeGen, typecheck, lint, build, and focused runtime checks.

VERDICT: REVISE
### Claude's response — Round 1

**Verified before acting.** Read `proxy.ts`, `blog-pagination.tsx`,
`lib/blog-index.ts`, `internal-href.ts`, `navigation.ts`, `footer.ts`,
`presentation/resolve.ts`, `presentation/routes.ts`, `blog-index.test.mjs`.

**Accepted (plan revised):**

- **Proxy blocker — confirmed and severe.** `proxy.ts:93` rejects any `/blog/` path
  with >2 segments. Every category URL would have 404'd before Next routing. Added
  as new step 0, ahead of everything else.
- **Nav/footer href resolvers — confirmed, and worse than stated.** Both schemas
  already accept `category` references and all four resolvers fall through to
  `"/" + slug + "/"`. The bug is dormant only because categories have no slug;
  adding one activates it. New section 4b.
- **`getBlogPaginationUrl` hardcodes `/blog/`** — confirmed at `lib/blog-index.ts:46`.
  Parameterised with a base path.
- **Nested anchors** — both card variants wrap the whole card in a link. Restructure
  to sibling links with explicit stacking.
- **Presentation wiring absent** — confirmed. Added 6b, including the point that the
  main-document filter must gain a separate branch rather than be widened.
- **Migration hardening** — dry-run default, `--apply`, dataset guard, abort-on-fatal
  (not report-and-continue), clean `{_type,_ref}` construction, revision guards,
  parity audit, category slug patches, draft handling.
- **`publishedPostFilter`/`blogPostOrder` are private** — confirmed; must be exported.
- **`Rule.required()` is an error, not a warning** — my plan said warning. Corrected,
  and it strengthens the abort-on-zero-category rule.
- **Slug regex accepts numeric-only** — correct, `2` passes the kebab pattern. Added
  a separate rejection.
- **Validator needs draft/published self-exclusion** — correct; mirrors
  `unique-root-slug.ts`.
- **`settings` group doesn't exist on category** — correct, moved slug to `content`.
- **Metadata generation missing** — correct, added.
- **No verification section, and `blog-index.test.mjs` asserts the old projection** —
  correct. Added section 8; tests updated, not deleted.
- **Empty archives need `noindex`** — accepted the `noindex, follow` half.

**Rejected:**

- **"Return 404 for empty archives."** Rejected the 404 option, took `noindex, follow`.
  A category that exists but has no posts is not a missing resource; 404 would also
  break Presentation preview for a newly created category before its first post.
- **"Withhold indexing until a description exists" as the only remedy.** Adopted, but
  paired with actually backfilling descriptions for the four non-empty categories —
  Codex's framing would have left the pages permanently `noindex` by default, which
  defeats the branch's purpose.
- **Implicit scope creep toward branch 2.** Several findings gesture at the taxonomy
  itself (empty categories, thin hubs). Out of scope here by explicit user decision;
  both empty categories are expected to disappear in branch 2.

## Round 2 — Codex

Most prior blockers are addressed. Material gaps remain:

- Presentation still opens categories at `/<slug>/`: adding `category` to [routes.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/presentation/routes.ts:1) makes `getPresentationPath()` use the root-path fallback. Fix: add an explicit category path branch and test the document action, location, and main-document resolver.

- Footer has its own href resolver outside the four shared helpers and will still generate `/<slug>/`. Fix: explicitly update [footer.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/frontend/sanity/queries/footer.ts:3) or refactor it onto the shared category-aware resolver.

- Unknown category behavior remains undefined; a structurally valid nonexistent slug can reach rendering and metadata. Fix: require both routes and `generateMetadata` to call `notFound()` when `CATEGORY_QUERY` returns null, with a focused test.

- The migration is revision-guarded but not explicitly atomic, so one revision failure can leave a partially converted dataset. Fix: commit all post and category patches in one transaction with synchronous visibility before auditing.

- Migration classification still misses documents containing both fields, malformed existing `category` values, wrong-type targets, and conflicting existing slugs. Fix: classify every possible field shape, validate resolved targets, preserve matching values, and abort on conflicts before writing.

- Category slug patches are not bound to exact document IDs or draft/published pairs. Fix: freeze the ID-to-slug mapping, audit raw document pairs, and patch every existing version or abort.

- Four descriptions are promised without approved copy, source, migration mutations, or verification. Fix: provide an exact reviewed ID-to-description mapping or keep those archives out of indexing until editors author them.

- Runtime robots and sitemap eligibility disagree: descriptionless categories emit `noindex` but are still sitemap-eligible. Fix: centralize one eligibility rule or exclude blank descriptions from static params and the sitemap.

- Category sitemap timestamps would still use the category’s `_updatedAt`, which does not change when posts are published or reassigned. Fix: derive `lastModified` from the newest category or included-post update, or omit it.

- Category proxy caching is underspecified; copying the current scalar cache can reuse one category’s count for another or create unbounded slug entries. Fix: use bounded, expiring caches and in-flight requests keyed by normalized slug, with cross-slug tests.

- Category pagination must use the full post count, not the global archive’s `postCount - 1` featured-post adjustment. Fix: specify the calculation and test the 12/13-post boundary.

- Automatic redirects explicitly reject `category`, and redirect validation only recognizes page/post destinations. Fix: extend both systems with `/blog/category/` path projection now, or make tested manual redirect creation a locked branch-two requirement.

- `generateStaticParams` is ambiguous across two routes: `[slug]` needs `{slug}`, while `[slug]/[page]` needs `{slug,page}` and counts. Fix: define separate generators with pages `2..totalPages`, or explicitly test on-demand rendering for the child route.

- Category H1 and description have no explicit `data-sanity` contract despite adding Presentation. Fix: require category document attributes for both fields and verify click-to-edit behavior.

- Non-production robots protection is only implied; a new helper that merely honors `meta.noindex` could index staging. Fix: require the same environment-wide `noindex, nofollow` guard used by existing metadata helpers.

- The destructive migration still lacks unit tests for its classifier and mutation builder. Fix: test dry-run, mixed states, drafts, dangling/wrong-type refs, slug conflicts, revision guards, and reruns.

VERDICT: REVISE
### Claude's response — Round 2

**Verified before acting.** Read `presentation/routes.ts`, `queries/footer.ts`,
`proxy.ts` cache internals, `functions/auto-redirect/model.ts`,
`validation/redirect-rules.ts`.

**Accepted (plan revised):**

- **`getPresentationPath` root fallback — confirmed.** Adding `"category"` to the
  type set alone opens categories at `/<slug>/`; the function falls through to
  `resolveContentPath`. Needs an explicit branch like `blogIndex` has.
- **Footer has its own resolver — confirmed** at `queries/footer.ts:3`, with an
  inline post branch outside the four shared helpers. My 4b missed it. Also added a
  general instruction to grep for other inline href projections.
- **`postCount - 1` must not be copied — confirmed** at `proxy.ts:104`. That is the
  global archive's featured-post adjustment; category archives have no featured
  post. Silent off-by-one at exact page multiples.
- **Proxy cache is a scalar — confirmed** (`proxy.ts:19`). A per-category count
  needs a slug-keyed, bounded, TTL'd map with per-slug in-flight dedup.
- **Redirects genuinely do not cover categories — confirmed and worse than stated.**
  `ROUTED_DOCUMENT_TYPES = ["page","post"]` and `model.test.mjs:159` explicitly
  asserts category slug changes are *skipped*. Recorded as a locked mandatory
  requirement for branch 2 rather than expanding branch 1's scope.
- **Unknown slug must `notFound()` from both route and `generateMetadata`** — real
  gap; metadata runs independently and would throw on null.
- **Two separate `generateStaticParams`** — correct, `[slug]` and `[slug]/[page]`
  need different shapes.
- **Migration atomicity** — single transaction. With `category` required, a partial
  conversion leaves some posts unpublishable.
- **Migration classifier gaps** — both-fields-present, wrong-type targets, malformed
  values. Added, including "both present and agreeing" as non-fatal.
- **Category slug patches bound to document IDs, not titles** — correct, titles
  change in branch 2.
- **Single eligibility rule** — accepted. Sitemap keyed on post count while robots
  keyed on description would emit sitemap entries for `noindex` pages.
- **Sitemap `lastModified`** — correct that category `_updatedAt` is stale w.r.t.
  post changes.
- **Staging noindex guard** — accepted as a check against existing metadata helpers.
- **Stega attributes on H1/description** — correct, follows from adding Presentation.
- **Migration classifier unit tests** — accepted; it is pure logic and the one
  destructive step.

**Rejected / adjusted:**

- **"Provide an exact reviewed ID-to-description mapping."** Rejected as stated. I
  will not invent marketing copy for a real lender. Adjusted: descriptions are a
  named deliverable of this branch authored by the user, and the eligibility rule
  keeps description-less archives out of the index until copy lands — so the
  failure mode is "not yet indexed," not "thin page indexed."
- **Scope pressure toward branch 2.** Redirect support for categories is recorded as
  a locked branch-2 requirement, not pulled into branch 1.

## Round 3 — Codex

Most prior findings are addressed. Remaining material issues:

- Static generation is incorrectly coupled to SEO eligibility. With Cache Components, `generateStaticParams()` must return at least one parameter; valid periods with no eligible categories would fail the build. Fix: generate route params independently of index eligibility or return a safe placeholder handled by `notFound()`. This does not require descriptions to be authored yet. [Next.js documentation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

- `CATEGORY_SLUGS_QUERY` returns only slugs, but `[slug]/[page]` needs each category’s post count to produce pages `2..totalPages`. Fix: define a static-params query returning `{slug, publishedPostCount}` and build separate parent and child parameter arrays.

- The metadata contract cannot apply the promised zero-post rule because `CATEGORY_QUERY` includes description/meta but not the published post count. Fix: project `publishedPostCount` or a shared `isIndexable` value and use it in the category metadata helper.

- The migration parity audit compares every result with former `categories[0]`, which does not exist for already-migrated documents. Fix: record an `expectedCategoryRef` from whichever valid field supplied it during classification and audit against that snapshot.

- Slug conflict checks cover mapped targets but not unrelated or draft-only category documents; client mutations bypass Studio validators. Fix: preflight every raw category version and assert each proposed slug is unique outside its mapped published/draft pair.

- A bounded per-slug proxy cache still lets arbitrary slugs generate repeated Sanity queries and can temporarily reject newly valid pages using stale counts. Fix: cache one TTL-based snapshot of all known category slugs/counts, or document and test explicit stale/error behavior.

- Sitemap `lastModified = max(category, current posts)` misses removals and reassignments because the removed post is no longer available to the query. Fix: use the plan’s stated fallback and omit category `lastModified` unless a persistent archive-update timestamp exists.

- The plan repeatedly names `proxy.test.mjs`, but the repository test is [proxy.test.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/frontend/proxy.test.ts). Fix: correct the plan so the Vitest test is extended rather than creating a second test file.

VERDICT: REVISE
### Claude's response — Round 3

**Verified before acting.** Confirmed `cacheComponents: true` in
`frontend/next.config.mjs:16` and that the proxy test is `frontend/proxy.test.ts`
(Vitest), not `.mjs`.

**Accepted — all eight findings:**

- **`generateStaticParams` must not be gated on SEO eligibility — genuine
  build-breaker.** With `cacheComponents: true` the generator must return ≥1 entry;
  since the eligibility rule requires a description and no descriptions exist yet,
  the array would start empty and fail the build. Decoupled: prerender every valid
  category, decide indexability at render time and in the sitemap. This also
  resolves the ordering problem where the branch could not build until copy landed.
- **Static-params query needs `{slug, publishedPostCount}`** — the child route
  cannot expand `2..totalPages` from slugs alone.
- **`CATEGORY_QUERY` needs the post count** for the metadata zero-post rule.
- **Parity audit must compare against a recorded `expectedCategoryRef`** — comparing
  everything to `categories[0]` spuriously fails already-migrated documents.
- **Slug preflight must cover all raw category versions**, not just mapped targets;
  script mutations bypass Studio validators entirely.
- **Proxy cache** — switched from a per-slug map to one TTL'd snapshot of all
  category slugs+counts: bounded by construction, no network call for unknown slugs.
  Added explicit stale-path and fail-open behaviour.
- **Sitemap `lastModified`** — Codex is right that my `max(category, posts)` fix was
  still wrong: a post *removed* from a category takes its timestamp out of the
  result set, so the value can move backwards. Omitting the field entirely.
- **`proxy.test.mjs` → `proxy.test.ts`** — my error; would have produced a duplicate
  test file.

**Rejected:** nothing this round.

## Round 4 — Codex

The eight round-three findings are addressed, but new material issues remain:

- Static generation still contradicts itself: lines 298–301 include every valid category, while lines 311–319 and the key decisions section still exclude zero-post categories using the obsolete `CATEGORY_SLUGS_QUERY`. Fix: remove the stale text and consistently use `CATEGORY_STATIC_PARAMS_QUERY` for every valid category.

- The child `[slug]/[page]` generator can still return `[]` when no category has more than 12 posts; Cache Components rejects an empty static-params result. Fix: return a safe sentinel parameter handled by `notFound()` and test a dataset with no paginated categories. [Next.js documentation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

- The proxy snapshot design no longer explicitly preserves the existing single-flight promise, so concurrent cold or expired requests can stampede Sanity. Fix: coalesce refreshes behind one in-flight promise and test both concurrent misses and rejected refreshes.

- The proxy snapshot count is not explicitly tied to the exact published-post filter used by category routes. Fix: reuse the shared filter and add a proxy-versus-route count parity test.

- Migration patches only the six mapped category pairs but anticipates unmapped or draft-only categories; those could remain without the newly required slug. Fix: require every raw category version to be mapped or already have a valid unique slug, otherwise abort before writing.

- Category card hrefs can contain Stega characters in Presentation because the plan does not require cleaning `category.slug.current`. Fix: apply `stegaClean()` before building category URLs in both card variants and test draft-mode navigation.

- `documentDataAttribute` is currently private to `blog-card.tsx`, so the category route cannot reuse it directly as planned. Fix: export it or move it into a shared Sanity attribute helper.

VERDICT: REVISE
### Claude's response — Round 4

**Verified before acting.** Confirmed `documentDataAttribute` is a module-private
`function` at `blog-card.tsx:68`, and that the file already `stegaClean`s slugs at
lines 91 and 122 before building hrefs.

**Accepted — all seven findings:**

- **Self-contradiction in the plan — my error.** My round-3 edit decoupled static
  generation from eligibility in the routing section but left the old
  "`generateStaticParams` uses `CATEGORY_SLUGS_QUERY` so zero-post categories are
  not statically generated" text and the matching key-decisions bullet in place.
  Both rewritten to match the decoupled design.
- **Child generator can also return `[]`** — and this is not hypothetical: it is
  exactly the state after branch 2, when the largest bucket is ~12 posts and no
  category paginates. Sentinel param + `notFound()`, with a test.
- **Single-flight promise must be preserved** — the existing scalar cache already
  coalesces via `blogPostCountPromise`; my snapshot rewrite dropped that detail.
  Restored, including `finally` cleanup so a rejected refresh cannot wedge it.
- **Proxy count must use the shared `publishedPostFilter`** — a divergent count
  means the proxy 404s pages the route would render.
- **Every raw category version needs a valid slug** — `slug` is required, so an
  unmapped draft-only category would be left unpublishable. Abort with IDs printed.
- **Stega in category hrefs** — the file cleans every other slug before building a
  URL; the category href would have been the lone exception, breaking navigation in
  Presentation.
- **`documentDataAttribute` is private** — must be exported or lifted to a shared
  helper rather than duplicated.

**Rejected:** nothing this round.

## Round 5 — Codex

All seven round-four findings are addressed. No remaining issue is likely to break implementation or produce materially wrong behavior.

VERDICT: APPROVED
---

**Converged after 5 rounds.** No code written during either act.

## Act 3 — Build

### Round 1 — Codex build

Builder: `gpt-5.6-sol`, `codex exec --yolo`, single round, no fix rounds needed.
31 files touched (22 modified, 11 new). Codex's report claimed a clean
`typecheck && lint && test`, a successful `next build` (97 static pages), and a
clean migration dry-run.

### Claude's verdict — verified independently

**Diff read in full. Proof re-run by Claude, not trusted from the report.**

- `pnpm typecheck` — clean.
- `pnpm lint` — clean.
- `pnpm test` — 104 node tests pass, 0 fail, plus the Vitest suite.

Spot-checked the findings most likely to be implemented wrong:

- **Proxy (the round-1 blocker)** — category branch sits before the 2-segment
  check; uses a TTL snapshot with single-flight + `finally` cleanup; fails open on
  query error; correctly uses the raw `postCount` without the global archive's
  `postCount - 1` featured-post adjustment.
- **Non-empty `generateStaticParams`** — both parent and child use a
  `__missing-category__` sentinel, guarding the `cacheComponents: true` build
  failure.
- **Href resolvers** — all four shared helpers plus the separate inline resolver in
  `queries/footer.ts` got the category branch, placed before the fallthrough.
- **Stega** — category slugs are `stegaClean`'d in both card variants.

**One out-of-scope change investigated:** Codex modified
`frontend/components/header/header.test.tsx` to drop a theme-toggle assertion.
Verified by stashing the build and running that suite against the pre-build tree —
**the test was already failing on `main`**, fallout from `ac7b90f` (light-theme-only
ship), not from this work. Legitimate fix of a pre-existing break; flagged to the
user rather than silently kept.

**One false alarm by Claude:** the dry-run showed an identical `ifRevisionId`
across all four category patches, which looked like a builder bug. Querying the
live dataset disproved it — all six categories genuinely share
`_rev: fecMuKShDC3aWIsRKXWFok` because they were created in one transaction.
Codex read them correctly.

**Discovery the plan got wrong:** PLAN.md asserted categories had no slug. True of
the *schema*, false of the *data* — four categories already carried slugs with
leading slashes (`/buyer-education`, `/types-of-loans`, `/personal-finances`,
`/requirements`). The migration normalised them. Harmless here, but the plan's
premise was inaccurate.

### Migration — applied by Claude

Backup first: `backups/development-pre-category-taxonomy-20260811.tar.gz`
(557 MB, 138 docs / 188 assets, verified to contain 58 posts + 6 categories).

Pre-flight audit against live data: 0 draft categories, 0 posts with multiple
categories, 0 posts with none — matching the dry-run's "58 migratable, 0 fatal".

Applied. Script self-report: 58 posts, 6 categories, `legacyArraysRemaining: 0`,
`categoryReferenceParity: true`, `categorySlugParity: true`.

**Independently re-verified via GROQ** (not trusting the script's self-report):
58/58 posts have `category`, 0 legacy arrays, 0 dangling refs, all six slugs clean,
and post distribution unchanged (44 / 11 / 2 / 1 / 0 / 0).

### Runtime verification (dev server)

| Route | Result |
|---|---|
| `/blog/category/loan-types/` | 200, H1 + cards render |
| `/blog/category/buyer-education/4/` | 200 (page 4 of 44 posts) |
| `/blog/category/buyer-education/9/` | 404 (out of range) |
| `/blog/category/made-up/` | not-found UI + noindex |
| `/blog/category/realtor-information/` | empty state + `noindex, follow` |
| `/blog/`, `/blog/2/` | 200 — existing routes unbroken |

Nav category link now renders `/blog/category/buyer-education/` — the live latent
bug (previously `/buyer-education/`) is fixed. Sitemap contains 0 category URLs,
which is *correct*: no category has a description, so the eligibility rule excludes
them.
