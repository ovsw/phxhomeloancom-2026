# Plan Review Log: Restore the five legacy root-level blog category archive URLs

Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Act 1 summary — what the grill settled

| # | Question | Decision |
|---|---|---|
| 1 | Backfill vs. permanent function support | **B** — hand-author 5 legacy redirects; add `category` to `ROUTED_DOCUMENT_TYPES` for ordinary renames only. Legacy root quirk stays out of the function. |
| 2 | Has `/blog/category/*` ever been public? | No — branch never pushed, zero public history. Rename needs no redirects of its own. |
| 3 | Author now vs. rename first | **B** — rename first, backfill second. No window where a redirect points at a non-existent slug. |
| 4 | How are the 5 docs created | **B** — checked-in migration script, `development` dataset only. |
| 5 | Final slug mapping | Supplied by user; 5-row table locked. `realtor-information` excluded. |
| 6 | Cannibalization vs. redirect destinations | **C** — redirects as mapped; archive-vs-hub overlap is separate work. |
| 7 | Legacy paginated archives | **B** — let them 404; add individually later if a crawl finds any that matter. |
| 8 | `liveRoutes` collision guard | **A** — resolve real paths via `getPresentationPath()` for all three types. |
| 9 | `model.test.mjs:159` | **A** — flip the assertion **and** add a case proving root-level sources are never auto-generated. |
| 10 | Migration script ids | **A** — reuse `autoRedirectId(source)` with `createOrReplace`. |
| 11 | `RESERVED_SOURCE_PATHS` | **A** — no. That set is for code-owned paths; these are data, already protected. |
| 12 | Proof | **A** — tests + build + curl all five legacy URLs for 301, destinations for 200. |

### Premises corrected during the grill

- Two of the five legacy slugs were **already renamed** before this branch (`types-of-loans` → `loan-types`, `requirements` → `mortgage-requirements`).
- There are **six** categories, not five.
- **Zero path collisions** against 22 live pages and 58 live posts.
- The redirect **chain problem in the original brief does not exist** — the middle link was never public.

## Round 1 — Codex

The plan still has material gaps:

1. **Category publishes never trigger the function.** [sanity.blueprint.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/sanity.blueprint.ts:16) filters events to pages and posts, but the plan only changes `ROUTED_DOCUMENT_TYPES`.  
   Fix: Include `category` in the blueprint filter and verify the deployed event configuration.

2. **Adding `category` to the type set would create the wrong paths.** [model.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/functions/auto-redirect/model.ts:98) normalizes raw event slugs, producing `/old/ → /new/`, not category archive paths.  
   Fix: Resolve both event slugs through a document-type-aware path resolver before planning the redirect.

3. **The function’s collision snapshot still excludes category routes.** [index.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/functions/auto-redirect/index.ts:38) queries only pages/posts and returns raw slugs.  
   Fix: Query `_type` plus slug for pages, posts, and categories, then materialize every public path before collision checks.

4. **The validator change is underspecified.** GROQ cannot call `getPresentationPath`; [redirect-rules.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/schemas/validation/redirect-rules.ts:176) must map fetched documents in TypeScript, and existing tests do not cover category paths.  
   Fix: Define the post-fetch mapping explicitly and add source-collision and destination-existence tests for categories.

5. **`createOrReplace` is destructive, not safe idempotency.** A deterministic ID prevents duplicates but can silently overwrite a manually edited or concurrent redirect.  
   Fix: Preflight IDs and normalized sources, abort on mismatches, and use conditional create/revision-guarded updates.

6. **The migration relies on stale collision facts.** The plan’s current dataset counts do not protect against a page, post, category, or redirect created before execution; the frontend compiler does not check live-route shadowing.  
   Fix: Re-query all published routes and redirects immediately before one atomic transaction, then perform a synchronous post-write audit.

7. **The migration safety contract and tests are missing.** The plan does not require dry-run-by-default, a project-ID guard, exact post-write assertions, or tests for conflicts and partial failure.  
   Fix: Follow the existing migration pattern: assert `hv0545v9/development`, require `--apply`, test pure preflight logic, commit once, and refetch all five exact records.

