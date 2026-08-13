import { createDefaultState } from '../src/domain/appState.js';
import { createTask, deleteTask, getTaskListView, updateTask } from '../src/use-cases/taskLifecycle.js';
import { getProductivitySnapshot } from '../src/use-cases/productivity.js';

const fixedToday = () => new Date();
let state = createDefaultState();
[
  ['Ship the mobile state adapter', 'Alta'],
  ['Audit the public release boundary', 'Alta'],
  ['Document the architecture decision', 'Média'],
].reverse().forEach(([title, priority], index) => {
  state = createTask(state, { title, priority }, new Date(Date.now() + index));
});

const list = document.querySelector('#task-list');
const progress = document.querySelector('#progress');
const log = document.querySelector('#event-log');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');

function event(type, payload) {
  log.textContent = JSON.stringify({
    event: type,
    payload,
    state: { tasks: state.tasks.length, completed: state.tasks.filter((task) => task.status === 'feita').length },
  }, null, 2);
}

function render() {
  const view = getTaskListView(state, 'all', fixedToday());
  const snapshot = getProductivitySnapshot(state, fixedToday());
  progress.textContent = `${snapshot.progress}%`;
  list.replaceChildren(...view.tasks.map((task) => {
    const row = document.createElement('div');
    row.className = `task${task.status === 'feita' ? ' task--done' : ''}`;

    const toggle = document.createElement('button');
    toggle.className = 'task__toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', task.status === 'feita' ? `Reopen ${task.title}` : `Complete ${task.title}`);
    toggle.textContent = task.status === 'feita' ? '✓' : '';
    toggle.onclick = () => {
      state = updateTask(state, task.id, { status: task.status === 'feita' ? 'a_fazer' : 'feita' });
      event('task.status.changed', { id: task.id, status: state.tasks.find((item) => item.id === task.id).status });
      render();
    };

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = task.title;
    const meta = document.createElement('span');
    meta.textContent = `${task.priority} priority · ${task.dueDate}`;
    copy.append(title, meta);

    const remove = document.createElement('button');
    remove.className = 'task__remove';
    remove.type = 'button';
    remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.textContent = '×';
    remove.onclick = () => {
      state = deleteTask(state, task.id);
      event('task.deleted', { id: task.id });
      render();
    };
    row.append(toggle, copy, remove);
    return row;
  }));
}

form.addEventListener('submit', (submitEvent) => {
  submitEvent.preventDefault();
  state = createTask(state, { title: input.value, priority: 'Média' });
  event('task.created', { title: input.value });
  input.value = '';
  render();
});

event('core.initialized', { modules: ['domain', 'tasks', 'productivity'] });
render();
