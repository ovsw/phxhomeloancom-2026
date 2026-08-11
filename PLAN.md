# Plan: Make blog categories real, crawlable pages (branch 1 of 2)

_Locked via grill — by Claude + ovs_

## Goal

Blog categories currently exist as Sanity documents but do nothing: they render as
plain text labels on post cards, have no slug, no routes, and no presence in the
sitemap. This branch turns them into real, crawlable archive pages at
`/blog/category/[slug]/`, and changes `post.categories[]` (array) into
`post.category` (single required reference).

This branch deliberately does **not** rename categories or reassign posts. The
existing six categories are badly balanced (Buyer Education holds 44 of 58 posts;
two categories hold zero), but fixing that is editorial work deferred to branch 2.
Shipping the routing first means branch 2 is a pure content decision against
working infrastructure, and lets us see real rendered hubs before choosing the
final taxonomy.

## Approach

### 0. Proxy — unblock the route (BLOCKER, do this first)

`frontend/proxy.ts:93` returns `notFoundResponse()` for any `/blog/` path with more
than two segments. `/blog/category/loan-types/` is three. **Every category URL 404s
at the proxy before Next.js routing runs**, so without this step the entire branch
ships dead routes.

Restructure the `/blog/` guard to branch on the second segment:

- `["blog"]` → pass through (index).
- `["blog", <numeric>]` → existing pagination guard, unchanged.
- `["blog", "category", <slug>]` → pass through to the archive route.
- `["blog", "category", <slug>, <numeric>]` → category pagination guard; validate
  the page number against that category's post count, mirroring the existing
  out-of-range behaviour.
- Anything else → `notFoundResponse()` as today.

**Do not copy the `postCount - 1` adjustment** at `proxy.ts:104`. That subtraction
exists because the global archive promotes one featured post out of the regular
grid. Category archives have no featured post, so their pagination uses the full
category post count. Test the 12/13-post boundary explicitly — this is a silent
off-by-one that only appears at exact page multiples.

The existing guard caches a single scalar (`blogPostCountCache` +
`blogPostCountPromise`, `proxy.ts:19`). A per-slug map is the obvious extension but
lets arbitrary URL slugs drive repeated Sanity queries.

**Prefer one TTL'd snapshot of all category slugs with their counts** — a single
query, fixed size, no unbounded growth, and an unknown slug is answered from the
snapshot without a network call. Accept the tradeoff: a category created mid-TTL is
briefly unknown, so define and test the stale path explicitly (a page number valid
under a newer count must not 404 permanently — it recovers on TTL expiry). On query
failure, fail open (`NextResponse.next()`) rather than 404ing real pages.

**Keep the existing single-flight pattern.** `proxy.ts:24` guards refreshes behind
`blogPostCountPromise` so concurrent cold requests issue one query, not N. The
snapshot must do the same — coalesce refreshes behind one in-flight promise and
clear it in `finally` so a rejected refresh does not wedge the cache permanently.
Test concurrent cold misses and a rejected refresh.

**Count with the same filter the routes use.** The snapshot's per-category count
must reuse the shared `publishedPostFilter` (exported per section 4), not a
hand-rolled variant. If the proxy counts differently from the route, the proxy
404s pages the route would happily render, or vice versa. Add a parity test
asserting proxy and route counts agree for the same category.

Extend the existing **`frontend/proxy.test.ts`** (Vitest — note `.ts`, not `.mjs`;
do not create a second test file) to cover each shape above, including out-of-range
category pages, the draft-mode bypass, cross-slug isolation, and the stale-snapshot
path.

### 1. Studio — category schema

Model `schemas/documents/category.ts` on `schemas/documents/blog-index.ts`, which
has the same shape minus the page builder.

- Add `groups: [{name: "content"}, {name: "seo"}]`.
- Keep `title` (required), keep `orderRankField` (already wired to the orderable
  list in `structure.ts:68`; nothing on the frontend reads it yet, but it is the
  natural sort key for any future category nav).