8. **Concurrent or out-of-order rename events can use stale topology.** The handler reads redirects, plans, and writes later; revision guards cover only retargeted documents, not the full snapshot.  
   Fix: Add concurrency/repeated-rename tests and retry from a fresh snapshot after transaction conflicts or topology changes.

9. **Verification stops short of restoring the real URLs.** A local build does not activate build-time redirects in production, and the plan does not assert that the build uses the migrated project/dataset.  
   Fix: Specify the rollout order: audit rename → apply migration → verify records → deploy function/frontend with matching environment → test public 301 `Location` and final 200 responses.

10. **Two permanent mappings remain editorial guesses.** The plan admits uncertainty but lets the script create irreversible public 301 behavior without an execution gate.  
    Fix: Require explicit approval of those two mappings and verify their final category IDs/post assignments before applying.

VERDICT: REVISE
### Claude's response

**Accepted — three confirmed bugs in the plan (verified against source, not taken on faith):**

- **#1 blueprint filter (confirmed, `sanity.blueprint.ts:16`).** Filter is `_type in ["page", "post"]`. Category publish events never reach the function, so changing `ROUTED_DOCUMENT_TYPES` alone was a silent no-op. Added as step 2.
- **#2 raw slug normalization (confirmed, `model.ts:98-99`) — the serious one.** The function normalizes raw event slugs. Post slug `foo` → `/foo` is correct by coincidence; category slug `loan-types` → `/loan-types`, not `/blog/category/loan-types/`. The plan would have minted redirects between two non-existent root URLs — precisely the trap the original brief named and the plan then walked into. Added as step 3, routing both slugs through `getPresentationPath`.
- **#3 second `liveRoutes` query (confirmed, `index.ts:37-48`).** The plan cited only the validator query in `redirect-rules.ts:176` and missed the function's own runtime snapshot. Both now in step 4.

**Accepted — process gaps:**

- **#4** GROQ cannot call `getPresentationPath`; step 4 now specifies selecting `_type` and mapping to a public path in TypeScript post-fetch, plus category validator tests.
- **#5** `createOrReplace` replaced with `createIfNotExists` + revision-guarded patch, aborting on a mismatched existing document.
- **#6** Script now re-queries all published routes and redirects immediately before writing. Also corrected a claim in the plan: `compileNextRedirects` checks redirect-vs-redirect topology but does **not** check live-route shadowing.
- **#7** Verified the house pattern exists (`studio/scripts/migrate-post-category.ts`, every `migrate-*.ts` has a paired `*.test.mjs`) — the plan ignored it. Step 7 now requires dry-run default, `--apply` gate, `hv0545v9`/`development` guard, pure exported planning functions, fatal-before-writes, one transaction with `visibility: "sync"`, and a post-write parity audit.
- **#8** Added repeated/out-of-order rename test coverage.
- **#9** Verification is now an ordered rollout with an explicit assertion that the build's dataset matches the migrated one, exact `Location` header checks, and confirmation the deployed function picked up the filter change.
- **#10** The two editorial mappings are gated on dry-run review before `--apply`.

**Rejected:** nothing outright. #10's framing of 301s as "irreversible" is overstated — a redirect document edit plus a rebuild reverses them, and the site is pre-launch with no live traffic — but the dry-run gate is cheap and the underlying point (don't let a judgment call auto-execute) is sound, so it was adopted as written.

## Round 2 — Codex

Most prior findings are addressed, but these material gaps remain:

1. **Out-of-order renames are tested but not solved.** If `B → C` arrives before `A → B`, [model.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/functions/auto-redirect/model.ts:153) skips `A → B`, leaving `A` broken.  
   Fix: Resolve an event destination through any existing redirect to its terminal path, so the late event creates `A → C`.

2. **Concurrent events can still commit a chain from stale snapshots.** Two handlers can independently approve `A → B` and `B → C`, then commit both because their new documents have different IDs.  
   Fix: Re-read and reconcile topology after commit, or serialize same-document rename processing with a revision-aware retry loop.

3. **Migration preflight does not simulate the complete resulting topology.** It checks collisions and mismatched sources, but chains or cycles involving existing redirect destinations are discovered only after data is written.  
   Fix: Run `compileNextRedirects` against existing active redirects plus all five planned records before opening the transaction.

