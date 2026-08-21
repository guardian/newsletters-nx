# Docs

Start with the root [`README.md`](../README.md) for setup, local run commands, and workspace-wide test commands.

## What lives here?

- [`architecture.md`](architecture.md) — monorepo map, runtime boundaries, and key integrations
- [`deployment.md`](deployment.md) — CI/CD, CDK, RiffRaff, environments, and rollback/investigation pointers
- [`launch-flow.md`](launch-flow.md) — the draft-to-launched newsletter lifecycle and failure points
- [`../AGENTS.md`](../AGENTS.md) — repo-specific working conventions for humans and agents

## When to add or split docs later

- Extend one of the existing docs first if the new content shares the same code owners and update cadence.
- Split into a new doc only when a section becomes hard to navigate or has a clearly different audience or operational lifecycle.
- Keep filenames flat under `docs/`; avoid numbered hierarchies unless the doc set becomes much larger than it is today.