- Add `slug` — type `slug`, required, `group: "content"` (the schema defines only
  `content` and `seo`; there is no `settings` group on this type).
  - **Hand-authored, not auto-generated from title.** Categories are added rarely
    and the URLs are permanent; `options.source` is intentionally omitted so the
    editor types the slug deliberately.
  - Uniqueness must be scoped to **categories only** — do NOT reuse
    `validation/unique-root-slug.ts`. That validator guards the root namespace
    (`page` + `post`) because those resolve at `/[...slug]`. Categories live under
    `/blog/category/`, a separate namespace, so a category slugged `about` is
    harmless. Write a new `uniqueCategorySlug` validator querying only
    `_type == "category"`. It must still replicate `unique-root-slug.ts`'s
    published/draft self-exclusion (`$publishedId` / `$draftId` pair) so a document
    does not collide with its own draft, and query with the `raw` perspective so
    draft-only collisions are caught.
  - Reject slugs that would produce degenerate URLs: enforce
    `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (lowercase kebab, no leading/trailing slashes)
    **plus a separate purely-numeric rejection** — the kebab pattern alone accepts
    `2`, which would be ambiguous against the numeric pagination segment.
  - Add unit tests for the validator alongside the existing
    `unique-root-slug.test.mjs`.
- Add `description` — type `text`, rows 3, `group: "content"`. Rendered as intro
  copy on the archive page. This is the only unique text on an archive page and is
  what makes it more than a thin list of links.
- Add the shared `meta` field (`import meta from "../blocks/shared/meta"`). Gives
  per-category SEO title/description/image and a `noindex` boolean for free.
- Add a `preview` block showing title + slug.

Backfill slugs for the six existing categories. Auto-derived from title except two
that are hand-tuned for clarity:

| Title | Slug |
|---|---|
| Buyer Education | `buyer-education` |
| Types of Loans | `loan-types` (hand-set; clearer than `types-of-loans`) |
| Personal Finances | `personal-finances` |
| Requirements | `mortgage-requirements` (hand-set; `requirements` is meaningless alone) |
| Benefits of Buying Now | `benefits-of-buying-now` |
| Realtor Information | `realtor-information` |

These slugs are provisional — branch 2 renames categories and will need redirects
for any that change. That is expected and accounted for; the `redirect` document
type already exists (`schemas/documents/redirect.ts`, wired through
`frontend/next.config.mjs`).

### 2. Studio — post schema

Replace the `categories` array at `schemas/documents/post.ts:103` with:

```ts
defineField({
  name: "category",
  title: "Category",
  type: "reference",
  to: [{ type: "category" }],
  group: "settings",
  validation: (Rule) => Rule.required(),
})
```

Single reference, required. Every one of the 58 posts already has exactly one
category, so `required` enforces existing reality rather than imposing a new
constraint.

### 3. Data migration

One committed script under `studio/scripts/` (not a one-off), because branch 2
needs a near-identical script to reassign all 58 posts and should start from a
working template.

Single-shot, not phased. This is a development dataset with no users and no other
editors; the user takes a backup first. Temporary invalidity is acceptable and
recovery is "restore the backup and re-run."

The script must:

1. **Guard the target** — assert project `hv0545v9` and dataset `development`
   explicitly; refuse to run against anything else.
2. **Default to dry-run.** Require an explicit `--apply` flag to write. Dry-run
   prints the full mutation set.
3. **Audit before writing, and abort on anything unexpected.** Classify every post
   (querying the `raw` perspective so drafts are included, each draft/published
   version treated separately) as:
   - *migratable* — exactly one category reference whose target resolves and is
     actually `_type == "category"`;
   - *already migrated* — `category` set and valid, no legacy array;
   - *fatal* — zero categories, more than one, a dangling `_ref`, a `_ref` pointing
     at a non-category document, a malformed `category` value, or **both** fields
     present with conflicting values (if both are present and agree, treat as
     already-migrated and just unset the array).

   If any post is fatal, **abort before all writes** and print the offending IDs.
   Reporting-and-continuing is not enough: collapsing to `categories[0]` destroys
   data, and `category` is required so a zero-category post becomes unpublishable.
   Verified at plan time that all 58 published posts have exactly one entry, but
   that was a point-in-time read and did not cover drafts.
4. Set `category` as a clean `{_type: "reference", _ref}` object — do not copy the
   array element verbatim, which carries an array-only `_key` that is invalid on a
   single reference field.
5. Unset the stale `categories` field in the same patch.
6. Use revision-guarded writes (`ifRevisionId`) so a concurrent edit fails loudly
   rather than silently clobbering, and **commit every post and category patch in a
   single transaction** with synchronous visibility. Per-document patches would let
   one revision failure leave the dataset half-converted — with `category` required,
   that means some posts unpublishable and others fine.
7. **Post-write parity audit** — during classification, record an
   `expectedCategoryRef` per document from whichever field legitimately supplied it
   (legacy `categories[0]` for migratable, the existing `category` for
   already-migrated). Audit against that snapshot, not against `categories[0]` —
   already-migrated documents have no `categories[0]` and would spuriously fail.
   Assert no post retains a `categories` field. Print migrated / skipped / fatal
   counts.

Also patch the six category documents with their slugs, in the same transaction.
Bind the mapping to **exact document IDs**, not titles — titles are editable and
branch 2 will change them. Audit draft/published pairs for each category and patch
every existing version, or abort.

**Preflight slug uniqueness across every raw category version**, not just the six
mapped targets. Script mutations bypass Studio validators entirely, so the
`uniqueCategorySlug` validator offers no protection here. Assert each proposed slug
is unused outside its own published/draft pair — including by draft-only or
unmapped category documents — and abort on any conflict.

**Every raw category version must end up with a valid slug.** `slug` is required,
so any category the mapping misses — a draft-only document, or one created since
this plan was written — would be left unpublishable. Abort before writing unless
each raw category version is either in the mapping or already carries a valid,
unique slug. Print the unmapped IDs so the user can decide rather than guessing.

**Unit-test the classifier and mutation builder** — dry-run output, mixed states,
drafts, dangling refs, wrong-type refs, both-fields-present (agreeing and
conflicting), slug conflicts, revision guards, and rerun idempotency. This is the
one destructive step in the branch and it is pure logic, so it is cheap to test.

Target dataset: `development` (project `hv0545v9`). No production dataset is in
scope.

### 4. Frontend — queries

- `sanity/queries/blog-index.ts:13` — `categories[]->{_id, title}` becomes
  `category->{_id, title, slug}`.
- `sanity/queries/latest-articles.ts:46` — same change.
- New `sanity/queries/category.ts` with:
  - `CATEGORY_QUERY` — single category by slug, including `description` and `meta`.
  - `CATEGORY_POSTS_QUERY` — published posts in a category, windowed for
    pagination, reusing the existing `publishedPostFilter` and `blogPostOrder`
    constants from `blog-index.ts`.
  - `CATEGORY_POSTS_COUNT_QUERY` — count for pagination math.
  - `CATEGORY_STATIC_PARAMS_QUERY` — `{slug, publishedPostCount}` for **every**
    category with a valid slug (see the routing section: static generation is
    deliberately not gated on SEO eligibility). The count drives the child route's
    `2..totalPages` expansion.
  - `CATEGORY_QUERY` must also project `publishedPostCount` (or a derived
    `isIndexable`), because `generateMetadata` needs it to apply the zero-post
    `noindex` rule and cannot get it from description/meta alone.
- `publishedPostFilter` and `blogPostOrder` in `blog-index.ts` are module-private
  constants. Export them (or lift the shared listing contract into its own module)
  so the category queries reuse the same filter and ordering rather than
  duplicating them — divergence here would make category archives silently
  inconsistent with the blog index.
- Re-run TypeGen after query changes.

### 4b. Frontend — internal link resolution (latent bug this branch activates)

`schemas/documents/navigation.ts:36` and `footer.ts:31` **already allow `category`
references**, and all four resolvers in `sanity/queries/shared/internal-href.ts`
fall through to `"/" + slug.current + "/"`. Categories have no slug today, so those
links currently resolve to nothing and the bug is dormant.

Adding a slug activates it: every nav/footer category link would silently point at
`/loan-types/` — a root URL that does not exist and would 404 through the catch-all.

Add explicit category handling to all four resolvers
(`customLinkInternalHref`, `urlInternalHref`, `internalReferenceHref`,
`legacyInternalLinkHref`), emitting `"/blog/category/" + slug.current + "/"`.

**`sanity/queries/footer.ts:3` has its own `destinationProjection`** that does not
use the shared helpers — it inlines its own `select()` with a post-specific branch.
It needs the same category branch, or should be refactored onto the shared
resolver. Grep for every remaining inline `slug.current` href projection and fix
each; the four shared helpers are not the complete set.

Add tests asserting category references resolve under `/blog/category/` from both
the shared resolvers and the footer query.

### 5. Frontend — routes

New routes mirroring the existing blog index structure:

- `app/(main)/blog/category/[slug]/page.tsx`
- `app/(main)/blog/category/[slug]/[page]/page.tsx`

Reuse `lib/blog-index.ts` — `BLOG_POSTS_PER_PAGE = 12`, `parseBlogPageSegment`,
`getBlogPostWindow`, `calculateBlogPagination`, `isBlogPageOutOfRange`. Category
archives paginate at 12, same as the blog index. Only Buyer Education (44 posts)
paginates today.

**`getBlogPaginationUrl` cannot be reused as-is.** It hardcodes global `/blog/`
paths (`lib/blog-index.ts:46`, re-exported as `getBlogCanonicalPath`), so category
pagination would link back to the global archive. Parameterise it with a base path
(defaulting to `/blog/` so existing callers are unchanged) and thread that through
`components/blog-pagination.tsx`, which currently calls it directly. The same
base-path helper supplies canonicals for category pages.

**Metadata.** Both routes need `generateMetadata`: title from `meta.title` falling
back to the category title, description from `meta.description` falling back to the
category `description`, page-number suffix on paginated pages, canonical via the
parameterised helper, Open Graph image from `meta.image`, `robots.noindex` honouring
`meta.noindex`, and `stega: false` on the metadata fetch — matching how
`generateBlogIndexMetadata` already works in `sanity/lib/metadata.ts`.

Follow the existing route conventions exactly as in `blog/[page]/page.tsx`:
`Suspense` + fallback skeleton, `draftMode()` branch between static and dynamic
fetch, `notFound()` on unparseable page segment or out-of-range page.

**Unknown slugs must `notFound()`.** A structurally valid slug for a category that
does not exist (`/blog/category/made-up/`) passes proxy validation and reaches the
route. Both the page component *and* `generateMetadata` must call `notFound()` when
`CATEGORY_QUERY` returns null — metadata runs independently and would otherwise
throw on null. Cover with a test.

**Two separate `generateStaticParams`.** The `[slug]` route needs `{slug}`; the
`[slug]/[page]` route needs `{slug, page}` for pages `2..totalPages` per category.
They cannot share one generator, and the child needs per-category post counts —
so the static-params query must return `{slug, publishedPostCount}`, not slugs
alone.

**Do NOT couple static generation to SEO eligibility.** These are different
questions: "should this route be prerendered?" vs "should crawlers index it?".
`next.config.mjs` sets `cacheComponents: true`, and under Cache Components
`generateStaticParams` must return at least one entry — with the eligibility rule
(which requires a description) gating it, the array would be empty before any copy
is authored and **the build would fail**.

Generate params for **every category with a valid slug**, independent of
description or `meta.noindex`. Indexability is decided at render time via the
robots tag and in the sitemap query. Empty/description-less categories still
prerender; they just emit `noindex, follow` and stay out of the sitemap.

The **child `[slug]/[page]` generator has the same empty-array hazard from the
other direction**: if no category exceeds 12 posts, `2..totalPages` is empty for
every category and the array is `[]`. That is the state the dataset lands in right
after branch 2 (largest bucket ~12). Return a sentinel param that the route handles
via `notFound()` (e.g. `{slug: <first valid slug>, page: "2"}` when the real set is
empty), and test the no-paginated-categories dataset explicitly.

Page renders: breadcrumbs (Home → Blog → Category), H1 = category title,
description as intro copy, post grid reusing `blog-card`, pagination controls.

Since categories become Presentation-editable (6b), the H1 and description need
`data-sanity` attributes via the same `documentDataAttribute` helper the cards use,
so click-to-edit works on both fields. Verify in Presentation, not just by reading
the markup.

Zero-post categories **are** statically generated (via
`CATEGORY_STATIC_PARAMS_QUERY`, which covers every category with a valid slug) —
static generation is decoupled from indexability, per the routing section above.

Two categories currently have no posts, and an indexed empty archive is a
thin-content liability, so an empty archive must **emit `robots: noindex, follow`**
at render time and stay out of the sitemap. It still resolves and renders an empty
state rather than 404 — the category legitimately exists, and both empty categories
are expected to disappear in branch 2.

Apply the same rule to a category with no `description`: the plan treats the
description as the thing that keeps an archive from being thin, so a category
lacking one should render `noindex, follow` until it has one.

**One eligibility rule, one definition — but scoped to indexing only.** "Indexable
category" = has ≥1 published post AND a non-blank description AND
`meta.noindex != true`. Define it once and use it for **the sitemap query and the
runtime robots tag**. Splitting those two — e.g. sitemap keyed on post count while
robots is keyed on description — produces sitemap entries for pages that emit
`noindex`, a contradictory signal to crawlers.

`generateStaticParams` is deliberately **not** governed by this rule (see the
routing section): prerendering every valid category keeps the build working before
any description copy exists.

**Descriptions must actually be written.** The four non-empty categories need
reviewed copy before this branch is done; the user authors it (I should not invent
marketing copy for a real lender). Until copy exists for a category, its archive
stays `noindex` and out of the sitemap by the rule above — which is safe, but means
the branch does not deliver its SEO goal until the copy lands. Treat the four
descriptions as a deliverable of this branch, not a follow-up.

### 6. Frontend — components

- `components/blog-card.tsx:124` — `post.categories?.[0]` becomes `post.category`.
  The rendered label becomes a `<Link>` to the category archive instead of plain
  text. Keep the `documentDataAttribute` stega wiring intact.
- `components/blocks/latest-articles.tsx:44` — same field change; label becomes a
  link.

**Stega in hrefs.** `blog-card.tsx` already `stegaClean`s every value used to build
a URL (lines 91, 122). The category href must do the same —
`stegaClean(post.category?.slug?.current)` — or in Presentation the slug carries
invisible stega characters and the link navigates to a garbage URL. Test category
navigation in draft mode, not just published.

**`documentDataAttribute` is module-private** (`blog-card.tsx:68`, a bare
`function`). The category route needs it for the H1 and description click-to-edit
wiring, so export it or lift it into a shared helper under `sanity/lib/` — don't
duplicate it.

**Nested-anchor hazard.** Both card variants wrap the whole card in a link (the
Latest Articles card is one large `<Link>`; `RegularPostCard` uses a full-card
overlay anchor). Putting a category `<Link>` inside either produces invalid nested
anchors, or a category link the overlay swallows.

Restructure both so the card is an `<article>` with the post link and the category
link as siblings — the post link may still use an overlay/`::after` pattern for the
large click target, but the category link must sit above it in stacking order
(`relative` + higher `z-index`) so it remains clickable. Verify both cards in the
browser: category link navigates to the archive, the rest of the card navigates to
the post, and there is no anchor nested inside an anchor in the DOM.

### 6b. Studio — Presentation

Category documents are absent from Presentation wiring. Add:

- A `defineLocations` entry for `category` in `studio/presentation/resolve.ts`
  (alongside the existing `post` entry at line 26) resolving to
  `/blog/category/<slug>/`.
- `"category"` to the supported types in `studio/presentation/routes.ts` **and an
  explicit branch in `getPresentationPath`**. Adding the type alone is not enough:
  the function falls through to `resolveContentPath(slug)`, which would open a
  category at `/loan-types/`. It needs a `if (documentType === "category") return
  \`/blog/category/${slug}/\`` branch, mirroring how `blogIndex` is special-cased.
