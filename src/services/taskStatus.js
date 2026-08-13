export const TASK_STATUS = {
  TODO: 'a_fazer',
  DONE: 'feita',
  CANCELED: 'cancelada'
};

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TODO, label: 'A fazer', emoji: '⏳', color: 'var(--info)', bg: 'var(--info-bg)' },
  { value: TASK_STATUS.DONE, label: 'Feita', emoji: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
  { value: TASK_STATUS.CANCELED, label: 'Cancelada / não fiz', emoji: '⛔', color: 'var(--danger)', bg: 'var(--danger-bg)' }
];

const LEGACY_MAP = {
  pendente: TASK_STATUS.TODO,
  concluida: TASK_STATUS.DONE,
  cancelado: TASK_STATUS.CANCELED,
  cancelada: TASK_STATUS.CANCELED
};

export const normalizeTaskStatus = (status) => LEGACY_MAP[status] || status || TASK_STATUS.TODO;

export const getTaskStatusMeta = (status) => {
  const normalized = normalizeTaskStatus(status);
  return TASK_STATUS_OPTIONS.find((item) => item.value === normalized) || TASK_STATUS_OPTIONS[0];
};

export const normalizeTask = (task) => ({
  ...task,
  status: normalizeTaskStatus(task?.status)
});
