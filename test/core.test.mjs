import assert from 'node:assert/strict';
import { createDefaultState, normalizeAppState } from '../src/domain/appState.js';
import { createTask, deleteTask, formatTaskDueDate, getTaskListView, updateTask } from '../src/use-cases/taskLifecycle.js';
import { createNote, searchNotes, updateNote } from '../src/use-cases/noteLifecycle.js';
import { applyQuickCapture } from '../src/use-cases/quickCapture.js';
import { getProductivitySnapshot } from '../src/use-cases/productivity.js';
import {
  addMindMapAttachment, addMindMapNode, createMindMap, deleteMindMapNode,
  getMindMapLayout, isValidImageSource, isValidLinkUrl,
} from '../src/use-cases/mindMapLifecycle.js';

const now = new Date('2026-08-13T12:00:00');
let state = createDefaultState();
const original = state;
state = createTask(state, { title: 'Publicar core', priority: 'Alta' }, now);
assert.notEqual(state, original, 'transitions return a new root state');
assert.equal(original.tasks.length, 0, 'previous state remains unchanged');
assert.equal(getTaskListView(state, 'today', now).tasks[0].title, 'Publicar core');
assert.equal(formatTaskDueDate(state.tasks[0].dueDate, now), 'Hoje');
state = updateTask(state, state.tasks[0].id, { status: 'concluida' });
assert.equal(getTaskListView(state, 'completed', now).counts.completed, 1);
assert.equal(getProductivitySnapshot(state, now).progress, 100);
state = deleteTask(state, state.tasks[0].id);
assert.equal(state.tasks.length, 0);
assert.throws(() => createTask(state, { title: '  ' }, now), /título/);

state = createNote(state, { title: 'Core', content: 'Sem dados privados' }, now);
assert.equal(searchNotes(state, 'PRIVADOS').length, 1);
state = updateNote(state, state.thoughts[0].id, { content: 'Boundary auditado' });
assert.equal(searchNotes(state, 'boundary').length, 1);
state = applyQuickCapture(state, { type: 'mood', text: 'Bem', moodScore: 5 }, now);
assert.equal(state.mood.todayScore, 5);
assert.throws(() => applyQuickCapture(state, { type: 'mood', text: 'x', moodScore: 9 }, now), /1 a 5/);

state = createMindMap(state, { title: 'Release' }, now);
const mapId = state.mindMaps[0].id;
state = addMindMapNode(state, mapId, 'root', { text: 'Audit', side: 'right' }, now);
state = addMindMapNode(state, mapId, 'root', { text: 'Docs', side: 'left' }, new Date(now.getTime() + 1));
const [rightNode, leftNode] = state.mindMaps[0].nodes.slice(1);
assert.equal(rightNode.side, 'right');
assert.equal(leftNode.side, 'left');
const layout = getMindMapLayout(state.mindMaps[0]);
assert.equal(layout.find((position) => position.id === rightNode.id).side, 'right');
assert.equal(layout.find((position) => position.id === leftNode.id).side, 'left');
assert.equal(isValidLinkUrl('javascript:alert(1)'), false);
assert.equal(isValidLinkUrl('https://example.com/docs'), true);
assert.equal(isValidImageSource('data:text/html;base64,PHNjcmlwdD4='), false);
state = addMindMapAttachment(state, mapId, rightNode.id, { type: 'link', url: 'https://example.com/docs' }, now);
assert.equal(state.mindMaps[0].nodes[1].attachments[0].title, 'example.com/docs');
state = deleteMindMapNode(state, mapId, rightNode.id, now);
assert.equal(state.mindMaps[0].nodes.some((node) => node.id === rightNode.id), false);

const normalized = normalizeAppState({
  tasks: [{ id: 'legacy', title: 'Legacy', status: 'pendente' }],
  mindMaps: [{ id: 'legacy-map', nodes: [{ id: 'root' }, { id: 'orphan', parentId: 'missing' }] }],
});
assert.equal(normalized.tasks[0].status, 'a_fazer');
assert.equal(normalized.mindMaps[0].nodes.length, 1, 'orphan nodes are removed at hydration');
console.log('Lipp Board Core checks OK');
