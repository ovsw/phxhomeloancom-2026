# V2 Page Builder catalog removal boundary

Research for [Draw the V2 Page Builder catalog removal boundary](https://github.com/ovsw/phxhomeloancom-2026/issues/4). Evidence was captured read-only on 2026-07-31 from the current V2 checkout at `6f701807cabfeda963902ad4c5addc583f7193a3`.

The protected baseline was pinned at `b8504a2bf6099cbfe73785e1b0cfbeff3e835912` by [Pin the V1 reference and protected V2 baseline](https://github.com/ovsw/phxhomeloancom-2026/issues/5#issuecomment-5143368079). The only repository change between that ref and the current ref is the baseline research document, so the catalog source below is unchanged from the pin.

## Decision

- Remove the current **13 top-level block identities** and their dependency-closed implementations. The recursive footprint is 29 Studio block files, 23 GROQ files, 23 catalog renderer files, and 20 preview images. Of those dependencies, three Studio schema helpers and three shared GROQ fragments have protected non-catalog consumers. The removal set is therefore 23 legacy schema identities plus up to three catalog-only Studio helpers, 20 catalog GROQ files, 23 catalog renderer files, and 20 previews.
- Preserve the **Page Builder seam**: the `page.blocks` array, exact `_type` agreement across schema/menu/query/TypeGen/dispatcher, `_key` React identity, the outer `PAGE_QUERY`, the `Blocks` dispatcher interface, and TypeGen's extract/generate workflow. Replace the catalog behind that seam; do not port Page Builder concerns into routes or layouts.
- Regenerate, rather than delete or hand-edit, `studio/schema.json` and `frontend/sanity.types.ts`. They contain both removable catalog output and protected non-catalog output.
- The repository has no test files and no test script. The removal therefore needs the explicit catalog contract and protected-foundation smoke tests defined below; typecheck/lint/build alone cannot prove the boundary.

Sources: [protected baseline](./v1-reference-and-v2-baseline.md), [repository Page Builder contract](../agents/page-builder.md), [Page schema](../../studio/schemas/documents/page.ts), [query composition](../../frontend/sanity/queries/page.ts), [dispatcher](../../frontend/components/blocks/index.tsx), and [TypeGen configuration](../../studio/sanity.cli.ts).

## Top-level catalog to replace

Every row is registered in `page.blocks.of`, appears in exactly one insert-menu group, is projected into `PAGE_QUERY`, is dispatched to a renderer, and has a top-level preview image.

| `_type` | Insert group | Studio schema | GROQ fragment | Renderer | Preview |
| --- | --- | --- | --- | --- | --- |
| `hero-1` | `hero` | [`hero/hero-1.ts`](../../studio/schemas/blocks/hero/hero-1.ts) | [`hero/hero-1.ts`](../../frontend/sanity/queries/hero/hero-1.ts) | [`hero/hero-1.tsx`](../../frontend/components/blocks/hero/hero-1.tsx) | `hero-1.jpg` |
| `hero-2` | `hero` | [`hero/hero-2.ts`](../../studio/schemas/blocks/hero/hero-2.ts) | [`hero/hero-2.ts`](../../frontend/sanity/queries/hero/hero-2.ts) | [`hero/hero-2.tsx`](../../frontend/components/blocks/hero/hero-2.tsx) | `hero-2.jpg` |
| `section-header` | `section-header` | [`section-header.ts`](../../studio/schemas/blocks/section-header.ts) | [`section-header.ts`](../../frontend/sanity/queries/section-header.ts) | [`section-header.tsx`](../../frontend/components/blocks/section-header.tsx) | `section-header.jpg` |
| `split-row` | `split` | [`split/split-row.ts`](../../studio/schemas/blocks/split/split-row.ts) | [`split/split-row.ts`](../../frontend/sanity/queries/split/split-row.ts) | [`split/split-row.tsx`](../../frontend/components/blocks/split/split-row.tsx) | `split-row.jpg` |
| `grid-row` | `grid` | [`grid/grid-row.ts`](../../studio/schemas/blocks/grid/grid-row.ts) | [`grid/grid-row.ts`](../../frontend/sanity/queries/grid/grid-row.ts) | [`grid/grid-row.tsx`](../../frontend/components/blocks/grid/grid-row.tsx) | `grid-row.jpg` |
| `carousel-1` | `carousel` | [`carousel/carousel-1.ts`](../../studio/schemas/blocks/carousel/carousel-1.ts) | [`carousel/carousel-1.ts`](../../frontend/sanity/queries/carousel/carousel-1.ts) | [`carousel/carousel-1.tsx`](../../frontend/components/blocks/carousel/carousel-1.tsx) | `carousel-1.jpg` |
| `carousel-2` | `carousel` | [`carousel/carousel-2.ts`](../../studio/schemas/blocks/carousel/carousel-2.ts) | [`carousel/carousel-2.ts`](../../frontend/sanity/queries/carousel/carousel-2.ts) | [`carousel/carousel-2.tsx`](../../frontend/components/blocks/carousel/carousel-2.tsx) | `carousel-2.jpg` |
| `timeline-row` | `timeline` | [`timeline/timeline-row.ts`](../../studio/schemas/blocks/timeline/timeline-row.ts) | [`timeline.ts`](../../frontend/sanity/queries/timeline.ts) | [`timeline/timeline-row.tsx`](../../frontend/components/blocks/timeline/timeline-row.tsx) | `timeline-row.jpg` |
| `cta-1` | `cta` | [`cta/cta-1.ts`](../../studio/schemas/blocks/cta/cta-1.ts) | [`cta/cta-1.ts`](../../frontend/sanity/queries/cta/cta-1.ts) | [`cta/cta-1.tsx`](../../frontend/components/blocks/cta/cta-1.tsx) | `cta-1.jpg` |
| `logo-cloud-1` | `logo-cloud` | [`logo-cloud/logo-cloud-1.ts`](../../studio/schemas/blocks/logo-cloud/logo-cloud-1.ts) | [`logo-cloud/logo-cloud-1.ts`](../../frontend/sanity/queries/logo-cloud/logo-cloud-1.ts) | [`logo-cloud/logo-cloud-1.tsx`](../../frontend/components/blocks/logo-cloud/logo-cloud-1.tsx) | `logo-cloud-1.jpg` |
| `faqs` | `faqs` | [`faqs.ts`](../../studio/schemas/blocks/faqs.ts) | [`faqs.ts`](../../frontend/sanity/queries/faqs.ts) | [`faqs.tsx`](../../frontend/components/blocks/faqs.tsx) | `faqs.jpg` |
| `form-newsletter` | `forms` | [`forms/newsletter.ts`](../../studio/schemas/blocks/forms/newsletter.ts) | [`forms/newsletter.ts`](../../frontend/sanity/queries/forms/newsletter.ts) | [`forms/newsletter.tsx`](../../frontend/components/blocks/forms/newsletter.tsx) | `form-newsletter.jpg` |
| `all-posts` | `all-posts` | [`all-posts.ts`](../../studio/schemas/blocks/all-posts.ts) | [`all-posts.ts`](../../frontend/sanity/queries/all-posts.ts) | [`all-posts.tsx`](../../frontend/components/blocks/all-posts.tsx) | `all-posts.jpg` |

The authoritative current set is the 13 entries in `page.blocks.of`, not the folder names. The insert-menu set is the flattened union of the 11 groups in the same field. Sources: [Page schema](../../studio/schemas/documents/page.ts) lines 38–123 and [Page Builder guide](../agents/page-builder.md) lines 7–45.

## Dependency-closed catalog files

### Studio schemas and registration

Delete the 13 top-level schema files in the table plus these 10 nested catalog types:

- Grid: [`grid-card`](../../studio/schemas/blocks/grid/grid-card.ts), [`grid-post`](../../studio/schemas/blocks/grid/grid-post.ts), and [`pricing-card`](../../studio/schemas/blocks/grid/pricing-card.ts), reachable only through `grid-row.columns`.
- Split: [`split-content`](../../studio/schemas/blocks/split/split-content.ts), [`split-cards-list`](../../studio/schemas/blocks/split/split-cards-list.ts), [`split-card`](../../studio/schemas/blocks/split/split-card.ts), [`split-image`](../../studio/schemas/blocks/split/split-image.ts), [`split-info-list`](../../studio/schemas/blocks/split/split-info-list.ts), and [`split-info`](../../studio/schemas/blocks/split/split-info.ts), reachable only through `split-row.splitColumns` and their child arrays.
- Timeline: [`timelines-1`](../../studio/schemas/blocks/timeline/timelines-1.ts), reachable only through `timeline-row.timelines`.

The recursive schema footprint also reaches six helpers under `studio/schemas/blocks/shared/`:

- Preserve [`block-content.ts`](../../studio/schemas/blocks/shared/block-content.ts), [`link.ts`](../../studio/schemas/blocks/shared/link.ts), and [`button-variant.ts`](../../studio/schemas/blocks/shared/button-variant.ts). `post`, `settings`, and other non-page documents use `block-content`; `navigation` uses `link`; `link` uses `button-variant`.
- [`color-variant.ts`](../../studio/schemas/blocks/shared/color-variant.ts), [`section-padding.ts`](../../studio/schemas/blocks/shared/section-padding.ts), and [`layout-variants.ts`](../../studio/schemas/blocks/shared/layout-variants.ts) have no current consumer outside the legacy catalog. They are catalog-owned removal candidates unless the replacement catalog or a retained generic UI module reuses their interface.

Remove all 23 legacy identity imports and array entries from [`studio/schema-types.ts`](../../studio/schema-types.ts). Also remove the `colorVariant` and `sectionPadding` registrations if those helpers are not reused; `layout-variants.ts` has no root registration. Preserve the `schemaTypes` registration seam and all non-catalog registrations. Remove the 13 legacy references from `page.blocks.of` and the 11 now-empty legacy insert groups from [`studio/schemas/documents/page.ts`](../../studio/schemas/documents/page.ts); keep the `page` document, its `blocks` field, metadata, ordering, and insert-menu view mechanism for the replacement catalog.

### GROQ and TypeGen inputs

Delete the 13 top-level GROQ modules in the table plus these seven nested projection modules:

- [`grid/grid-card.ts`](../../frontend/sanity/queries/grid/grid-card.ts), [`grid/grid-post.ts`](../../frontend/sanity/queries/grid/grid-post.ts), and [`grid/pricing-card.ts`](../../frontend/sanity/queries/grid/pricing-card.ts).
- [`split/split-content.ts`](../../frontend/sanity/queries/split/split-content.ts), [`split/split-cards-list.ts`](../../frontend/sanity/queries/split/split-cards-list.ts), [`split/split-image.ts`](../../frontend/sanity/queries/split/split-image.ts), and [`split/split-info-list.ts`](../../frontend/sanity/queries/split/split-info-list.ts).

The recursive query footprint is 23 files: those 20 catalog modules plus shared [`body.ts`](../../frontend/sanity/queries/shared/body.ts), [`image.ts`](../../frontend/sanity/queries/shared/image.ts), and [`link.ts`](../../frontend/sanity/queries/shared/link.ts). Preserve all three because the post query reaches them. Also preserve [`meta.ts`](../../frontend/sanity/queries/shared/meta.ts), which is outside the catalog closure but is used by both page and post queries.

Remove the 13 legacy fragment imports and interpolations from [`frontend/sanity/queries/page.ts`](../../frontend/sanity/queries/page.ts). Preserve `PAGE_QUERY` as the page-query interface, its `_type == "page" && slug.current == $slug` filter, `blocks[]{...}` projection slot, `metaQuery`, and `PAGES_SLUGS_QUERY`.

TypeGen scans the root query files configured by [`studio/sanity.cli.ts`](../../studio/sanity.cli.ts); the root `page.ts` interpolation makes the nested catalog fragments part of `PAGE_QUERY`. After source removal and replacement-catalog registration, run `pnpm typegen`. The resulting catalog types and the legacy `PAGE_QUERY_RESULT.blocks` branches disappear from [`frontend/sanity.types.ts`](../../frontend/sanity.types.ts), and the 23 schema types disappear from [`studio/schema.json`](../../studio/schema.json). Both generated files retain their non-catalog types and query results.

### Renderers and dispatcher exports

Delete the 13 top-level renderer files in the table plus these 10 catalog-only child renderers:

- Grid: [`grid-card.tsx`](../../frontend/components/blocks/grid/grid-card.tsx), [`grid-post.tsx`](../../frontend/components/blocks/grid/grid-post.tsx), and [`pricing-card.tsx`](../../frontend/components/blocks/grid/pricing-card.tsx).
- Split: [`split-content.tsx`](../../frontend/components/blocks/split/split-content.tsx), [`split-cards-list.tsx`](../../frontend/components/blocks/split/split-cards-list.tsx), [`split-cards-item.tsx`](../../frontend/components/blocks/split/split-cards-item.tsx), [`split-image.tsx`](../../frontend/components/blocks/split/split-image.tsx), [`split-info-list.tsx`](../../frontend/components/blocks/split/split-info-list.tsx), and [`split-info-item.tsx`](../../frontend/components/blocks/split/split-info-item.tsx).
- Timeline: [`timeline-1.tsx`](../../frontend/components/blocks/timeline/timeline-1.tsx).

In [`frontend/components/blocks/index.tsx`](../../frontend/components/blocks/index.tsx), remove the 13 renderer imports, the 12 `componentMap` entries, and the explicit `all-posts` branch. Preserve the default `Blocks` module as the route-facing dispatcher seam, its `{blocks, perspective, stega}` interface unless a later ticket deliberately narrows it, `_key` React keys, and unknown-type behavior. `all-posts` is an implementation exception, not part of the protected interface.

[`post-hero.tsx`](../../frontend/components/blocks/post-hero.tsx) is not a Page Builder renderer despite its directory. The blog route imports it directly, so it remains.

### Preview assets

Delete all 20 files currently under [`studio/static/images/preview/`](../../studio/static/images/preview/): the 13 top-level previews in the table plus `grid-card.jpg`, `grid-post.jpg`, `pricing-card.jpg`, `split-cards-list.jpg`, `split-content.jpg`, `split-image.jpg`, and `split-info-list.jpg`. Replacement blocks provide previews keyed by their own `_type` values.

### Existing tests and secondary feature tails

No `*.test.*`, `*.spec.*`, `test/`, `tests/`, `spec/`, or `specs/` files exist, and no workspace package exposes a `test` script. There are therefore no legacy block tests to delete.

Two legacy blocks have implementation tails outside the mirrored catalog folders:

- The `all-posts` feature is the sole root consumer of the `fetchSanityPosts`/`POSTS_QUERY` path; its closure includes `POSTS_QUERY_RESULT` and [`ui/post-card.tsx`](../../frontend/components/ui/post-card.tsx). Remove those specific exports/types and the now-orphaned card when removing `all-posts`; preserve `POST_QUERY`, `POSTS_SLUGS_QUERY`, `fetchSanityPostBySlug`, the blog route, and the `post`/`author`/`category` schemas.
- `form-newsletter` is the only caller of `/api/newsletter`. [`frontend/app/api/newsletter/route.ts`](../../frontend/app/api/newsletter/route.ts), the Resend environment variables, and the form-specific dependencies are not protected foundation. Remove them if the replacement catalog has no newsletter subscription capability; otherwise treat them as an adapter reused by the replacement, not as a reason to retain `form-newsletter`.

Generic UI modules currently used only by the legacy catalog—`accordion`, `avatar`, `card`, `carousel`, `form`, `input`, `section-container`, `star-rating`, and `tag-line`—are not catalog identities. Keep or remove each according to replacement-catalog use after the new renderers exist; their current orphan status alone does not make them part of the protected foundation. If `section-container` is retained, either retain its `color-variant`/`section-padding` type interface or retype it through the replacement catalog rather than leaving imports of removed generated types.

The `faq` and `testimonial` document schemas are referenced only by the legacy `faqs` and `carousel-2` blocks at runtime, but they are independently registered document types and Studio structure entries. Do not silently delete them as part of catalog removal. Their removal requires the later content-model decision and a dataset-content check; no Sanity mutation belongs to this ticket.

## V2 mechanisms that must remain intact

| Mechanism | Preserved interface and observable behavior | Primary source |
| --- | --- | --- |
| App Router URL model | `/` fetches page slug `index`; `/index` permanently redirects to `/`; the catch-all joins slashless slug segments, excludes `index` from static params, and calls `notFound()` for missing pages. | [root route](../../frontend/app/%28main%29/page.tsx), [catch-all route](../../frontend/app/%28main%29/%5B...slug%5D/page.tsx), [Next config](../../frontend/next.config.mjs) |
| Server-first published and draft paths | Published routes pass `perspective="published"` and `stega={false}`. Draft Mode resolves the cookie-selected perspective outside cached functions and enables Stega. Page routes remain Server Components with Suspense only around dynamic paths. | [live policy](../../frontend/sanity/lib/live.ts), [root route](../../frontend/app/%28main%29/page.tsx), [catch-all route](../../frontend/app/%28main%29/%5B...slug%5D/page.tsx) |
| Cache Components and freshness | `cacheComponents: true`, the `next-sanity` default cache-life profile, cached Sanity fetch functions, `SanityLive`, and published `updateTag` versus draft `revalidateTag(..., "max")` remain the performance/freshness path. | [Next config](../../frontend/next.config.mjs), [fetch module](../../frontend/sanity/lib/fetch.ts), [live module](../../frontend/sanity/lib/live.ts), [revalidation action](../../frontend/app/actions/revalidate.ts) |
| Main application seam | The main layout remains the sole composition point for Header, page content, `SanityLive`, Visual Editing/disable controls, and Footer, including dynamic Header/Footer Suspense behavior in Draft Mode. | [main layout](../../frontend/app/%28main%29/layout.tsx) |
| Standalone Studio and Presentation | Keep the separate `studio` app, `schemaTypes` integration, draft-mode enable route, Presentation origin, resolver for `/`, `/:slug`, and `/blog/:slug`, Structure Tool, document preview panes, Vision, and media/code plugins. | [Studio config](../../studio/sanity.config.ts), [Presentation resolver](../../studio/presentation/resolve.ts), [document preview](../../studio/defaultDocumentNode.ts), [Studio structure](../../studio/structure.ts) |
| Metadata and discovery | Keep metadata fetches Stega-free, `generatePageMetadata`, page/post metadata generation, sitemap, robots, and missing-page behavior. | [live metadata fetch](../../frontend/sanity/lib/live.ts), [metadata](../../frontend/sanity/lib/metadata.ts), [sitemap](../../frontend/app/sitemap.ts), [robots](../../frontend/app/robots.ts) |
| Sanity environment and security | Keep project/dataset/API-version configuration, the server-only read token, the published-default client, Draft Mode enable/disable routes, and the frontend/Studio origin seam. | [environment](../../frontend/sanity/lib/env.ts), [client](../../frontend/sanity/lib/client.ts), [token](../../frontend/sanity/lib/token.ts), [draft enable](../../frontend/app/api/draft-mode/enable/route.ts), [draft disable](../../frontend/app/api/draft-mode/disable/route.ts) |
| Global and blog content | Keep navigation/settings fetches and Header/Footer behavior. Keep the direct blog route, post renderer, post schemas, post detail/static-slug queries, Portable Text renderer, and shared GROQ fragments. | [fetch module](../../frontend/sanity/lib/fetch.ts), [Header](../../frontend/components/header/index.tsx), [Footer](../../frontend/components/footer.tsx), [blog route](../../frontend/app/%28main%29/blog/%5Bslug%5D/page.tsx), [post query](../../frontend/sanity/queries/post.ts) |
| Page Builder and TypeGen seam | Keep one exact `_type` contract from schema and insert menu through GROQ, generated types, and dispatcher; every renderer field must be projected; `_key` remains the array-item identity; generated files are never hand-edited. | [Page Builder guide](../agents/page-builder.md), [TypeGen config](../../studio/sanity.cli.ts), [dispatcher](../../frontend/components/blocks/index.tsx) |

## Concrete deletion test

The boundary passes only after the replacement catalog is present. Deleting the legacy implementation before replacement would deliberately make `page.blocks` and `PAGE_QUERY_RESULT.blocks` unusable; that is not a meaningful intermediate target.

1. **Freeze the retired identity set.** The test owns these 23 schema identities:

   ```text
   hero-1 hero-2 section-header split-row split-content split-cards-list
   split-card split-image split-info-list split-info grid-row grid-card
   grid-post pricing-card carousel-1 carousel-2 timeline-row timelines-1
   cta-1 logo-cloud-1 faqs form-newsletter all-posts
   ```

2. **Assert legacy absence and replacement exact-set parity.** A repository contract test must extract:

   - top-level `_type` values from `page.blocks.of`;
   - the flattened insert-menu groups;
   - top-level conditional projections reachable from `PAGE_QUERY`;
   - dispatcher registrations, including any explicit special branch;
   - top-level preview basenames;
   - schema names in regenerated `studio/schema.json` and the block union in regenerated `frontend/sanity.types.ts`.

   The intersection of every extracted set with the 23 retired identities must be empty. The replacement top-level sets must be exactly equal across schema, menu, query, dispatcher, and previews. Nested replacement types must be reachable from a top-level schema/query/renderer and must not appear in the top-level sets.

3. **Prove source deletion.** This search must return no legacy identity in Studio or frontend source, preview filenames, or regenerated artifacts:

   ```bash
   rg -n 'hero-1|hero-2|section-header|split-row|split-content|split-cards-list|split-card|split-image|split-info-list|split-info|grid-row|grid-card|grid-post|pricing-card|carousel-1|carousel-2|timeline-row|timelines-1|cta-1|logo-cloud-1|faqs|form-newsletter|all-posts' \
     studio frontend
   ```

   If the replacement intentionally reuses a generic English field name such as `faqs`, narrow the check to quoted `_type`/schema names and legacy paths; do not waive old `_type` occurrences.

4. **Regenerate and prove generated-file determinism.** Run:

   ```bash
   pnpm typegen
   git diff --exit-code -- studio/schema.json frontend/sanity.types.ts
   ```

   In the implementation change, commit the first intentional regeneration. The command above is then rerun from that proposed tree and must be clean, proving the committed generated files match the replacement schema and queries.

5. **Run repository verification.** Run the existing required checks:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm --dir frontend build
   pnpm --dir studio build
   ```

6. **Prove the protected route/live contract.** Against the configured published dataset, `/`, `/our-team`, `/phoenix-loan-originator`, and `/contact` must return their replacement content without a draft cookie; `/index` must redirect to `/`; an unknown page must reach `notFound()`. In a valid Presentation session, the same page path must render draft/release content with Stega overlays, `SanityLive` must include drafts, and disabling Draft Mode must return to published content. A tag update must use `updateTag` outside Draft Mode and `revalidateTag(tag, "max")` plus `"refresh"` inside it.

7. **Apply the module deletion test.** Delete the 23 legacy identity schemas, the catalog-only Studio helpers not reused by the replacement (currently up to three), the 20 catalog query files, 23 renderer files, and 20 preview files while installing the replacement behind the same seams. The test passes only if no catalog complexity reappears in the App Router pages, main layout, Sanity live/cache modules, Presentation configuration, Header/Footer, or blog path. Needing to copy renderer selection, perspective handling, or query expansion into those callers means the seam was breached.

## Limitations

- This is a source-boundary finding. It did not query or mutate the V2 Sanity dataset, so it does not decide whether existing `faq`, `testimonial`, newsletter, or legacy block content should be retained, migrated, or deleted.
- The repository advanced from the issue's pinned target only by adding the baseline research document. If later source changes touch catalog paths, rerun the exact-set inventory before implementation.
- No application, Studio, schema, query, renderer, generated file, test, or Sanity document was changed by this research. The Wayfinder session claimed the ticket, and this Markdown artifact is the only workspace change for this ticket.

## Reproduction commands

```bash
git rev-parse HEAD
git diff --name-status b8504a2bf6099cbfe73785e1b0cfbeff3e835912..HEAD

# Top-level catalog and insert groups
sed -n '38,123p' studio/schemas/documents/page.ts

# Registration, query, and renderer wiring
sed -n '18,90p' studio/schema-types.ts
sed -n '1,80p' frontend/sanity/queries/page.ts
sed -n '1,100p' frontend/components/blocks/index.tsx

# Generated inputs/outputs and previews
sed -n '11,22p' studio/sanity.cli.ts
find studio/static/images/preview -maxdepth 1 -type f -print | sort
rg -n '_type: "(hero-1|hero-2|section-header|split-row|grid-row|carousel-1|carousel-2|timeline-row|cta-1|logo-cloud-1|faqs|form-newsletter|all-posts)"' frontend/sanity.types.ts

# Confirm the current absence of a test suite
rg --files -g '!node_modules' -g '!.next' | \
  rg '(^|/)(__tests__|tests?|specs?)(/|\\.)|\\.(test|spec)\\.'
```
