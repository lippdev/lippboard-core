const toLocalDate = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getDate()}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export function createNote(state, input, now = new Date()) {
  const content = input?.content?.trim();
  if (!content) throw new Error('Escreva o conteúdo da nota.');

  const note = {
    id: `th_${now.getTime()}`,
    title: input.title?.trim() || 'Nota sem título',
    content,
    tag: input.tag?.trim() || 'Geral',
    prompt: input.prompt || '',
    date: toLocalDate(now),
  };

  return { ...state, thoughts: [note, ...(state.thoughts || [])] };
}

export function updateNote(state, noteId, input) {
  if (!(state.thoughts || []).some((note) => note.id === noteId)) return state;
  const changes = {};
  if (input.title !== undefined) changes.title = input.title.trim() || 'Nota sem título';
  if (input.content !== undefined) {
    changes.content = input.content.trim();
    if (!changes.content) throw new Error('Escreva o conteúdo da nota.');
  }
  if (input.tag !== undefined) changes.tag = input.tag.trim() || 'Geral';

  return {
    ...state,
    thoughts: state.thoughts.map((note) => (note.id === noteId ? { ...note, ...changes } : note)),
  };
}

export function deleteNote(state, noteId) {
  return { ...state, thoughts: (state.thoughts || []).filter((note) => note.id !== noteId) };
}

export function searchNotes(state, query) {
  const term = String(query || '').trim().toLocaleLowerCase();
  if (!term) return state.thoughts || [];
  return (state.thoughts || []).filter((note) => [note.title, note.content, note.tag]
    .some((value) => String(value || '').toLocaleLowerCase().includes(term)));
}