- The main-document resolver filter at `resolve.ts:65` currently matches
  `_type in ['page', 'post']` against a root slug. Category URLs are not root
  slugs, so add a separate branch matching `/blog/category/<slug>/` rather than
  widening that filter — widening it would wrongly resolve `/loan-types/` to a
  category.
- Extend `presentation.test.mjs` to cover category resolution.

### 7. Sitemap

`app/sitemap.ts` uses a hardcoded `VIEWABLE_TYPES` list and a `urlQuery` `select()`
that maps documents to URLs. Category pages will not appear unless explicitly
added — without this step crawlers cannot discover the new hubs and the branch
delivers no SEO value.

Add `category` to the query such that it:
- Emits `$baseUrl + "/blog/category/" + slug.current + "/"`.
- Applies the single eligibility rule defined in section 5 — ≥1 published post,
  non-blank description, `meta.noindex != true`.
- Uses `changeFrequency: "weekly"` and a priority of `0.6` (below `blogIndex` at
  0.7, above `page` at 0.5).
- **Omits `lastModified` for categories.** The category's own `_updatedAt` is stale
  — publishing a post changes what the archive shows without touching the category.
  But `max(category, current posts)` is also wrong: when a post is *removed* from a
  category, the post that would have carried the newest timestamp is no longer in
  the result set, so the value can move backwards. Since neither available signal is
  correct and there is no persistent archive-update timestamp to derive one from,
  omit the field. A missing `lastModified` is a valid sitemap entry; a wrong one
  actively misleads crawlers. Revisit only if a real archive-touched timestamp is
  introduced.

