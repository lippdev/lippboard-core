# Public API

Every function is synchronous and side-effect free unless a supplied `Date`, `URL`, or `Intl` implementation is itself modified externally.

## `@lippdev/lippboard-core/domain`

- `createDefaultState()` — creates empty portable state.
- `normalizeAppState(state)` — normalizes supported collections and legacy task/mind-map values.
- `createMindMapNode(overrides)` — creates a normalized root or child node.
- `MIND_MAP_ROOT_ID` — stable root identifier.

## `@lippdev/lippboard-core/tasks`

- `createTask(state, input, now?)`
- `updateTask(state, taskId, changes)`
- `deleteTask(state, taskId)`
- `getTaskListView(state, filter?, now?)`
- `normalizeTaskDueDate(value, now?)`
- `formatTaskDueDate(value, now?)`
- `isTaskDueToday(task, now?)`

Filters: `today`, `pending`, `completed`, `all`.

## `@lippdev/lippboard-core/notes`

- `createNote(state, input, now?)`
- `updateNote(state, noteId, changes)`
- `deleteNote(state, noteId)`
- `searchNotes(state, query)`

## `@lippdev/lippboard-core/productivity`

- `getProductivitySnapshot(state, now?)`
- `completeProductivityTask(state, taskId)`

## `@lippdev/lippboard-core/quick-capture`

- `applyQuickCapture(state, capture, now?)`

Capture types: `task`, `thought`, `mood`. Mood scores are integers from 1–5.

## `@lippdev/lippboard-core/mind-maps`

Lifecycle:

- `createMindMap`, `renameMindMap`, `deleteMindMap`
- `addMindMapNode`, `addMindMapSibling`, `deleteMindMapNode`
- `updateMindMapNodeText`, `updateMindMapNodeNote`, `updateMindMapNodeColor`
- `setMindMapNoteCollapsed`

Attachments and layout:

- `addMindMapAttachment`, `removeMindMapAttachment`
- `isValidLinkUrl`, `isValidImageSource`, `estimateDataUrlBytes`, `deriveLinkMeta`
- `getMindMapLayout`

Image data URLs are limited to 2 MB. Link attachments accept only `http:` and `https:` URLs.
