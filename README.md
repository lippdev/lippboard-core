# Lipp Board Core

[![CI](https://github.com/lippdev/lippboard-core/actions/workflows/ci.yml/badge.svg)](https://github.com/lippdev/lippboard-core/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-f43f5e.svg)](LICENSE)
[![Zero runtime dependencies](https://img.shields.io/badge/runtime_dependencies-0-18181b.svg)](package.json)

**A framework-agnostic productivity domain engine extracted from a production PWA and Expo migration.** It models tasks, notes, quick capture, productivity snapshots, and bilateral mind maps without coupling business rules to React, React Native, storage, authentication, or HTTP.

[**Explore the interactive showcase →**](https://lippdev.github.io/lippboard-core/showcase/)

## Why this repository exists

Lipp Board runs across web and mobile. Reimplementing behavior in every client would create drift, so the reusable rules live in a functional core while each product owns its imperative adapters.

```text
React PWA ─┐
Expo app ──┼── use cases ── normalized state ── persistence adapter
Node tools ┘
```

This is not a source dump from the private product. It has clean public history, an explicit release allowlist, full-history secret scanning, and no production identifiers or private adapters.

## Capabilities

| Module | What it proves |
| --- | --- |
| Tasks | Immutable lifecycle, legacy-status normalization, date semantics, priority sorting, derived views |
| Notes | Validated create/update/delete and locale-aware search |
| Productivity | Focus selection, completion metrics, progress snapshots |
| Quick capture | One boundary for tasks, thoughts, and validated mood entries |
| Mind maps | Bilateral tree mutations, subtree deletion, safe attachments, deterministic layout |
| Domain state | Hydration normalization and removal of malformed/orphaned data |

## Use it

```bash
npm install github:lippdev/lippboard-core
```

```js
import { createDefaultState } from '@lippdev/lippboard-core/domain';
import { createTask, getTaskListView } from '@lippdev/lippboard-core/tasks';

const now = new Date('2026-08-13T09:00:00');
const initial = createDefaultState();
const next = createTask(initial, {
  title: 'Ship the mobile client',
  priority: 'Alta',
}, now);

console.log(initial.tasks.length); // 0 — previous state is untouched
console.log(getTaskListView(next, 'today', now).tasks.length); // 1
```

## Engineering decisions

- **Zero runtime dependencies:** portable, auditable, and cheap to consume.
- **Functional core / imperative shell:** domain code returns state; clients own I/O.
- **Explicit clocks:** date-sensitive paths accept `now` for deterministic tests.
- **Boundary normalization:** legacy and malformed persisted data are repaired once.
- **Security by extraction:** public content is allowlisted rather than mirrored from private Git history.

Read [architecture and trade-offs](docs/architecture.md) or the [public API reference](docs/api.md).

## Quality gates

```bash
npm test                 # behavioral + showcase checks
npm run audit:public     # allowlist + private-pattern gate
```

CI also runs Gitleaks over the complete public history and deploys the dependency-free showcase to GitHub Pages. Tests cover immutability, validation failures, legacy hydration, unsafe URL rejection, tree layout, subtree deletion, and cross-module flows.

## Repository map

```text
src/domain/       normalized state and entities
src/use-cases/    application behavior
src/services/     shared status vocabulary
showcase/         browser demo importing the real core
scripts/          public-boundary audit
test/             executable behavior specifications
docs/             architecture and API reference
```

## Public/private flow

Generic behavior lands here first and passes the public gate. Product-specific authentication, APIs, infrastructure, AI prompts, deployment configuration, branding, and user data stay in the private product repository. The product consumes stable public revisions instead of maintaining a long-lived public branch.

## Author

Built by **Filipe Moreira**, full-stack software engineer — [GitHub](https://github.com/lippdev).

## License

MIT © Filipe Moreira
