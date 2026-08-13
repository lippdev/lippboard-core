# Lipp Board Core

Framework-agnostic domain rules extracted from [Lipp Board](https://github.com/lippdev/lippboard-core). Use them in React, React Native, Node.js, or any JavaScript runtime with standard `URL` and `Intl` support.

## Included

- normalized application state;
- task create/update/delete, due dates and list views;
- notes and search;
- productivity snapshots and quick capture;
- mind-map mutations, attachment validation and layout.

Not included: production infrastructure, authentication credentials, private APIs, deployment configuration, personal data, AI prompts, or internal integrations.

## Install

```bash
npm install github:lippdev/lippboard-core#v0.1.0
```

## Example

```js
import { createDefaultState } from '@lippdev/lippboard-core/domain';
import { createTask, getTaskListView } from '@lippdev/lippboard-core/tasks';

const state = createTask(createDefaultState(), { title: 'Ship the mobile app' });
console.log(getTaskListView(state, 'today').tasks);
```

## Development

```bash
npm test
npm run audit:public
```

## Public/private flow

Generic domain changes land here first, are tagged, and are consumed by the private product through a pinned Git dependency. Product-specific adapters and configuration remain in the private repository. Public releases are allowlist-based and start with clean history; files are never mirrored automatically from the private repository.

## License

MIT © Filipe Moreira