**Staging must not be indexable.** Check how the existing metadata helpers in
`sanity/lib/metadata.ts` handle non-production environments; if they apply an
environment-wide `noindex, nofollow`, the category routes must use the same guard
rather than a bespoke helper that only honours `meta.noindex`.

### 8. Verification

`frontend/lib/blog-index.test.mjs:54` asserts against the current query source and
neighbouring assertions cover the card's exposed fields — the `categories[]` →
`category` change will break these. They must be **updated, not deleted**.

Required checks before the branch is done:

- `blog-index.test.mjs` updated for the `category` projection.
- New tests: category slug validator (valid, numeric-only, duplicate, draft
  collision, self-exclusion); proxy route shapes **in the existing
  `frontend/proxy.test.ts`** — including the 12/13-post pagination boundary,
  cross-slug isolation, and the stale-snapshot path; internal-href category
  resolution **including the footer query**; parameterised pagination URLs;
  Presentation category resolution via `getPresentationPath`; unknown-slug
  `notFound()` from both the route and `generateMetadata`; proxy-vs-route count
  parity; concurrent cold misses and a rejected snapshot refresh; and build-level
  checks that **both** generators return non-empty arrays in the degenerate cases —
  no category has a description yet (parent), and no category exceeds 12 posts
  (child).
