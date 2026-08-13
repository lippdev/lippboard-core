import { normalizeTask } from '../services/taskStatus.js';

export const MIND_MAP_ROOT_ID = 'root';
const MIND_MAP_SIDES = new Set(['left', 'right']);

const normalizeAttachment = (raw, index) => {
  if (!raw || typeof raw !== 'object') return null;
  const type = raw.type === 'image' ? 'image' : raw.type === 'link' ? 'link' : null;
  const url = String(raw.url || '').trim();
  if (!type || !url) return null;
  const attachment = { id: String(raw.id || '').trim() || `att_legacy_${index}`, type, url };
  if (type === 'link') {
    attachment.title = String(raw.title || '').trim();
    attachment.favicon = String(raw.favicon || '').trim();
  }
  return attachment;
};

export const createMindMapNode = (overrides = {}) => {
  const isRoot = !overrides.id || overrides.id === MIND_MAP_ROOT_ID;
  return {
    id: overrides.id || MIND_MAP_ROOT_ID,
    parentId: isRoot ? null : (overrides.parentId ?? null),
    text: String(overrides.text || '').trim() || 'Tópico central',
    side: isRoot ? null : (MIND_MAP_SIDES.has(overrides.side) ? overrides.side : null),
    attachments: Array.isArray(overrides.attachments) ? overrides.attachments.map(normalizeAttachment).filter(Boolean) : [],
    note: String(overrides.note || '').trim(),
    noteCollapsed: Boolean(overrides.noteCollapsed),
    color: overrides.color ? String(overrides.color).trim() : null,
  };
};

export const createDefaultState = () => ({
  tasks: [],
  thoughts: [],
  mood: { todayScore: 0, todayNote: '', history: [] },
  mindMaps: [],
});

const normalizeMindMapNodes = (nodes) => {
  const byId = new Map();
  (Array.isArray(nodes) ? nodes : []).forEach((node) => {
    const id = String(node?.id || '').trim();
    if (!id || byId.has(id)) return;
    byId.set(id, createMindMapNode({ ...node, id }));
  });
  if (!byId.has(MIND_MAP_ROOT_ID)) byId.set(MIND_MAP_ROOT_ID, createMindMapNode());

  const reachable = new Set([MIND_MAP_ROOT_ID]);
  const resolvedSide = new Map([[MIND_MAP_ROOT_ID, null]]);
  let rootChildIndex = 0;
  let changed = true;
  while (changed) {
    changed = false;
    byId.forEach((node) => {
      if (reachable.has(node.id) || !reachable.has(node.parentId)) return;
      reachable.add(node.id);
      const side = node.parentId === MIND_MAP_ROOT_ID
        ? node.side || (rootChildIndex++ % 2 === 0 ? 'right' : 'left')
        : node.side || resolvedSide.get(node.parentId) || 'right';
      resolvedSide.set(node.id, side);
      changed = true;
    });
  }
  return [...byId.values()]
    .filter((node) => reachable.has(node.id))
    .map((node) => node.id === MIND_MAP_ROOT_ID ? node : { ...node, side: resolvedSide.get(node.id) });
};

const normalizeMindMaps = (maps) => (Array.isArray(maps) ? maps : []).map((map, index) => {
  const nodes = normalizeMindMapNodes(map?.nodes);
  const root = nodes.find((node) => node.id === MIND_MAP_ROOT_ID);
  const now = new Date().toISOString();
  return {
    id: String(map?.id || '').trim() || `mm_legacy_${index}`,
    title: String(map?.title || root?.text || 'Mapa sem título').trim() || 'Mapa sem título',
    createdAt: map?.createdAt || now,
    updatedAt: map?.updatedAt || now,
    nodes,
  };
});

export const normalizeAppState = (state) => {
  const defaults = createDefaultState();
  const current = state || {};
  return {
    tasks: Array.isArray(current.tasks) ? current.tasks.map(normalizeTask) : [],
    thoughts: Array.isArray(current.thoughts) ? current.thoughts : [],
    mood: { ...defaults.mood, ...(current.mood || {}) },
    mindMaps: normalizeMindMaps(current.mindMaps),
  };
};
