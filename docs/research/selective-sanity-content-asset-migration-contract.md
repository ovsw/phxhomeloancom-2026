# Selective Sanity content and asset migration contract

## Decision

Implement one manifest-driven migration module with five explicit operations: `plan`, `stage`, `validate`, `publish`, and `rollback-plan`.

- `plan` is the default and is strictly read-only. It pins the source snapshot, computes the dependency-closed transform, inventories target collisions through an authenticated `raw` perspective, downloads and hashes the 11 source images, validates the transformed documents, and emits a review bundle plus its SHA-256 digest.
- `stage` is unavailable unless a maintainer has approved that exact digest. It uploads only the approved assets and writes the ten transformed content documents as drafts. It never publishes content.
- `validate` proves the staged graph, Page Builder contract, Presentation behavior, and zero-post behavior without changing content.
- `publish` has a second approval gate bound to the validated bundle digest. It rechecks every source revision and target precondition before publishing referenced documents first and pages second, with Home last.
- `rollback-plan` is read-only. It derives the inverse actions from the pre-stage target snapshot and the mutation receipt. Any rollback execution is a separate destructive action requiring its own approval.

This should be a custom `@sanity/client` module, not a whole-dataset copy or a blind `sanity dataset import --replace`. The narrow interface earns its seam by concentrating source pins, transforms, identity mapping, collision policy, approvals, receipts, validation, and recovery in one place. Sanity's import tool can replace existing IDs, but that is too broad for the existing V2 Home document and cannot express this contract's semantic collision review or draft-first gate ([Sanity importing data](https://www.sanity.io/docs/content-lake/importing-data)).

No Sanity dataset was mutated while resolving this ticket.

## Authoritative endpoints and snapshot

| Role | Project / dataset | API version | Perspective |
| --- | --- | --- | --- |
| V1 source | `e4y15utr` / `production-v2` | `2025-08-29` | `published`, Stega disabled |
| V2 target | `hv0545v9` / `production` | `2026-03-23` | authenticated `raw` for planning; `drafts` for staged validation; `published` for launch validation |

The four pinned V1 revisions still matched the live published source on 2026-07-31:

| Route | Source document | Source type | Source revision | Target slug | Current target disposition |
| --- | --- | --- | --- | --- | --- |
| `/` | `homePage` | `homePage` | `3NHMz2D08XS0FRS44z4bbV` | `index` | Update existing page `20228855-9ff0-453f-809e-e24ce78f0491`, currently at revision `uRAaNS3DcI72FPZjqeJ1j8` |
| `/our-team` | `kRTGqiPtwZ1pXIol9E5iGF` | `page` | `jrGondNvXH2thrLSSob87Y` | `our-team` | Create with a generated target UUID |
| `/phoenix-loan-originator` | `mystory` | `page` | `3NHMz2D08XS0FRS452v7ak` | `phoenix-loan-originator` | Create with a generated target UUID |
| `/contact` | `contactMe` | `page` | `KEqdEdvzfB7fb5MaXif9Qi` | `contact` | Create with a generated target UUID |

The current target dispositions above come from a public `published` query, not an authenticated all-version inventory. They are evidence for the plan, not permission to write. A later draft, release version, matching source ID, matching semantic identity, or target revision change invalidates the plan and requires a new bundle and approval. Sanity documents the `raw` perspective as returning published, draft, and release versions side by side for authenticated requests ([Sanity perspectives](https://www.sanity.io/docs/content-lake/perspectives)).

## Exact migration scope

### Content documents

The content allowlist contains exactly ten logical documents:

1. The four route documents above, transformed to V2 `page` documents.
2. Three V1 `faq` documents, transformed to V2 `faq` documents:
   - `faq-home-faq-loan-types` at revision `wyBoXRpm5psD7comxCACfX`
   - `faq-home-faq-conventional-mortgage` at revision `wCKSa6ZolfDZcVa7wnhcfv`
   - `faq-home-faq-fha-mortgage` at revision `kRTGqiPtwZ1pXIol9EsEHN`
3. Three V1 `teamMember` documents, transformed to V2 `team-member` documents:
   - `kRTGqiPtwZ1pXIol9E5hNx` at revision `wVGk2y5qfSmFJfPDRX347Y`
   - `wyBoXRpm5psD7comxC0xU7` at revision `wVGk2y5qfSmFJfPDRX34IL`
   - `4t9n08s0qRtngWyh9gAwrt` at revision `fQCzqycfrifaVEP2JkbwwT`

### Image assets

The asset allowlist contains exactly these eleven source images:

```text
image-201875f1e4d9e7b70df0616f07f04bc8171e747f-1280x720-jpg
image-599b4fbb51446a203e50e6bc23a81fe4e0ab18b8-4024x6048-jpg
image-5d3e458221438d55a15b5b3e9b3d04f80e1111f9-552x2288-jpg
image-869d0d9b0315c19a76a7b23ef76e5945a22ddf2d-1144x1323-jpg
image-9e4bc27d67d0d7c560881f3bab6af1531d5ccc09-2848x4287-jpg
image-b6f3a25737c58c82dd1931125c34f8577a1e60d8-960x806-png
image-e43cf9ebe4d78176b7fe24d0b3bd178779a59d1a-1536x1024-jpg
image-e783e7f1e352989da5421c5380aa2086bb66ce64-1122x1402-png
image-e99e26801f1ab5fb81ef99d52ab6f157cd602315-574x596-jpg
image-e9a1c04a7c55ed207780d61aa6e03619b6fb7340-1022x858-png
image-f75b433768b8d1c2ba00078aedd99e952d704401-770x962-jpg
```

The plan records two distinct kinds of evidence: the source asset document's ID, `sha1hash`, filename, MIME type, size, and dimensions; and the bytes actually downloaded from its source CDN URL, including an independently calculated SHA-256, byte length, MIME type, and decoded dimensions. It does not require the downloaded-byte hash to equal the source asset document's metadata hash: a live check found seven of the eleven CDN responses differed at the byte-hash level while four matched. Instead, repeated downloads must reproduce the approved download hash and decoded shape. Stage uploads that exact approved binary with `client.assets.upload()`, verifies the returned target asset metadata against the uploaded binary, and uses the returned target asset document ID in every transformed reference. It never predicts a target asset ID. Sanity derives asset paths from content hashes and deduplicates identical uploads, but the returned target ID remains the authoritative mapping ([Sanity asset management](https://www.sanity.io/docs/content-lake/manage-assets)).

The repository-owned `apps/web/public/brand/phx-award-trophy.png` is application-source work, not a Sanity asset migration. Its copy belongs to an implementation slice, not this dataset operation.

### Explicit exclusions

The extractor, transformer, and mutation recorder reject any content document outside the ten-document allowlist and any asset outside the eleven-asset allowlist.

- Do not migrate V1 `blog`, `post`, or `category` documents.
- Do not migrate the six images reached only through the V1 `latestArticles` subquery.
- Do not delete, replace, or patch any existing V2 `post` or `category` document.
- Do not copy V1 global settings, navigation, footer, redirects, drafts, releases, or unused Page Builder content.
- Do not mutate schema, application code, Studio configuration, or deployment settings from the migration command.

On 2026-07-31 the public V2 snapshot contained one published `post` and zero published `category` documents. That count is not a migration precondition and may drift. The contract is that posts and categories are outside the write set.

## Review bundle and approval binding

`plan` emits a self-contained review directory. Generated source snapshots, transformed payloads, and credentials are not committed; the mapping and reports may be committed when they contain no secrets or personal data beyond the approved content.

```text
migration/selective-v1-pages/
  manifest.json
  source-snapshot.json
  transformed-documents.ndjson
  assets.json
  target-preflight.json
  mutation-plan.json
  validation-plan.json
  report.md
```

The digest covers every file above plus:

- the source and target project, dataset, API version, and perspective;
- the ten source IDs and revisions;
- the eleven source asset IDs and binary hashes;
- the source-to-target identity map;
- every target ID, expected target revision, and collision disposition;
- the transform version or Git commit;
- the exact create, update, asset-upload, publish, and excluded-type counts.

`stage` requires both `--apply` and `--approved-plan-sha256 <digest>`. It rejects a digest not equal to the freshly recomputed bundle digest. Approval should be recorded in the implementation issue or pull request by a maintainer who reviewed `report.md` and `mutation-plan.json`; a generic `--yes` flag is not sufficient.

After staged validation, `publish` requires a second digest over the original plan, mutation receipt, staged validation report, and the fresh pre-publish target inventory. This separates permission to create private drafts/assets from permission to change published visitor content.

No write token is needed for the public source snapshot. The authenticated target read token used by `plan` and the write token used by `stage`/`publish` must come from environment variables and must never enter the bundle, log, command line output, or Git.

## Identity and collision contract

### Document IDs

- Preserve the existing V2 Home page ID. Do not create a second `index` page.
- Allocate random Sanity-compatible UUIDs for the other three pages, three FAQs, and three team members during `plan`, then persist them in the approved manifest. Do not derive public IDs from V1 IDs, slugs, names, emails, or NMLS values.
- Draft paths are formed from the approved public target IDs with Sanity's ID utilities. References always point to the public target ID so draft and published perspectives resolve the same logical document.
- Do not copy V1 document IDs into V2. Store source identity in the external manifest; add a schema-level migration provenance field only if the later schema implementation explicitly approves one.
- Never use dots in a public document ID. Dots are reserved here for Sanity's private `drafts.` and `versions.` paths.

Sanity recommends generated IDs for ordinary documents and a separate field when a custom external identity must be stored. Its supported UUID helper exists for scripts that need to allocate compatible IDs ([Sanity IDs and paths](https://www.sanity.io/docs/content-lake/ids)).

### Collision classes

The authenticated `raw` target preflight checks all of these before the plan can be approved:

1. Exact target public ID, draft path, and release-version collisions.
2. Page slug collisions for `index`, `our-team`, `phoenix-loan-originator`, and `contact`.
3. FAQ candidates by normalized title and content fingerprint.
4. Team-member candidates by NMLS ID, case-insensitive email, and normalized name, reporting disagreements rather than choosing one field silently.
5. Asset candidates by content hash, dimensions, and MIME type.
6. Any inbound target references to a document the plan would update or supersede.

Each logical item receives exactly one reviewed disposition: `update-existing`, `reuse-identical`, `create`, or `abort`. There is no implicit merge, last-write-wins behavior, slug-based replacement, or source-ID overwrite.

The current published snapshot classifies Home as `update-existing` and the other nine content documents as `create`; no source document ID, FAQ, team member, or required asset ID was present. These classifications must be recomputed from authenticated raw data at implementation time.

### Concurrency and reruns

- Every update records the target `_rev` observed during planning and is guarded by that revision. A changed revision aborts rather than overwriting editorial work. Sanity supports optimistic locking with `ifRevisionID` and returns a conflict when the expected revision no longer matches ([Sanity transactions](https://www.sanity.io/docs/content-lake/transactions)).
- A rerun of the same approved plan is a no-op when existing staged or published documents exactly match the approved payload.
- A rerun aborts when an approved target ID exists with different content, when a draft/release appeared, or when source revisions changed. It never silently regenerates IDs or updates the approval digest.
- Schema validation is not enforced automatically by API mutations, so transformed fixtures and staged documents must be validated explicitly ([Sanity client mutations](https://www.sanity.io/docs/apis-and-sdks/js-client-mutations)).

## Transform contract

The field-level source-to-target contract is owned by [Define the minimal V1 block contract for V2](v2-minimal-v1-block-contract.md), and route/SEO adjustments are owned by [Lock routing, SEO, and Presentation behavior for the four routes](v2-four-route-routing-seo-presentation-contract.md). This migration consumes those decisions rather than restating or weakening them.

The migration-specific invariants are:

- Transform all V1 camel-case top-level identities to the 17 approved hyphenated V2 identities. V1 identities may appear only in the source snapshot and mapping report.
- Preserve existing source `_key` values for corresponding array items when they are valid and unique. Generate and persist a stable new `_key` only for newly introduced values, including Contact's added `page-header` block.
- Produce four V2 `page` documents with route block counts `7`, `2`, `7`, and `4`, totaling 20 instances. Contact gains the approved `page-header` before its three migrated blocks.
- Map V1 FAQ `richText` to V2 FAQ `body` and point `faq-accordion` reference wrappers to the mapped V2 FAQ public IDs.
- Map V1 `teamMember` to V2 `team-member` and point `team-members` reference wrappers to the mapped V2 team-member public IDs.
- While those targets exist only as drafts, stage each reference with `_weak: true` and `_strengthenOnPublish` metadata. Publish the referenced documents first, then remove the staging properties as the referring pages publish so the final graph contains ordinary strong references. Sanity documents this lifecycle for programmatically created references to unpublished targets ([Sanity reference type](https://www.sanity.io/docs/studio/reference-type)).
- Rewrite every image reference through the asset map returned by target uploads. Preserve hotspot/crop and place nonblank alt text on each V2 image field from the approved block-local source fallback; the empty V1 asset-level `altText` is not copied as valid alt text.
- Normalize the four page slugs, metadata, internal links, Contact heading, and the approved `#meet-jimmy` / `#contact` fragment targets exactly as the route contract requires.
- Transform `latestArticles` only into the V2 `latest-articles` block. Do not follow or snapshot its dynamic article subquery.

The pinned V1 renderer already returns `null` when `articles` is empty. The V2 block contract keeps that behavior while querying at most six V2 `post` documents. A zero-post fixture must therefore yield a valid page query result and no rendered `latest-articles` section; it must not trigger post/category seeding.

## Stage, validate, and publish

### Stage

After the first approval:

1. Re-query the pinned source revisions and authenticated raw target preconditions. Abort on drift.
2. Upload the eleven approved binaries with low concurrency. Record whether each target asset was reused or newly created and record its returned ID.
3. Rewrite all transformed image references through that receipt and validate the final payload again.
4. Write the ten content documents as drafts. References to the six draft-only FAQ/team-member targets use the approved weak-to-strong publication metadata above. Existing matching drafts make the operation a no-op; differing drafts abort. Do not publish.
5. Emit a mutation receipt containing request IDs, target IDs/revisions, asset results, and any unreferenced assets left by a failed document transaction.

Asset uploads cannot share the content-document transaction. If an upload succeeds and a later step fails, the content transaction remains unapplied and the receipt makes the immutable/deduplicated asset state explicit for a safe rerun or separately approved cleanup.

### Validate

Validation must prove all of the following before publication can be approved:

- Exactly ten mapped content documents and eleven logical assets; no unexpected source document or transitive reference entered the graph.
- Four draft-perspective pages at the exact slugs and block counts `7/2/7/4`, with the exact 17-identity union.
- Three FAQ and three team-member reference targets. During staging, reference wrappers retain `_key`/`_ref`, `_weak: true`, and the approved `_strengthenOnPublish` metadata, and the draft validation query resolves the mapped draft or public target explicitly. Strong-reference validation happens after the referenced documents and then the referring pages publish.
- Every image reference resolves to a target asset whose checksum, MIME type, and dimensions match the source manifest; every required V2 image field has nonblank alt text.
- No target reference points at a V1 project URL or a V1 document ID.
- The mutation receipt contains no `blog`, `post`, or `category` write and no V1 dynamic article image.
- Query contract tests cover zero posts, at-most-six ordering, unresolved references, all 17 branches, and the exact image interface.
- Schema extraction/TypeGen, typecheck, lint, frontend build, Studio build, four route previews, and Presentation field-editing smoke checks pass against the staged drafts.
- The existing V2 published Home and any unrelated content remain unchanged before the publication gate.

### Publish

After the second approval:

1. Re-run the source-revision and authenticated raw target preflight.
2. Publish the three FAQs and three team members first.
3. Publish the three newly created non-Home pages, strengthening their FAQ/team-member references by removing `_weak` and `_strengthenOnPublish` only after the referenced public IDs exist.
4. Publish Home last, strengthening its FAQ references and only while its published revision still matches the approved precondition.
5. Re-run the complete published-perspective validation, prove that every staged weak reference is now strong, and record the resulting IDs/revisions.

If the project supports an approved Content Release workflow, the staged documents may be grouped and released together; the contract does not assume that capability. Without it, failure stops the sequence and produces an exact recovery report. It never retries against changed revisions automatically.

## Recovery contract

The plan archives the pre-stage representation and revision of every target document it may affect. The receipt distinguishes pre-existing documents, created documents, reused assets, and newly uploaded assets.

- Before publication, rollback normally means deleting only manifest-created drafts; the existing published Home remains untouched.
- After partial publication, restore the previous Home fields with a revision guard, unpublish or delete only manifest-created published documents after inbound-reference checks, and leave pre-existing/reused assets intact.
- Newly uploaded assets are cleanup candidates only when the receipt proves they were created by this run and a fresh `references(assetId)` query is empty.
- Never perform rollback from stale evidence, and never fold destructive rollback execution into `stage`, `validate`, or `publish`.

## Evidence and limitations

Local first-party evidence:

- [Pin the V1 reference and protected V2 baseline](v1-reference-and-v2-baseline.md)
- [Inventory the selected V1 route content graph](v1-selected-route-content-graph.md)
- [Define V1 dependency adaptation into V2](v1-dependency-adaptation-into-v2.md)
- [Define the minimal V1 block contract for V2](v2-minimal-v1-block-contract.md)
- [Lock routing, SEO, and Presentation behavior for the four routes](v2-four-route-routing-seo-presentation-contract.md)

Official Sanity evidence:

- [IDs and paths](https://www.sanity.io/docs/content-lake/ids)
- [Perspectives](https://www.sanity.io/docs/content-lake/perspectives)
- [Creating and updating documents](https://www.sanity.io/docs/apis-and-sdks/js-client-mutations)
- [Transactions and optimistic locking](https://www.sanity.io/docs/content-lake/transactions)
- [Reference type and strengthening unpublished references](https://www.sanity.io/docs/studio/reference-type)
- [Drafts](https://www.sanity.io/docs/content-lake/drafts)
- [Upload, query, and delete assets](https://www.sanity.io/docs/content-lake/manage-assets)
- [Importing data](https://www.sanity.io/docs/content-lake/importing-data)

The target collision findings in this report use unauthenticated published data because no target credential was needed or exposed during research. They cannot rule out private drafts or release versions. That limitation is why an authenticated raw-perspective inventory is a hard planning precondition rather than a post-write check.