- Draft-mode check that category card links navigate correctly with stega active.
- Migration classifier and mutation-builder unit tests (see section 3).
- Migration script dry-run output reviewed before `--apply`; post-write parity
  audit clean.
- TypeGen re-run; `tsc` typecheck, lint, and production build all pass.
- Runtime smoke in the browser: `/blog/category/buyer-education/` renders and
  paginates to page 4; `/blog/category/made-up/` 404s; a zero-post or
  description-less category emits `noindex, follow`; `/blog/` and `/blog/2/` still
  work; a nav **and** footer category link point at `/blog/category/...`; both card
  variants have no nested anchors and a clickable category link.
- `/sitemap.xml` contains exactly the categories the eligibility rule admits — and
  nothing that renders `noindex`.
- Presentation: opening a category resolves to `/blog/category/<slug>/`, and
  click-to-edit works on the H1 and description.

## Key decisions & tradeoffs

- **`/blog/category/[slug]/`, not root-level `/[category-slug]/`.** Posts and pages
  both resolve from the root via `app/(main)/[...slug]/page.tsx`, which already
  needs a runtime collision guard (`resolveRootContent` throws on a page/post slug
  clash). Adding a third document type to that namespace makes an existing problem
  worse. `/blog/[slug]/` was rejected outright — it collides with the `/blog/[page]`
  pagination route.
