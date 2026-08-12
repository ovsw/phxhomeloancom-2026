# Plan Review Log: No-skeleton cacheComponents architecture
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

Grill decisions (Ovi): drop partialPrefetching (full prefetch); keep header/footer
draft preview; official SWR revalidation; draft navigation blocks without spinner.

## Round 1 — Codex
1. Blocker: core draftMode() prerender assumption unproven; prove one route first or keep real-content fallback.
2. Blocker: unbuilt URLs need Suspense for App Shell; blog/[page] may lack generateStaticParams.
3. Blocker: generateMetadata calls getDynamicFetchOptions() (request-bound metadata); make it published-only.
4. High: bandwidth mitigation too narrow (blog cards/pagination fan-out); inventory link collections.
5. Medium: generic fetch refactor is unrelated risk; leave wrappers, test invalidation separately.
6. Medium: acceptance tests sample instead of sweeping; curl -I is HEAD not GET.
VERDICT: REVISE

### Claude's response
- #1 ACCEPTED: added step 0 spike (one route + layout, build-verified) before global rollout.
- #2 ACCEPTED (amended): generateStaticParams audit/coverage added; unbuilt paths use the explicit blocking-route allowance per the locked "blocking, no spinner" decision — no skeleton boundary returns.
- #3 ACCEPTED: all generateMetadata go literal published/stega:false. Genuine catch.
- #4 PARTIAL: explicit prefetch policy documented (default everywhere incl. blog cards/pagination — that fan-out is the user's chosen UX and Next's scheduler rate-limits; footer lists prefetch={false}). Not disabling more: contradicts the locked decision.
- #5 PARTIAL: consolidation stays (it's a goal of this effort, official pattern) but re-sequenced as a separate final, independently-revertable step, gated on the empirical invalidation check. No conditional cacheTag duplication unless the check fails.
- #6 ACCEPTED: full-sweep script over all built HTML, GET-based status asserts, separate non-draft session for publish propagation.

## Round 2 — Codex
1. Blocking-route mechanism unnamed; list segments receiving `export const instant = false`.
2. HTML sweep inspects .next output, which repo/user rules forbid; use production GET responses.
3. Generic fetch consolidation still unjustified scope; drop it.
4. Negative caching untested: 404 cached for unknown slug may not invalidate when the slug is later published.
VERDICT: REVISE

### Claude's response
- #1 ACCEPTED: verified `export const instant = false` in the bundled instant-navigation guide; plan now names the mechanism and the four segments, with spike confirmation that known paths stay prerendered.
- #2 ACCEPTED: sweep rewritten to enumerate routes (sitemap + index queries) and assert on production GET response bodies; .next is never inspected. (Also a fair cop: earlier session checks did inspect .next HTML — the plan now conforms to the rule.)
- #3 REJECTED (logged reason): the consolidation is part of this effort's stated goal (simplification), matches the official sanity-live-cache-components skill, deletes ~200 lines of near-duplicate wrappers, and is sequenced as an independently revertable final commit gated on the invalidation check. Risk is contained; benefit is real. Final arbiter call.
- #4 ACCEPTED: negative-caching test added (404-before-publish → publish → 200 without rebuild) as an acceptance criterion.

## Round 3 — Codex
1. Sitemap filters noindex content, so the route sweep under-enumerates; derive routes from the generateStaticParams queries.
2. Negative-cache test lacks fixture hygiene (unique ID, cleanup, cleanup verification).
VERDICT: REVISE

### Claude's response
- #1 ACCEPTED: sweep now enumerates from the same slug queries as generateStaticParams plus pagination math; sitemap noted as under-counting.
- #2 ACCEPTED: unmistakable temp fixture in the development dataset, draft+published deleted in all outcomes, absence verified.

## Round 4 — Codex
1. Fixture not collision-safe; cleanup verifies dataset but not the cached 200.
VERDICT: REVISE

### Claude's response
- #1 ACCEPTED: unique generated ID+slug with pre-existence abort; post-cleanup 404 re-check (which also proves unpublish propagation).

## Round 5 — Codex
All prior material findings addressed; no new concrete blockers.
VERDICT: APPROVED
