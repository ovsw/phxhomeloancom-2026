# V2 minimal V1 block contract

Research for [Define the minimal V1 block contract for V2](https://github.com/ovsw/phxhomeloancom-2026/issues/8).

Evidence was captured read-only on 2026-07-31 from:

- V1 code `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a` in `/Users/ovs/Work/Dev/phx/phxhomeloan.com-2026`;
- V1 Sanity project `e4y15utr`, dataset `production-v2`, API version `2025-08-29`, `perspective=published`, Stega disabled;
- V2 code `6baad174d4105b8a6483b38cf7b4cdd0b1438129` in this checkout. The application and catalog source is unchanged from the protected `b8504a2bf6099cbfe73785e1b0cfbeff3e835912` baseline; the intervening commits add research documents only.

The four V1 page revisions still matched the pinned baseline during this ticket:

| Route | Revision |
| --- | --- |
| `/` | `3NHMz2D08XS0FRS44z4bbV` |
| `/our-team` | `jrGondNvXH2thrLSSob87Y` |
| `/phoenix-loan-originator` | `3NHMz2D08XS0FRS452v7ak` |
| `/contact` | `KEqdEdvzfB7fb5MaXif9Qi` |

No Sanity content was mutated.

## Decision

V2 needs exactly **17 top-level Page Builder identities**. They preserve the selected V1 block concepts and fields but use V2's hyphenated public identity convention. The V1-to-V2 identity map is one-to-one:

| V1 source `_type` | V2 `_type` |
| --- | --- |
| `awardCta` | `award-cta` |
| `bigVideoFeature` | `big-video-feature` |
| `contactForm` | `contact-form` |
| `editorialChapter` | `editorial-chapter` |
| `faqAccordion` | `faq-accordion` |
| `homeHero` | `home-hero` |
| `latestArticles` | `latest-articles` |
| `loanFeatureCards` | `loan-feature-cards` |
| `locationMap` | `location-map` |
| `pageHeader` | `page-header` |
| `personContactCta` | `person-contact-cta` |
| `personCta` | `person-cta` |
| `phxEmbedSocialReviews` | `phx-embed-social-reviews` |
| `storyFeature` | `story-feature` |
| `teamMembers` | `team-members` |
| `videoFeature` | `video-feature` |
| `youtubeChannelFeature` | `youtube-channel-feature` |

The V1 camel-case identities are migration inputs, not compatibility aliases. V2 must not register both spellings. The migration specification must translate `_type` values and nested shapes before import.

The current 13 V2 top-level identities and all 23 dependency-closed legacy schema identities remain retired as decided by [Draw the V2 Page Builder catalog removal boundary](https://github.com/ovsw/phxhomeloancom-2026/issues/4). None is a temporary alias or hidden insert-menu entry.

## Domain model

- A **top-level block identity** is an object editors can insert directly into `page.blocks`. It appears in the Page schema, one insert-menu group, one conditional GROQ projection, the generated `PAGE_QUERY_RESULT` union, the dispatcher, and one preview image.
- A **nested schema identity** is a registered object, array, or document used through a top-level block. It never appears in `page.blocks`, the top-level insert menu, the top-level dispatcher, or the top-level preview exact set.
- A **projected result** such as a latest-article card or a dereferenced FAQ is a query result, not a Studio schema identity.
- The **Page Builder seam** remains `page.blocks` -> `PAGE_QUERY` -> TypeGen -> `Blocks`. Routes and layouts do not learn individual block identities.

## Shared and nested schema contract

Reuse these protected V2 identities instead of recreating V1's `button` and `customUrl` types:

| Existing identity | Contract for the replacement catalog |
| --- | --- |
| `link` | Button/action object. Require `title`; allow optional `description` and `buttonVariant`; require exactly one valid internal page/post reference or authored external `href`; allow `target` only for external links. The query resolves `index` to `/`, pages to `/<slug>`, posts to `/blog/<slug>`, and external URLs verbatim. Invalid destinations project `null`; renderers omit them. No `#` fallback. |
| `button-variant` | Reuse the existing values. They already cover V1's `default`, `secondary`, `outline`, and `link` values. |
| `faq` | Keep the V2 document identity and `title`/`body` contract. Migration maps V1 `richText` to V2 `body`; the selected answers contain only normal Portable Text blocks and spans. |
| `post` and `category` | Keep the V2 blog foundation. `latest-articles` queries V2 `post`, never introduces V1 `blog`. Zero matching posts is valid. |
| Sanity `image` | Use hotspot/crop plus `alt`. A shared field factory must require non-blank alt text whenever an asset is present. It is a schema helper, not a registered identity. |

Add exactly these registered nested identities:

| Identity | Kind | Fields and invariant | Consumers |
| --- | --- | --- | --- |
| `section-rich-text` | array | Portable Text blocks with `normal`, `h2`, `h3`, `h4`, bullet/number lists, strong/emphasis, and the V2 link annotation. No `h1`, embedded script, arbitrary iframe, or code member. | General block copy and `team-member.bio` |
| `story-rich-text` | array | `normal` and `blockquote`, bullet/number lists, strong/emphasis, V2 link annotation; at most one blockquote. | `story-feature.richText` |
| `chapter-rich-text` | array | Normal paragraphs with strong/emphasis and V2 link annotation; no headings, lists, or embedded objects. | `editorial-chapter.richText` |
| `key-details` | object | Optional `title`; required `items` of 1-8 non-blank strings. | `story-feature`, `person-cta` |
| `loan-feature-card` | object | Required `title`, controlled `icon`, one or more non-blank `bullets`, and a valid `link`; preview title plus icon. | `loan-feature-cards.cards` |
| `statistic` | object | Required `value` and `description`; preview value plus description. | `page-header.statistics` |
| `quote-callout` | object | Required `quote`, optional `context`; preview quote plus context. | `editorial-chapter.supportingContent` |
| `proof-point` | object | Required `title` and `description`; preview both. | `proof-points.items` |
| `proof-points` | object | Required 2-3 `proof-point` items; preview item count. | `editorial-chapter.supportingContent` |
| `impact-statement` | object | Required `statement`, `label`, and `description`; preview statement plus label. | `editorial-chapter.supportingContent` |
| `channel-fact` | object | Required `value` and `label`; preview both. | `youtube-channel-feature.facts` |
| `office-hours-row` | object | Required `days` and `hours`, each at most 60 characters; preview both. | `contact-form.officeHours` |
| `form-field-copy` | object | Required `label` (max 40) and `placeholder` (max 120). | Four `contact-form` field-copy objects |
| `person-contact-method` | object | Required `type`, `label`, and `href`; `phone` requires `tel:`, `email` requires `mailto:`, `address` requires HTTPS; preview label plus type. | `person-contact-cta.contactMethods` |
| `postal-address` | object | Required `street`, `city`, `region`, `postalCode`, and `country`. | `location-map.address` |
| `team-member` | document | Required `name`; optional `role`, `nmlsId`, email-validated `email`, `phone`, alt-bearing `image`, `section-rich-text` `bio`, and positive integer `sortOrder`; preview name, role, image. | `team-members.members` references |

`office-hours-row`, `form-field-copy`, `person-contact-method`, `postal-address`, and the editorial objects are registered because they are named nested blocks with their own validation, preview, projection, and parent rendering logic. They are not top-level Page Builder blocks.

The selected content needs only `block`, `span`, and the named nested values above. The drift check found `normal`, `h3`, and `blockquote` as the complete stored Portable Text style set; no selected block or FAQ contains a mark definition or embedded Portable Text object.

## Top-level schema and renderer contract

`*` means publish-required. `Image` means hotspot/crop plus conditional alt validation. All array items retain `_key`.

| V2 identity | Schema fields | Renderer and deterministic draft failure |
| --- | --- | --- |
| `home-hero` | `marketPositioning*`, `servicePromise*`, `richText: section-rich-text`, `buttons: link[]`, `portraitImage: Image`, `backgroundImage: Image`, `mobileBackgroundImage: Image` | Omit the block if either primary heading is absent. Missing optional media/copy/actions use the renderer's deliberate media-free layout; invalid actions are omitted. |
| `loan-feature-cards` | `useCreamBackground`, `eyebrow`, `title*`, `cards: loan-feature-card[1...]` | Filter invalid cards; omit the block if none remain. `useCreamBackground` maps only to white/cream surface behavior. |
| `video-feature` | `useCreamBackground`, `eyebrow`, `title*`, `richText: section-rich-text`, `buttons: link[]`, HTTPS `youtubeUrl*`, `thumbnailImage: Image` | Accept only YouTube/youtu.be/youtube-nocookie hosts with a valid video id. Omit the playback surface for invalid draft URLs; never embed an arbitrary host. |
| `phx-embed-social-reviews` | `iframeTitle*`, HTTPS `iframeSrc*`, optional HTTPS `resizerScriptSrc` | Allow only the known EmbedSocial iframe and resizer hosts. Omit the block for an invalid iframe URL; never execute an arbitrary CMS-authored script URL. |
| `latest-articles` | `useCreamBackground`, `eyebrow`, `title*`, `description`, `buttons: link[0...1]`, `fallbackImage: Image` | Query at most six V2 posts. Zero posts returns `null`. Missing post images use `fallbackImage`; missing both renders a media-free card. Invalid post slugs are excluded, not linked to `#`. |
| `faq-accordion` | `eyebrow`, `title*`, `subtitle`, optional `link`, unique `faqs: reference(faq)[1...]` | Preserve reference order and filter unresolved references. Omit the block if none resolve. Reference wrappers keep `_key` and `_ref`; the dereferenced document remains separately editable. |
| `award-cta` | `highlight*`, `title*`, `description`, `buttons: link[]` | Omit the block if either award statement part is absent. The trophy remains a repository-owned renderer asset, not editable Sanity content. |
| `page-header` | `eyebrow`, `title*`, `description`, `statistics: statistic[0...3]` | Omit the block without a title; filter incomplete statistics. The renderer owns the page `h1`; rich-text fields cannot introduce another `h1`. |
| `team-members` | `useCreamBackground`, `eyebrow`, `title`, `richText: section-rich-text`, unique `members: reference(team-member)[1...]` | Preserve authored reference order and filter unresolved documents. Omit the block if no member resolves. Each member's fields target the `team-member` document in Presentation. |
| `story-feature` | `useCreamBackground`, `eyebrow`, `title*`, `image: Image*`, `imageCaption`, `richText: story-rich-text*`, `keyDetails: key-details`, `buttons: link[0...2]` | Omit without title, image, or narrative. A missing optional caption/details/actions does not fail the block. |
| `big-video-feature` | `eyebrow`, `title*`, `description`, HTTPS `youtubeUrl*`, `thumbnailImage: Image` | Same YouTube allowlist/id rule as `video-feature`. Custom thumbnail wins; otherwise use the privacy-enhanced YouTube thumbnail behavior. |
| `editorial-chapter` | `useCreamBackground`, `eyebrow`, `title*`, `richText: chapter-rich-text*`, `supportingContent: (quote-callout | proof-points | impact-statement)[0...2]` with unique member types | Omit without title or narrative. Filter invalid optional supporting modules; never render a one-item `proof-points` layout. |
| `youtube-channel-feature` | `eyebrow*`, `title*`, `richText: section-rich-text*`, exactly three `channel-fact`, `channelImage: Image*`, `mobileChannelImage: Image`, required YouTube `link` | Omit without its required copy, three valid facts, desktop image, or valid YouTube action. The action must resolve to youtube.com or youtu.be. |
| `person-cta` | `useCreamBackground`, `eyebrow*`, `title*`, `richText: section-rich-text*`, `keyDetails: key-details`, `buttons: link[1...2]`, `personImage: Image*` | Omit when a required invariant fails; filter invalid actions before the 1-2 count. |
| `contact-form` | `useCreamBackground`, `eyebrow*` max 40, `title*` max 100, `description*` max 280, `officeHoursTitle*` max 60, `officeHours: office-hours-row[1...7]`, `formTitle*` max 80, required `nameField`/`emailField`/`phoneField`/`messageField: form-field-copy`, `submitLabel*` max 40, `privacyNote*` max 120, `unavailableMessage*` max 240 | Preserve V1 behavior: prevent submission and display `unavailableMessage`. No endpoint, Server Action, or success claim belongs to this contract. Invalid drafts omit the form block rather than inventing copy. |
| `person-contact-cta` | `useCreamBackground`, `eyebrow*` max 40, `title*` max 100, `contactMethods: person-contact-method[1...4]`, `credentialLine` max 160, `personImage: Image*` | Filter invalid methods; omit if none remain or required title/image is missing. New-tab behavior applies only to HTTPS address destinations. |
| `location-map` | `useCreamBackground`, required `eyebrow`, `title`, `directionsLabel`, HTTPS/HTTP `directionsUrl`, `image: Image`, `imageEyebrow`, `imageTitle`, HTTPS Google `mapEmbedUrl`, `mapTitle`, `businessName`, `credentialLine`, and `address: postal-address` with the V1 maximum lengths | Require Google Maps embed syntax and an accessible `mapTitle`. If an invalid draft embed reaches runtime, omit the iframe while retaining valid address, image, and directions content. |

Schema validation prevents invalid publishing, but TypeGen and every renderer must continue to model draft fields as nullable or undefined. Validation is not a runtime type guarantee.

## Studio registration and preview contract

All 17 top-level schemas and all newly registered nested identities are imported exactly once by `studio/schema-types.ts`.

`page.blocks.of` is exactly the 17 V2 identities. Each appears in exactly one insert-menu group:

| Group | Identities |
| --- | --- |
| `heroes` | `home-hero`, `page-header` |
| `features` | `loan-feature-cards`, `video-feature`, `big-video-feature`, `story-feature`, `editorial-chapter`, `youtube-channel-feature`, `team-members`, `latest-articles`, `phx-embed-social-reviews`, `location-map` |
| `actions` | `award-cta`, `person-cta`, `person-contact-cta` |
| `forms` | `contact-form` |
| `faqs` | `faq-accordion` |

The existing grid/list insert-menu mechanism remains. The exact required preview basenames are:

```text
award-cta.jpg
big-video-feature.jpg
contact-form.jpg
editorial-chapter.jpg
faq-accordion.jpg
home-hero.jpg
latest-articles.jpg
loan-feature-cards.jpg
location-map.jpg
page-header.jpg
person-contact-cta.jpg
person-cta.jpg
phx-embed-social-reviews.jpg
story-feature.jpg
team-members.jpg
video-feature.jpg
youtube-channel-feature.jpg
```

V1 supplies source thumbnails for only eight identities. The implementation must capture or create truthful V2 previews for the other nine; a missing image, copied unrelated preview, or retired preview basename fails the contract.

Every top-level Studio preview selects the block's primary title and, where present, its representative image: home hero portrait; video thumbnails; location/story/person/team/channel images. Text-only previews use the primary title and a fixed block-name subtitle. Nested previews are defined in the nested-type table above.

`team-member` must be available as a normal reusable document in Studio structure. `faq` remains the existing reusable document. Neither appears in `page.blocks`.

## GROQ and TypeGen contract

1. Keep the outer `PAGE_QUERY` and `PAGES_SLUGS_QUERY` seams. `PAGE_QUERY` also projects page `_id` and `_type` so Presentation attributes can identify the source document.
2. Compose exactly 17 conditional block fragments, one per V2 identity. Do not interpolate a V1 24-type superset or retain any retired V2 fragment.
3. Every top-level fragment explicitly returns `_key`, `_type`, and every field its renderer reads. Avoid top-level `...` spreads. Shared protected Portable Text/image fragments may remain broader only where their existing cross-feature interface requires it.
4. Every array projection retains `_key` and `_type`. Nested registered objects explicitly project their renderer fields.
5. Link projection returns `_key`, `_type`, `title`, `description`, `buttonVariant`, `target`, and normalized `href`. Invalid or unresolved destinations become `null`; renderers omit them.
6. Image projection returns the existing V2 image interface needed by `urlFor`/`next/image`: asset id/url/mime type, lqip, dimensions, alt, hotspot, and crop.
7. `faq-accordion` and `team-members` keep reference-wrapper identity:

   ```groq
   faqs[]{_key,_type,_ref,"document":@->{_id,_type,title,body[]{...}}}
   members[]{_key,_type,_ref,"document":@->{_id,_type,name,role,nmlsId,email,phone,sortOrder,image{...},bio[]{...}}}
   ```

8. `latest-articles` performs one bounded V2 subquery:

   ```groq
   "articles": *[_type == "post" && defined(slug.current)]
     | order(_createdAt desc)[0...6]{
       _id,_type,title,excerpt,
       "href":"/blog/" + slug.current,
       "publishedAt":_createdAt,
       image{...},
       categories[]->{_id,_type,title,"slug":slug.current}
     }
   ```

   It does not fetch V1 `blog`, migrate posts, or require a category. `[]` is a valid result.
9. Run the existing extract/generate workflow. Never hand-edit `studio/schema.json` or `frontend/sanity.types.ts`.
10. TypeGen must yield exactly the 17 V2 values for `NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number]["_type"]`. Nested identities must be reachable in generated types but absent from that top-level union.
11. The typed dispatcher map must be exhaustive over the generated top-level union. `latest-articles` receives its articles through `PAGE_QUERY`, so it does not need an `all-posts`-style dispatcher exception or a private fetch.

## Renderer, Presentation, and live-preview contract

- Keep the default `Blocks` module as the route-facing dispatcher. It remains server-capable; interaction owners may introduce private client leaves, but the full Page Builder must not become a client module.
- Extend the dispatcher input only with the page `_id`/`_type` source context required for explicit Presentation paths. Routes continue to know one `Blocks` interface, not individual block implementations.
- Use `_key` for every React array key. Never use an array index where Sanity supplies `_key`.
- Attach the page `blocks` array attribute to the dispatcher container and `blocks[_key=="<key>"]` to each top-level block container. Visible scalar, link, image, and nested-array content receives its exact field path.
- Nested array paths use `_key` selectors, not indices. Referenced FAQ, team-member, and post fields use the referenced document's `_id`, `_type`, and field path; the page reference wrapper remains editable at its page-array path.
- Render Stega-bearing strings unchanged. Call `stegaClean` only before logic such as URL parsing, host allowlisting, equality, date parsing, or class/state selection.
- Keep the existing V2 published/Draft Mode split, `SanityLive`, Visual Editing, cache tags, and Presentation resolver. Do not port V1's page-wide `useOptimistic` renderer or raw/projected reconciliation path; V2 live query results remain the source of rendered preview truth.
- Client leaves receive only JSON-serializable projected values. They do not fetch Sanity data on mount or introduce a duplicate route handler.
- Missing `blocks` or an empty array renders nothing and is valid. A query/result identity not present in the exhaustive renderer map preserves the current V2 unknown-block behavior: warn with the `_type`, render a keyed empty diagnostic node, and continue the page. Contract tests must make such a state fail the exact-set gate before deployment.

## No-shadow and failure gates

The replacement is complete only when all of these are true:

1. The top-level sets extracted from `page.blocks.of`, flattened insert-menu groups, `PAGE_QUERY`, the dispatcher, preview basenames, `studio/schema.json`, and `frontend/sanity.types.ts` are exactly the 17 V2 identities above.
2. Every registered replacement nested identity is transitively reachable from at least one top-level schema, projection, and renderer or is the explicitly referenced `team-member` document. No unused helper/schema/query/renderer/export remains registered.
3. The 23 retired V2 identities and the 17 V1 camel-case identities have an empty intersection with every V2 source/generated top-level set. Migration fixtures may mention V1 names only as input values.
4. Every schema field used by a renderer is present in its projection; every projected business field is consumed by the renderer or justified as source/editing identity (`_id`, `_type`, `_key`, `_ref`).
5. Every visible editable field has Stega or an explicit `data-sanity` path. Images, links, array containers/items, and referenced-document fields cannot rely on visible text alone.
6. Schema validation tests cover required fields, counts, uniqueness, URL schemes/hosts, conditional image alt text, link destination exclusivity, and nested type uniqueness.
7. Query contract tests cover internal page/post URL normalization, unresolved references, complete projections, zero posts, article limit/order, image fields, and all 17 conditional branches.
8. Dispatcher tests cover the exact registry, `_key` identity, empty blocks, unknown types, per-block deterministic failure, and no `all-posts` special branch.
9. Presentation tests edit/reorder one top-level block, one nested array, one image/link, one FAQ, and one team member and verify the rendered preview updates while keeping the correct source document/path.
10. The removal-boundary regeneration, source-deletion, typecheck, lint, frontend build, Studio build, four published-route, and Presentation smoke gates remain mandatory.

## Consequences for the Wayfinder map

- [Define the selective Sanity content and asset migration](https://github.com/ovsw/phxhomeloancom-2026/issues/11) can now specify deterministic V1 camel-case -> V2 hyphenated identity and nested-shape transforms, including `customUrl`/`button` -> `link`, `faq.richText` -> `faq.body`, and `teamMember` -> `team-member`.
- [Define preservation and acceptance gates](https://github.com/ovsw/phxhomeloancom-2026/issues/6) can use the exact 17-identity parity set, nested reachability rule, per-block failure rules, Presentation paths, and zero-post behavior above.
- No new child ticket is needed. The existing adaptation, migration, acceptance, and slicing tickets cover the work exposed by this answer.
- The route-specific implementation slices and cutover order remain fog until the dependency-adaptation and acceptance decisions are complete.

## Evidence

- [Pinned V1/V2 baseline](./v1-reference-and-v2-baseline.md)
- [Selected V1 route content graph](./v1-selected-route-content-graph.md)
- [V2 catalog removal boundary](./v2-page-builder-catalog-removal-boundary.md)
- [Repository Page Builder contract](../agents/page-builder.md)
- [V2 Page schema](../../studio/schemas/documents/page.ts)
- [V2 schema registry](../../studio/schema-types.ts)
- [V2 page query](../../frontend/sanity/queries/page.ts)
- [V2 dispatcher](../../frontend/components/blocks/index.tsx)
- [V2 shared link projection](../../frontend/sanity/queries/shared/link.ts)
- [V2 post query](../../frontend/sanity/queries/post.ts)

V1 source can be reproduced with:

```bash
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 show \
  40936e6:packages/sanity-blocks/src/<block>/<block>.schema.ts
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 show \
  40936e6:packages/sanity-blocks/src/<block>/<block>.groq.ts
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 show \
  40936e6:apps/web/src/components/pagebuilder.tsx
```

## Limitations

- This resolves the data and rendering contract, not the V1 dependency adaptation or visual implementation. Package reuse, private client boundaries, styling, and third-party package choices remain with [Define V1 dependency adaptation into V2](https://github.com/ovsw/phxhomeloancom-2026/issues/7).
- The exact migration operations, ids, collision policy, and approval gate remain with [Define the selective Sanity content and asset migration](https://github.com/ovsw/phxhomeloancom-2026/issues/11).
- No V2 dataset read was needed to decide this contract, and no V1 or V2 dataset was written.