- **Single reference, not array with `max(1)` validation.** The array + validation
  route would have avoided a data migration entirely, but the user chose the clean
  schema now so branch 2 is purely editorial. Accepted cost: this branch is a data
  migration, not just routing.
- **`required` on category.** All 58 posts comply already. `Rule.required()` is a
  validation **error**, not a warning — it blocks publishing outright. That is why
  the migration must abort on any zero-category post rather than leaving it to be
  fixed later: such a post would become unpublishable. Frontend types must still
  handle null, since validation is not a database constraint.
- **Hand-authored slugs, no `options.source`.** Categories change rarely and URLs
  are permanent; deliberate beats convenient.
- **Description field, not page-builder blocks.** Category pages don't need
  arbitrary block composition. A single text field is the piece crawlers and AI
  answer surfaces actually read.
- **Static generation is decoupled from indexability.** Every category with a valid
  slug is prerendered; zero-post and description-less categories are excluded from
  the *sitemap* and emit `noindex, follow`, but still resolve. Gating
  `generateStaticParams` on indexability would return an empty array before any
  description copy exists, which `cacheComponents: true` rejects at build time.
  Both current empty categories are expected to disappear in branch 2.
- **Single-shot migration over phased.** No users, no other editors, backup taken.
  The one piece kept from the phased approach is the pre-write report on posts with
  multiple categories, because that data is destroyed by the migration.

