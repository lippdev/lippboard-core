import { normalizeTaskStatus } from '../services/taskStatus.js';

const toLocalDate = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const tomorrow = (now) => {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  return date;
};

export function normalizeTaskDueDate(value, now = new Date()) {
  const dueDate = String(value || '').trim();
  if (!dueDate || dueDate.toLowerCase() === 'hoje') return toLocalDate(now);
  if (dueDate.toLowerCase() === 'amanhã') return toLocalDate(tomorrow(now));
  return /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : '';
}

export function isTaskDueToday(task, now = new Date()) {
  return normalizeTaskDueDate(task?.dueDate, now) === toLocalDate(now);
}

export function formatTaskDueDate(value, now = new Date()) {
  const dueDate = normalizeTaskDueDate(value, now);
  if (!dueDate) return value || 'Sem data';
  if (dueDate === toLocalDate(now)) return 'Hoje';
  if (dueDate === toLocalDate(tomorrow(now))) return 'Amanhã';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${dueDate}T12:00:00`));
}

const priorityOrder = { Alta: 0, Média: 1, Baixa: 2 };
const isPending = (task) => !['feita', 'cancelada'].includes(normalizeTaskStatus(task.status));

export function getTaskListView(state, filter = 'today', now = new Date()) {
  const all = state.tasks || [];
  const pending = all.filter(isPending);
  const completed = all.filter((task) => normalizeTaskStatus(task.status) === 'feita');
  const today = pending.filter((task) => isTaskDueToday(task, now));
  const todayKey = toLocalDate(now);
  const overdue = pending.filter((task) => {
    const dueDate = normalizeTaskDueDate(task.dueDate, now);
    return dueDate && dueDate < todayKey;
  });
  const groups = { today, pending, completed, all };
  const tasks = [...(groups[filter] || all)].sort((left, right) => {
    const byDate = (normalizeTaskDueDate(left.dueDate, now) || '9999-12-31')
      .localeCompare(normalizeTaskDueDate(right.dueDate, now) || '9999-12-31');
    if (byDate) return byDate;
    return (priorityOrder[left.priority] ?? 3) - (priorityOrder[right.priority] ?? 3);
  });

  return {
    tasks,
    counts: { today: today.length, pending: pending.length, completed: completed.length, overdue: overdue.length, all: all.length },
  };
}

export function createTask(state, input, now = new Date()) {
  const title = input?.title?.trim();
  if (!title) throw new Error('Informe o título da tarefa.');

  const task = {
    id: `t_${now.getTime()}`,
    title,
    category: input.category || 'Pessoal',
    priority: input.priority || 'Média',
    status: normalizeTaskStatus(input.status),
    dueDate: input.dueDate || toLocalDate(now),
  };

  return { ...state, tasks: [task, ...(state.tasks || [])] };
}

export function updateTask(state, taskId, input) {
  if (!(state.tasks || []).some((task) => task.id === taskId)) return state;

  const changes = {};
  if (input.title !== undefined) {
    changes.title = input.title.trim();
    if (!changes.title) throw new Error('Informe o título da tarefa.');
  }
  if (input.category !== undefined) changes.category = input.category;
  if (input.priority !== undefined) changes.priority = input.priority;
  if (input.dueDate !== undefined) changes.dueDate = input.dueDate;
  if (input.status !== undefined) changes.status = normalizeTaskStatus(input.status);

  return {
    ...state,
    tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...changes } : task)),
  };
}

export function deleteTask(state, taskId) {
  if (!(state.tasks || []).some((task) => task.id === taskId)) return state;
  return { ...state, tasks: state.tasks.filter((task) => task.id !== taskId) };
}
