import { isTaskDueToday, updateTask } from './taskLifecycle.js';

const PRIORITY_WEIGHT = { Alta: 0, Média: 1, Baixa: 2 };

export function getProductivitySnapshot(state, now = new Date()) {
  const tasks = state.tasks || [];
  const pending = tasks
    .filter((task) => task.status !== 'feita')
    .sort((a, b) => (PRIORITY_WEIGHT[a.priority] ?? 3) - (PRIORITY_WEIGHT[b.priority] ?? 3));
  const completedCount = tasks.length - pending.length;

  return {
    focusTask: pending[0] || null,
    pending,
    todayTasks: pending.filter((task) => isTaskDueToday(task, now)),
    completedCount,
    totalCount: tasks.length,
    progress: tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0,
  };
}

export function completeProductivityTask(state, taskId) {
  return updateTask(state, taskId, { status: 'feita' });
}