## Risks / open questions

- **Slug churn into branch 2, and redirects do NOT cover categories.** Verified:
  `studio/functions/auto-redirect/model.ts:43` sets
  `ROUTED_DOCUMENT_TYPES = ["page", "post"]`, and `model.test.mjs:159` explicitly
  asserts a category slug change is **skipped**. The redirect validator
  (`schemas/validation/redirect-rules.ts:177`) likewise only resolves `page`/`post`
  destinations, so a hand-written `/blog/category/...` redirect would raise a
  spurious "no published page or post uses this destination" warning.

  Consequence: when branch 2 renames a category, its URL breaks silently with no
  redirect. **Locked decision — out of scope for branch 1, mandatory for branch 2:**
  branch 2 must either extend `ROUTED_DOCUMENT_TYPES` and the validator to
  understand categories, or create the redirects manually with the validator
  warning suppressed. Recorded here so it cannot be forgotten once the URLs are
  live. Keeping the gap between branches short remains the cheapest mitigation.
- **Buyer Education renders 44 posts across 4 pages** until branch 2. Functionally
  correct, editorially poor — this is the visible symptom the user wants to see
  before choosing the final taxonomy.
- **TypeGen drift.** Every query projection touching categories changes; TypeGen
  must be re-run or the frontend types go stale against the new schema.
- **`uniqueCategorySlug` must not be `uniqueRootSlug`.** Reusing the root validator
  would wrongly reject valid category slugs that happen to match a page or post.
- Whether category archives need breadcrumb JSON-LD in addition to visual
  breadcrumbs — depends on existing structured-data patterns, not yet audited.

## Out of scope

- Renaming categories, re-cutting the taxonomy, reassigning any of the 58 posts
  (branch 2).
- The `tag` document type and tag archive pages (branch 2 and later).
- Moving posts off the root namespace to live under `/blog/`.
- Any change to the `blogIndex` singleton or the existing `/blog/` routes beyond
  what the field rename requires.
- Local-SEO content work (Phoenix/Scottsdale/Arizona coverage gaps).
