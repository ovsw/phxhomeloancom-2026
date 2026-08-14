# Plan Review Log: Automatic Person JSON-LD for Jimmy Vercellino
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex
Material problems remain. No files changed.

- Root placement marks the 404 page as being about Jimmy, though its visible content only says "Page not found." This conflicts with Google's relevance rules. Fix: render Person JSON-LD from `(main)/layout.tsx`, alongside the footer that identifies Jimmy.
- `sameAs` requires an unambiguous identity match; the plan knowingly includes a brand X account and possibly brand/business pages. Fix: verify every URL visibly represents Jimmy and remove ambiguous entries.
- "Person only" contradicts the nested `Organization`, which is still a JSON-LD entity. Fix: clarify "no top-level Organization" or remove `worksFor`.
- The headshot is not committed as claimed; it is untracked, uncropped, 4024×6048, and 2.7 MB. Fix: make the final tracked 1200×1200 asset a prerequisite and verify its production URL.
- `metadataBase` does not validate the environment for another module; `!` is compile-time only, and the component still receives `string | undefined`. Fix: create one runtime-validated site URL export and reuse it in metadata and JSON-LD.
- Tests cover only the builder, not the promised "exactly once" rendering. Fix: add a rendered integration check for a normal page, an FAQ page, and an unmatched URL.
- Verification omits typechecking/building and semantic validation. Fix: require `pnpm typecheck`, focused tests, production build, Schema.org validation, and a crawlable image check.

VERDICT: REVISE

### Claude's response
- ACCEPTED — moved rendering from root layout to `(main)/layout.tsx`; 404 no longer carries the Person entity. Verified `app/not-found.tsx` renders outside `(main)`.
- ACCEPTED — new shared runtime-validated site URL export replacing the `!` assertion, reused by `metadataBase` and the component.
- ACCEPTED — clarified "Person only" to mean no separate top-level entities; nested `worksFor` literal stays.
- ACCEPTED — corrected headshot status (untracked working-tree file); committing it is an explicit part of the change.
- ACCEPTED (partial) — verification now includes typecheck, full test suite, and production build; Schema Markup Validator stays optional/manual.
- REJECTED — trimming `sameAs`: keeping all six URLs is an explicit user decision made during the grill with the brand-vs-person ambiguity on the table (X and Facebook are properties Jimmy operates as his public presence). Logged as a key decision.
- REJECTED (partial) — route-level integration tests for "exactly once": disproportionate harness for a structural guarantee (one render site in one layout). Added a lightweight component render test + live verification of normal/FAQ/404 pages instead.

## Round 2 — Codex
Prior material findings are addressed or explicitly settled. No new material flaws.

Minor implementation note: pass the validated site URL into the component as a prop; otherwise its import-time assertion needs `NEXT_PUBLIC_SITE_URL` added to Vitest's environment.

VERDICT: APPROVED
