import { createTask } from './taskLifecycle.js';

const CAPTURE_TYPES = new Set(['task', 'thought', 'mood']);

export function applyQuickCapture(state, capture, now = new Date()) {
  const type = capture?.type;
  const text = capture?.text?.trim();

  if (!CAPTURE_TYPES.has(type)) throw new Error('Tipo de registro inválido.');
  if (!text) throw new Error('Escreva algo antes de salvar.');

  const timestamp = now.getTime();
  const date = now.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  if (type === 'task') {
    return createTask(state, { title: text }, now);
  }

  if (type === 'thought') {
    return {
      ...state,
      thoughts: [{
        id: `th_${timestamp}`,
        title: 'Registro rápido',
        content: text,
        tag: 'Rápido',
        prompt: null,
        date,
      }, ...(state.thoughts || [])],
    };
  }

  const moodScore = Number(capture.moodScore);
  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
    throw new Error('Escolha um humor de 1 a 5.');
  }

  return {
    ...state,
    mood: {
      ...(state.mood || {}),
      todayScore: moodScore,
      todayNote: text,
      history: [{ date, score: moodScore, note: text, context: 'Geral' }, ...(state.mood?.history || [])],
    },
  };
}
