# Plan: Automatic Person JSON-LD for Jimmy Vercellino
_Locked via grill — by Claude + Ovi_

## Goal
Every content page on the site emits exactly one `Person` JSON-LD entity for Jimmy Vercellino, rendered from the `(main)` layout so no editor action is ever required. The entity carries a stable `@id` (`<siteUrl>/#jimmy`) that future schemas (Article `author`, About page) can reference. Person only — no separate top-level Organization, LocalBusiness, Article, or breadcrumb entities in this pass (a nested `worksFor` Organization literal inside the Person is fine).

## Approach
1. **Data is a hardcoded typed constant** — no Sanity fetch, no schema changes. This data (name, NMLS ID, military service, employer, social profiles) changes essentially never; hardcoding literally guarantees "no editor action required", keeps the root layout fetch-free, and makes the builder trivially testable. Grill decision: chosen over extending the `settings` schema or reading the `teamMember` doc.
2. **Builder** — pure function in `frontend/lib/person-json-ld.ts`, mirroring `frontend/lib/faq-json-ld.ts`:
   - `createPersonJsonLd(siteUrl: string)` returns the `Person` object. Normalizes `siteUrl` by stripping a trailing slash before building `@id`, `url`, and `image`.
   - Fields:
     - `"@context": "https://schema.org"`, `"@type": "Person"`
     - `"@id": `${siteUrl}/#jimmy``
     - `name: "Jimmy Vercellino"`
     - `jobTitle: "Mortgage Loan Originator"`
     - `description: "Mortgage Loan Originator (NMLS #184169) at Luminate Bank. U.S. Marine Corps veteran, Operation Iraqi Freedom."` (VA-loans angle deliberately dropped — that positioning belongs to his other site)
     - `identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: "184169" }`
     - `worksFor: { "@type": "Organization", name: "Luminate Bank" }` (nested literal value, not a separate top-level Organization entity)
     - `url: siteUrl`
     - `image: `${siteUrl}/images/jimmy-vercellino.jpg`` (static file at `frontend/public/images/jimmy-vercellino.jpg` — currently in the working tree untracked, full-res 4024×6048/2.7 MB; committing it is part of this change, and Ovi re-crops it to 1200×1200 square)
     - `sameAs`: `https://www.youtube.com/@JimmyVercellino`, `https://www.linkedin.com/in/jimmy-vercellino-29060930/`, `https://www.facebook.com/TheVercellinoTeam`, `https://www.instagram.com/jimmyvercellino_/`, `https://twitter.com/phxhomeloan`, `https://www.valoansforvets.com/` (cross-links his VA-loans site to consolidate identity)
   - Since every field is a non-empty literal, no omit-empty machinery is needed; the type simply has no nullable fields. (The "omit empty fields" requirement is satisfied by construction.)
   - `serializePersonJsonLd(value)` — `JSON.stringify(value).replace(/</g, "\\u003c")`, same escaping as the FAQ serializer.
3. **Runtime-validated site URL** — a single shared export (e.g. `frontend/lib/site-url.ts`) that asserts `process.env.NEXT_PUBLIC_SITE_URL` at runtime (same `assertValue` pattern as `frontend/sanity/lib/env.ts`), used by both the JSON-LD component and the root layout's `metadataBase` (replacing the bare `!`). The component never receives `string | undefined`.
4. **Component** — `frontend/components/person-json-ld.tsx`, mirroring `faq-json-ld.tsx`: takes the validated site URL, renders one `<script type="application/ld+json">` via `dangerouslySetInnerHTML`.
5. **Render from the `(main)` layout** — add `<PersonJsonLd />` in `frontend/app/(main)/layout.tsx`, next to the footer that visibly identifies Jimmy on every content page. Deliberately NOT the root layout: the root also wraps the 404 page, whose only visible content is "Page not found" — emitting a Person there would claim the page is about Jimmy, against Google's relevance guidance. `(main)` wraps every real page (home, all `[...slug]` pages, blog); JSON-LD in `<body>` is valid and is the pattern the FAQ schema already uses. Read `frontend/node_modules/next/dist/docs/` for this Next version's layout/JSON-LD guidance before touching the layout.
6. **Tests** — focused vitest in `frontend/lib/person-json-ld.test.ts`: correct entity shape from a base URL; trailing-slash normalization (`https://x.com/` and `https://x.com` produce identical output); serialization neutralizes `<`; `@id` ends with `/#jimmy`. Plus one lightweight component render test asserting a single parseable script tag. No route-level integration harness — the "exactly once" guarantee is structural (one render site in one layout) and confirmed by live verification below.
7. **Verification** — `pnpm typecheck` (or the repo's equivalent), full frontend test suite, production build. Then render pages in the dev preview: exactly one `Person` script on a normal page and on an FAQ page (FAQ script unaffected), none on an unmatched URL (404), JSON parses, fields match the plan. Optionally paste the JSON into the Schema Markup Validator manually.

## Key decisions & tradeoffs
- **Hardcode over CMS.** Editors cannot change this data without a deploy — accepted: the data is near-immutable and the alternative costs schema fields, a root-layout fetch with caching/draft-mode questions, and a per-dataset editor task that can silently produce a thinner schema.
- **Static headshot on own domain** over Sanity CDN URL: dataset-independent, survives re-uploads, always resolvable by Google.
- **`@id` derived from `NEXT_PUBLIC_SITE_URL`** rather than hardcoded production URL: production emits exactly `https://phxhomeloan.com/#jimmy`; dev/preview emit their own base (harmless — non-production is noindexed) and stay internally consistent with `metadataBase` and all other absolute URLs.
- **jobTitle "Mortgage Loan Originator"** over the team page's "Producing Branch Manager" (searchability, matches NMLS licensure) — mild inconsistency with visible team-page copy accepted.
- **`sameAs` includes brand-flavored profiles** (X `@phxhomeloan`, Facebook `TheVercellinoTeam`) — deliberate user decision, reviewed and kept: these are properties Jimmy operates as his public presence; the strict-ambiguity reading of `sameAs` was considered and rejected.
- **Rendered from `(main)` layout, not root** — keeps the Person entity off the 404 page, whose content doesn't mention Jimmy, while still covering every real page (all of which show his footer contact card).
- **`worksFor` as nested literal Organization** — expresses the employment relation without introducing a standalone Organization schema (explicitly out of scope).

## Risks / open questions
- The committed headshot is currently the full-res 4024×6048 portrait (2.7 MB); Ovi re-crops it to 1200×1200. Until then the URL works but is heavyweight — no blocker, image URL semantics don't change.
- `sameAs` URLs are point-in-time snapshots of his profiles; a renamed handle needs a code change. Accepted per the hardcode decision.

## Out of scope
- Article, Organization, LocalBusiness, breadcrumb, or any other schema types.
- Referencing the Person from Article/author (future pass will use the stable `@id`).
- Sanity schema changes of any kind.
- Changing visible page content or the team page.