4. **An identical redirect under another ID creates a duplicate.** The plan permits an existing same-source/same-destination record, then creates the deterministic-ID record anyway.  
   Fix: Abort if a normalized source exists under any other ID; only treat the exact deterministic-ID record with all expected fields as an idempotent rerun.

5. **Destination verification is still partly manual and contradictory.** Step 9 audits slugs before applying, but the risk section says wrong destinations surface after writing as 301-to-404 responses.  
   Fix: Bind category destinations to expected document IDs and make missing or mismatched published slugs fatal inside migration preflight.

6. **The actual deployment steps remain implicit.** Sanity Functions require a Blueprint deployment, such as `sanity blueprints deploy`; ordinary Studio deployment is separate. The plan also never explicitly deploys/rebuilds the frontend or checks public URLs. [Sanity Blueprints CLI documentation](https://www.sanity.io/docs/cli-reference/cli-blueprints)  
   Fix: Name the Blueprint deploy, frontend deploy, and final public 301/`Location`/200 checks explicitly.

7. **The function smoke test could mutate canonical category data.** “A category rename should now mint” implies changing a real final slug and creating extra redirect data.  
   Fix: Use `sanity functions test` with before/after payloads, or define an explicitly disposable test document and cleanup procedure. [Sanity Functions CLI documentation](https://www.sanity.io/docs/cli-reference/functions)

8. **Ordered verification omits required tests and half the environment guard.** It does not run `redirect-rules.test.mjs`, and it explicitly checks the dataset variable but not `NEXT_PUBLIC_SANITY_PROJECT_ID`.  
   Fix: Run the repository’s full test command and assert both `hv0545v9` and `development` before building.

VERDICT: REVISE
### Claude's response

**Accepted:**

- **#3 topology simulation.** Preflight now runs existing active redirects plus all five planned records through the same chain/cycle/conflict logic the build uses, before opening the transaction. Real gap — otherwise a chain via an existing redirect's destination is only found after the write, at build time.
- **#4 duplicate under another id.** Tightened: abort if a normalized source exists under **any** other document id; only the exact deterministic-id record with all expected field values counts as an idempotent re-run.
- **#5 destination binding.** Preflight now binds each destination to a known category `_id` and treats a missing document or slug mismatch as fatal. Category ids added to the mapping table so this is actionable. Also fixed the contradiction Codex spotted — the risks section still claimed wrong destinations surface *after* writing, which the new preflight makes false.
- **#6 deployment steps.** Correct and non-obvious: Sanity Functions ship via `sanity blueprints deploy`, which is separate from `sanity deploy` for the Studio. Without it the widened event filter never reaches the running function. Named explicitly, along with the frontend deploy and the public 301/`Location`/200 checks.
- **#7 smoke test would mutate real data.** Right — "rename a category to confirm it works" would alter canonical taxonomy and mint a stray redirect. Replaced with `sanity functions test` against a synthetic before/after payload.
- **#8 test command and environment guard.** Verified: `redirect-rules.test.mjs` exists, and root `pnpm test` runs `frontend` tests plus every `studio/**/*.test.mjs`. The plan had named individual files. Now calls `pnpm test` + `pnpm typecheck`, and asserts **both** `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.

**Rejected as in-scope work — documented instead (#1 out-of-order renames, #2 concurrent stale-snapshot chains):**

Both are genuine defects, and both are **pre-existing**: they affect pages and posts today exactly as much as they would categories. Neither is introduced or worsened by this plan.

- Fixing #1 means resolving event destinations transitively through existing redirects to a terminal path — a behavioural change to how every redirect in the system is derived, for pages and posts too. That is not a redirect backfill; it is a redesign of the function's derivation model.
- Fixing #2 means serialization or a revision-aware retry loop across independent function invocations — a concurrency-model change with its own failure modes.

Neither is triggered by this plan's actual work: the five backfill redirects are written by a single-transaction script, not the function, and the category rename is one coordinated migration rather than a race of independent publishes. The failure mode for #2 is also a **failed build**, which is loud and recoverable, not silent corruption.

Absorbing either into a redirect-backfill branch would expand scope from "restore five 404ing URLs" into "redesign the redirect function," which is exactly the kind of scope creep the grill decided against in Q1. They are now recorded in a dedicated "Known pre-existing function limitations" section with the mechanism and the line numbers, so the next person to touch the function inherits the analysis instead of rediscovering it.

## Round 3 — Codex

The concurrency scoping is defensible. The backfill is atomic, the category rename happens before the function is enabled for categories, and rapid rename races are pre-existing debt. I do not treat them as blockers here.

Four material issues remain:

1. **The test plan contradicts that scope.** [PLAN.md](/Users/ovs/Work/learn/phxhomeloancom-2026/PLAN.md:28) still requires an out-of-order test “proving” topology is safe, while line 92 documents that it produces an orphan.  
   Fix: Require a passing duplicate-redelivery test and a clearly named known-defect test documenting the out-of-order orphan.

2. **Migration preflight ignores drafts.** A draft page or redirect can already own a legacy source, and `drafts.<deterministic-id>` could later publish over the migrated redirect; the existing validator deliberately handles published/draft pairs in [redirect-rules.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/schemas/validation/redirect-rules.ts:138).  
   Fix: Use the raw perspective, inspect published and draft versions of routes and redirects, and include draft-state checks in preflight, tests, and post-write audit.

3. **The mutation contract is internally inconsistent.** Line 38 permits only three meaningful states—missing, exact match, or fatal mismatch—so there is nothing safe for the required “revision-guarded patch” to modify.  
   Fix: Define missing → `createIfNotExists`, exact match → no-op, any mismatch/alternate ID → fatal; remove the patch requirement.

4. **The smoke test does not verify the deployed trigger.** `sanity functions test` invokes the handler directly and can pass even if the deployed Blueprint still excludes category events.  
   Fix: Keep that as a handler test, then separately inspect the deployed Blueprint resource and confirm its event filter includes `category`.

VERDICT: REVISE
### Claude's response

Codex accepted the concurrency scoping decision ("defensible... I do not treat them as blockers here"). All four remaining findings accepted — no pushback this round.

- **#1 test plan contradicted the scope.** Correct and self-inflicted: step 6 asked for an out-of-order test "proving topology is safe" while the limitations section documents that the same scenario produces an orphan. Split into two clearly distinguished cases: a **duplicate-redelivery test that must pass**, and a **named known-defect test** (`documents the out-of-order rename orphan`) that pins today's actual broken behaviour so a future fix has a failing case to flip.
- **#2 preflight ignored drafts.** Real hole. A draft page or redirect can already own a legacy source and collide on publish, and a `drafts.<deterministic-id>` document could publish straight over a migrated redirect. Preflight and the post-write audit now use the `raw` perspective and check draft versions — following the house convention already in `redirect-rules.ts:138` (`documentIds()`), not a new invention.
- **#3 mutation contract was internally inconsistent.** The sharpest catch of the round, and my error: the plan required a "revision-guarded patch" while also making every mismatch fatal, leaving the patch nothing to act on. Replaced with an explicit three-state contract — missing → `createIfNotExists`, exact match → no-op, anything else → fatal. There is deliberately no update path.
- **#4 smoke test proved the wrong thing.** `sanity functions test` invokes the handler directly, so it passes even if the deployed Blueprint filter still excludes categories — meaning it could not prove step 2 shipped. Split into a handler-logic test and a separate inspection of the deployed Blueprint's event filter.

## Round 4 — Codex

The four prior fixes are mostly present, but these issues remain:

1. **The patch path still survives in the decision section.** [PLAN.md](/Users/ovs/Work/learn/phxhomeloancom-2026/PLAN.md:83) says `createIfNotExists` plus a revision-guarded patch, contradicting the create/no-op/fatal contract at lines 38–43.  
   Fix: Remove the patch reference and restate the three-state contract consistently.

2. **Target-category drafts are not fully checked.** Line 36 validates only the published category slug; a stale draft could later publish an old slug and break the redirect destination.  
   Fix: Require every target draft to be absent or carry the same expected final slug.

3. **Post-write verification checks IDs, not complete source ownership.** A concurrent page, post, category, or redirect under another ID could claim a legacy source after preflight and remain invisible to the stated audit.  
   Fix: After commit, repeat the raw collision inventory and topology simulation, asserting exactly one owner per legacy source.

4. **The duplicate-delivery test claims persistence behavior from a model test.** `model.test.mjs` cannot prove that two events land on one document because `createIfNotExists` runs in [index.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/functions/auto-redirect/index.ts:85).  
   Fix: Either add a handler-level transaction test or limit the model assertion to stable IDs and `create: false` after the existing redirect is supplied.

5. **The handler smoke test runs after deployment.** Broken wrapper/query integration could be deployed before the synthetic function test exercises it.  
   Fix: Run the synthetic handler test before Blueprint deployment, then inspect the deployed filter afterward.

VERDICT: REVISE
### Claude's response

All five accepted — no pushback this round.

- **#1 leftover patch path.** My error: I rewrote the mutation contract in step 7 but left the old "createIfNotExists plus a revision-guarded patch" wording in the decisions section, so the plan contradicted itself. Restated consistently as create / no-op / fatal, no update path.
- **#2 target-category drafts.** Preflight validated only the *published* category slug. A stale draft holding the pre-rename slug would silently break the destination the moment someone publishes it. Now requires every target draft to be absent or carry the same expected final slug.
- **#3 post-write audit was id-scoped.** Correct: checking the five ids cannot see a page, post, category, or redirect created under a *different* id between preflight and commit that now claims a legacy source. The audit now repeats the full raw collision inventory and topology simulation, asserting exactly one owner per legacy source.
- **#4 duplicate-delivery test over-claimed.** `model.test.mjs` tests `planAutoRedirect` in isolation and cannot prove two events land on one document, since `createIfNotExists` is in `index.ts:85`. Scoped the assertion to what the model layer owns — stable `autoRedirectId` and `create: false` when the redirect already exists — with the persistence guarantee left to the handler smoke test.
- **#5 smoke test ran after deployment.** Moved before the Blueprint deploy: a broken wrapper or query should fail locally rather than ship and then be discovered. The deployed-filter inspection stays after the deploy, since that is the only thing that can prove the filter change landed.

Also fixed while in there: the rollout list had a duplicated step number after the reordering.

## Round 5 — Codex

**Implementation blockers: none.** The plan now adequately protects destination integrity, drafts, redirect topology, idempotency, deployment configuration, and post-write verification.

**Non-blocking refinements:**

- [PLAN.md](/Users/ovs/Work/learn/phxhomeloancom-2026/PLAN.md:28) overstates the handler smoke test: local execution exits at [index.ts](/Users/ovs/Work/learn/phxhomeloancom-2026/studio/functions/auto-redirect/index.ts:64) before `createIfNotExists`, so it does not prove persistence idempotency. Reword this or add a mocked transaction test during implementation.
- When inspecting the deployed Blueprint, record the resolved project, dataset, and filter alongside the verification result.
- Naming the migration file and exact CLI invocations would improve the handoff, but these can be resolved safely during implementation.

VERDICT: APPROVED
### Claude's response

**APPROVED — zero implementation blockers.** All three non-blocking refinements folded in anyway, since two were cheap and one was a factual error still live in the plan.

- **Smoke test over-claimed persistence — the real catch.** Verified at `index.ts:64`: `shouldWriteAutoRedirect` returns early in local mode and logs "would apply", so the transaction at line 85 never runs. In round 4 I moved the persistence claim off the model test and onto the handler test, where it was *still* wrong. Both layers now state plainly what they prove: the model test covers stable ids and `create: false`; the smoke test covers the plan and the queries but explicitly not persistence. The single-document guarantee rests on `createIfNotExists` behaviour — the same mechanism that produced the 25 existing redirects — with a mocked-transaction test noted as optional.
- **Blueprint inspection now records resolved project id, dataset, and filter string.** A correct-looking filter against the wrong project or dataset proves nothing.
- **Migration file named**: `studio/scripts/migrate-legacy-category-redirects.ts` plus paired `.test.mjs`. On the exact CLI invocation — grepped the repo and found it documented nowhere, so rather than inventing a command that looks authoritative, the plan states the mechanism (`getCliClient`, `--apply` from `process.argv`, run via `sanity exec` from `studio/`) and flags that the invocation must be confirmed against how existing migrations are actually run.

## Resolution

Converged at round 5 of 5 with `VERDICT: APPROVED`. Awaiting user sign-off before any code is written.
