# Architecture

Lipp Board Core is the stable center of a multi-client product. It uses functional core / imperative shell: deterministic state transitions live here; authentication, persistence, networking, analytics, and UI stay in adapters owned by each client.

```text
┌─────────────────── delivery ───────────────────┐
│ React PWA       Expo / React Native       Node │
└───────────────┬──────────┬───────────────┬─────┘
                │          │               │
          ┌─────▼──────────▼───────────────▼─────┐
          │              use cases               │
          │ tasks · notes · capture · mind maps  │
          └──────────────────┬────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ normalized state│
                    └────────┬────────┘
                             │
          ┌──────────────────▼───────────────────┐
          │ adapters: API · SQLite · Firebase    │
          │ AsyncStorage · localStorage          │
          └──────────────────────────────────────┘
```

## Design constraints

1. **No runtime dependencies.** Domain behavior remains portable and easy to audit.
2. **Immutable transitions.** Use cases return a new root state and do not perform I/O.
3. **Explicit time.** Date-sensitive functions accept `now`, making behavior deterministic under test.
4. **Normalize at boundaries.** Legacy persisted values are repaired before reaching clients.
5. **Security by separation.** This repository contains no deploy configuration, credentials, production identifiers, prompts, or private adapters.

## State transition

```js
const nextState = createTask(previousState, input, now);
```

The caller decides when and where to persist `nextState`. A web adapter may write it to an authenticated HTTP endpoint while an Expo adapter may queue it in AsyncStorage. Neither concern changes the use case.

## Public/private release boundary

The public repository is not a filtered Git branch. It started with clean history and an explicit file allowlist. CI runs:

1. behavioral checks;
2. public-boundary audit;
3. Gitleaks over full Git history;
4. showcase validation.

Generic behavior is developed here and released by tag. The private product pins that tag and owns every environment-specific adapter.

## Trade-offs

- JavaScript keeps the same source consumable by the existing web and Expo clients. Type declarations can be added when external consumers require compile-time contracts.
- State-copy operations are intentionally simple. Structural-sharing libraries become justified only if measured state size makes copies a bottleneck.
- IDs are time-derived for compatibility with the current product. Injected ID generation becomes appropriate if concurrent offline creation produces collisions in practice.
