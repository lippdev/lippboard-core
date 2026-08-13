import assert from 'node:assert/strict';
import { createDefaultState, normalizeAppState } from '../src/domain/appState.js';
import { createTask, deleteTask, getTaskListView, updateTask } from '../src/use-cases/taskLifecycle.js';
import { createNote, searchNotes } from '../src/use-cases/noteLifecycle.js';
import { applyQuickCapture } from '../src/use-cases/quickCapture.js';
import { createMindMap, addMindMapNode, deleteMindMapNode } from '../src/use-cases/mindMapLifecycle.js';

const now = new Date('2026-08-13T12:00:00Z');
let state = createDefaultState();
state = createTask(state, { title: 'Publicar core', priority: 'Alta' }, now);
assert.equal(getTaskListView(state, 'today', now).tasks[0].title, 'Publicar core');
state = updateTask(state, state.tasks[0].id, { status: 'feita' });
assert.equal(getTaskListView(state, 'completed', now).counts.completed, 1);
state = deleteTask(state, state.tasks[0].id);
assert.equal(state.tasks.length, 0);

state = createNote(state, { title: 'Core', content: 'Sem dados privados' }, now);
assert.equal(searchNotes(state, 'privados').length, 1);
state = applyQuickCapture(state, { type: 'mood', text: 'Bem', moodScore: 5 }, now);
assert.equal(state.mood.todayScore, 5);

state = createMindMap(state, { title: 'Release' }, now);
const mapId = state.mindMaps[0].id;
state = addMindMapNode(state, mapId, 'root', { text: 'Audit', side: 'right' }, now);
const nodeId = state.mindMaps[0].nodes[1].id;
state = deleteMindMapNode(state, mapId, nodeId, now);
assert.equal(state.mindMaps[0].nodes.length, 1);

assert.deepEqual(normalizeAppState(null).tasks, []);
console.log('Lipp Board Core checks OK');
