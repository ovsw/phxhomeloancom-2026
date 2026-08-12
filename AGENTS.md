## Agent skills

- KISS principle is king: keep things simple. Simpler is usually better, unless it contradicts the repos structure, patterns, or rules. Simple doens't mean taking shortcuts that will hurt us later. Simple means selecting the simplest solution that still meets requirements. Think of the 80/20 rule and start with the 20% of work that will bring us top 80% of the goal first. Don't try to engineer the perfect solution from the start. Allow mistakes as part of the process, and work based on feedback loops: implment simply -> see results (open app, visit route, ask user to test, take screenshot) -> next simplest solution -> repeat.
- Delegate tasks to subagents whenever possible, using the DUMBEST and LOWEST agents that you approximate can still get the job done.
- give sub-agents the MINIMAL context they need to do the job.
- Act as a manager, ask master, integrator and manager for the sub-agents.
- Your role is strategic thinking and guidance through task execution rather than doing the grunt work. Execution is for the subagents.
- Top-level organization strategy, design, and problem-solving is your domain, where you work collaboratively with the user to help them achieve their stated goals, or discover what their goals are, as needed.

## Shell discipline and reporting observations

The Bash tool's working directory **persists between calls**. A `cd` in one
command silently changes what every later relative path resolves to. This has
already produced confidently-wrong claims about missing files.

- Run every command from a known cwd: use absolute paths, or `cd` to the repo
  root first. Never rely on inherited shell state.
- Do not use `2>/dev/null` on any command whose output feeds a conclusion. A
  suppressed error and an empty result look identical and mean different things.
- Do not chain independent checks with `&&` — the first failure hides every
  check after it. Use `;` or separate calls.
- **Never report a file as missing, deleted, or changed on the strength of one
  failed check.** Re-verify from an absolute path first.
- Report what was observed, not what was inferred: "the check returned nothing"
  is a different claim from "the file does not exist." Never attribute a change
  to the user's actions without direct evidence.
- When a new result contradicts an earlier observation in the same session,
  stop and re-verify. The newer result is not automatically the correct one.

This matters most before destructive or delegated work: unverified claims about
environment state (which dataset is configured, which env file is loaded) are
exactly what makes handing off write access dangerous.

## Testing
- Prefer focused functional/accessibility checks and one-time visual inspection;
- DO NOT create or maintain screenshot baselines unless explicitly requested.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `build`, `ci`.
- Scope is optional but preferred when the change is confined to one area — e.g. `feat(header):`, `fix(studio):`.
- Summary is imperative and lowercase: "add", not "added" or "Adds".
- Keep explaining *why* in the body. The prefix classifies the change; it does not replace the reasoning.
- Note that commits predating this rule use plain imperative subjects with no prefix. Follow the convention above, not the older style.

### Issue tracker

Issues and PRDs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain-doc layout. See `docs/agents/domain.md`.

### Page Builder work

Before adding or changing a Page Builder section, read `docs/agents/page-builder.md`.

### Development workflow

Before changing workspace dependencies, Sanity schemas, GROQ queries, or development scripts, consult the relevant section of `README.md`.
