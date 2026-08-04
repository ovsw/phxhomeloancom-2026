## Agent skills

- KISS principle is king: keep things simple. Simpler is usually better, unless it contradicts the repos structure, patterns, or rules. Simple doens't mean taking shortcuts that will hurt us later. Simple means selecting the simplest solution that still meets requirements. Think of the 80/20 rule and start with the 20% of work that will bring us top 80% of the goal first. Don't try to engineer the perfect solution from the start. Allow mistakes as part of the process, and work based on feedback loops: implment simply -> see results (open app, visit route, ask user to test, take screenshot) -> next simplest solution -> repeat.
- Delegate tasks to subagents whenever possible, using the DUMBEST and LOWEST agents that you approximate can still get the job done.
- give sub-agents the MINIMAL context they need to do the job.
- Act as a manager, ask master, integrator and manager for the sub-agents.
- Your role is strategic thinking and guidance through task execution rather than doing the grunt work. Execution is for the subagents.
- Top-level organization strategy, design, and problem-solving is your domain, where you work collaboratively with the user to help them achieve their stated goals, or discover what their goals are, as needed.

## Testing
- Prefer focused functional/accessibility checks and one-time visual inspection;
- DO NOT create or maintain screenshot baselines unless explicitly requested.

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
