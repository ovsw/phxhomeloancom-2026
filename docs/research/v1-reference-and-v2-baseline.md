# V1 reference and protected V2 baseline

Research for [Pin the V1 reference and protected V2 baseline](https://github.com/ovsw/phxhomeloancom-2026/issues/5). Evidence was captured read-only on 2026-07-31.

## Decision

- **V1 code reference:** checked-out `chore/improve-codebase` at `40936e6c6bf5cf470cfdfcc4e4d0cdedc1f7893a`. Use the commit, not the moving branch name or V1 `origin/main`. The commit is local-only at capture time, so source citations below use exact `git show <sha>:<path>` commands rather than dead GitHub links.
- **V1 content reference:** Sanity project `e4y15utr`, dataset `production-v2`, API version `2025-08-29`, explicitly queried with `perspective=published`. Normal V1 requests also force `published` with Stega off; authenticated draft sessions resolve a draft/release perspective and enable Stega. Sources: `git show 40936e6:apps/web/.env.example` lines 1–4 and `git show 40936e6:packages/sanity/src/live.ts` lines 16–67. Drafts are an editorial-preview input, not the rebuild baseline.
- **Authoritative V1 rendered reference:** run that exact checkout locally with `pnpm dev:web`, no draft-mode cookie, and observe `http://localhost:3000/`, `/our-team/`, `/phoenix-loan-originator/`, and `/contact/`. This binds the rendered result to the selected code ref and published dataset instead of an older deployment.
- **V2 migration target:** checked-out local `main` at `b8504a2bf6099cbfe73785e1b0cfbeff3e835912`. Use the commit, not V2 `origin/main`, which lagged this checkout by two commits at capture time. This commit is also local-only at capture time; the relative source links below are paired with exact-ref `git show` reproduction commands.
- **V2 destination Sanity environment:** the active checkout is configured for project `hv0545v9`, dataset `production`, API version `2026-03-23`. It is part of the protected V2 foundation and was not queried with writes or mutated.

## Published V1 content snapshot

The public Sanity query endpoint returned HTTP 200 for this query with `perspective=published`:

```groq
{
  "home": *[_type == "homePage" && _id == "homePage"][0]{_id,_type,_rev,_updatedAt,"slug":slug.current},
  "ourTeam": *[_type == "page" && slug.current == "/our-team"][0]{_id,_type,_rev,_updatedAt,"slug":slug.current},
  "originator": *[_type == "page" && slug.current == "/phoenix-loan-originator"][0]{_id,_type,_rev,_updatedAt,"slug":slug.current},
  "contact": *[_type == "page" && slug.current == "/contact"][0]{_id,_type,_rev,_updatedAt,"slug":slug.current}
}
```

Endpoint: `GET https://e4y15utr.api.sanity.io/v2025-08-29/data/query/production-v2?perspective=published&query=<encoded-query>`.

| Route | Published document snapshot |
| --- | --- |
| `/` | `homePage`; rev `3NHMz2D08XS0FRS44z4bbV`; updated `2026-07-21T14:06:22Z` |
| `/our-team` | `kRTGqiPtwZ1pXIol9E5iGF`; rev `jrGondNvXH2thrLSSob87Y`; updated `2026-07-21T13:57:51Z` |
| `/phoenix-loan-originator` | `mystory`; rev `3NHMz2D08XS0FRS452v7ak`; updated `2026-07-22T13:46:06Z` |
| `/contact` | `contactMe`; rev `KEqdEdvzfB7fb5MaXif9Qi`; updated `2026-07-29T10:21:50Z` |

These revisions pin the mutable dataset snapshot used by this finding. Later tickets must re-query and report drift before relying on different revisions.

## Current-branch render evidence

At `2026-07-31T13:20:56Z`, the V1 dev server reported Next.js `16.2.6`, Cache Components enabled, `.env.local` loaded, and successful Sanity reads from `e4y15utr` at API version `2025-08-29`. Fetches followed the canonical trailing-slash redirects:

| Requested route | Final local URL | Status | Title | H1 text |
| --- | --- | ---: | --- | --- |
| `/` | `http://localhost:3000/` | 200 | `Phoenix Mortgage Lender \| PHX Home Loan \| PHX Home Loan` | `Personalized Service for your Home Loan` |
| `/our-team` | `http://localhost:3000/our-team/` | 200 | `Our Team \| PHX Home Loan \| PHX Home Loan` | `The people behind every approval.` |
| `/phoenix-loan-originator` | `http://localhost:3000/phoenix-loan-originator/` | 200 | `Phoenix Loan Originator \| Phoenix Mortgage Lenders \| PHX Home Loan` | `Meet Jimmy Vercellino` |
| `/contact` | `http://localhost:3000/contact/` | 200 | `Contact Jimmy Vercellino \| Phoenix Mortgage Lenders \| PHX Home Loan` | `Contact`; `Let's talk about your home loan.` |

No rendered response contained the V1 `UnknownBlockError` fallback. The root is implemented separately; other selected routes pass through the catch-all route, published cached fetches, metadata path, and `notFound()` behavior. Sources: `git show 40936e6:apps/web/src/app/page.tsx` lines 14–72 and `git show '40936e6:apps/web/src/app/[...slug]/page.tsx'` lines 92–208.

Supporting visual history only: GitHub records a successful Vercel preview for commit [`96e5a7db46e6d7e750bbbd7fbcf0825bf2881edd`](https://github.com/ovsw/phxhomeloan.com-2026/commit/96e5a7db46e6d7e750bbbd7fbcf0825bf2881edd) at `https://phxhomeloan-com-2026-jm9p5kh5g-ovi-savescus-projects.vercel.app`. It predates the authoritative V1 ref and must not replace the local current-branch render baseline.

## Protected V2 contracts

The rebuild may replace the current V2 top-level block catalog, but it must preserve these mechanisms and observable behaviors:

1. **App Router URL model.** `/` resolves the Sanity `page` whose slug is `index`; `/index` permanently redirects to `/`; catch-all routes use slashless Sanity slug values such as `our-team`, generate published static params, generate metadata separately, and call `notFound()` for missing pages ([root route](../../frontend/app/%28main%29/page.tsx), [catch-all route](../../frontend/app/%28main%29/%5B...slug%5D/page.tsx), [redirect](../../frontend/next.config.mjs)). V1's leading-slash stored slugs must be adapted to this model; the V2 router must not be replaced with V1's. Exact-ref lines: root 23–70, catch-all 24–112, redirect 7–15.
2. **Server-first published and draft paths.** Normal traffic uses `published` with Stega off. Draft mode resolves its perspective outside cache boundaries, renders dynamic header/footer paths under Suspense, enables `VisualEditing`, and passes `includeDrafts` to `SanityLive` ([live-fetch policy](../../frontend/sanity/lib/live.ts), [main layout](../../frontend/app/%28main%29/layout.tsx)). Do not port V1's page-wide client renderer wholesale. Exact-ref lines: live policy 12–63, layout 18–50.
3. **Cache Components and Sanity invalidation.** `cacheComponents: true` and the `next-sanity` cache-life profile remain enabled; cached Sanity fetches and tag revalidation remain the performance/freshness mechanism ([Next config](../../frontend/next.config.mjs), lines 1–6; [tag revalidation](../../frontend/app/actions/revalidate.ts), lines 1–29).
4. **Standalone Studio and Presentation.** The separate `studio` app, draft-mode enable route, Presentation resolver for `/`, `/:slug`, and `/blog/:slug`, and the existing frontend/Studio environment seam remain in place ([Studio configuration](../../studio/sanity.config.ts), lines 32–68; [Presentation resolver](../../studio/presentation/resolve.ts), lines 26–39).
5. **Page Builder vertical-slice contract.** A top-level `_type` must agree across Studio schema registration and insert menu, GROQ projection, generated TypeGen output, and the frontend dispatcher; projections must return every renderer field, and generated files are regenerated rather than hand-edited ([repository guide](../agents/page-builder.md), lines 7–45). Blocks retain Sanity `_key` as their React identity. `all-posts` is only a precedent for blocks that genuinely need dispatcher-level `perspective` and `stega`, not a default pattern ([dispatcher](../../frontend/components/blocks/index.tsx), lines 25–74).
6. **Global application seams.** The existing main layout remains the only integration point for Site Header, page content, `SanityLive`, Visual Editing, and Site Footer. Header and footer behavior are governed by their separate implementation-ready specifications; this map does not redesign them.

The **current V2 block identities and their visual implementations are not protected**: replacing that catalog with the dependency-closed minimum for the four selected V1 routes is the map's destination. The protected part is the schema/query/TypeGen/dispatcher machinery and the routing, live-preview, caching, and layout seams around it.

## Limitations

- The four authoritative renders were verified in local development, not a production build, and establish route/content/metadata integrity rather than pixel fidelity, responsive behavior, accessibility, or production performance.
- Sanity is mutable. The document revisions above are the content snapshot; any later mismatch is drift, not evidence that this record used drafts.
- The V1 checkout contained two unrelated untracked Markdown research files. All code facts were read from the immutable `40936e6…` tree, so those files did not affect the baseline.
- No GitHub issue state, Sanity document, application code, configuration, or tracked V1 file was mutated during this research.

## Reproduction commands

```bash
# Pin code identity
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 rev-parse HEAD
git -C /Users/ovs/Work/learn/phxhomeloancom-2026 rev-parse HEAD

# Read source from the pinned local commits, independent of worktree drift
git -C /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026 show 40936e6:packages/sanity/src/live.ts
git -C /Users/ovs/Work/learn/phxhomeloancom-2026 show b8504a2:frontend/sanity/lib/live.ts

# Render V1 current branch against its configured dataset
cd /Users/ovs/Work/Dev/phx/phxhomeloan.com-2026
pnpm dev:web

# Verify canonical local pages in another shell
for route in / /our-team /phoenix-loan-originator /contact; do
  curl -sS -L -o /dev/null -w '%{url_effective} %{http_code}\n' \
    "http://localhost:3000${route}"
done
```
