import { MIND_MAP_ROOT_ID, createMindMapNode } from '../domain/appState.js';

const MAX_NOTE_LENGTH = 280;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const DATA_IMAGE_RE = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,([a-z0-9+/=]+)$/i;

const findMindMap = (state, mapId) => (state.mindMaps || []).find((map) => map.id === mapId) || null;

const replaceMindMap = (state, mapId, updater) => {
  if (!findMindMap(state, mapId)) return state;
  return {
    ...state,
    mindMaps: state.mindMaps.map((map) => (map.id === mapId ? updater(map) : map)),
  };
};

const replaceNode = (state, mapId, nodeId, updater, now) => replaceMindMap(state, mapId, (map) => ({
  ...map,
  nodes: map.nodes.map((node) => (node.id === nodeId ? updater(node) : node)),
  updatedAt: now.toISOString(),
}));

const collectSubtreeIds = (nodes, nodeId) => {
  const ids = new Set([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach((node) => {
      if (ids.has(node.parentId) && !ids.has(node.id)) {
        ids.add(node.id);
        changed = true;
      }
    });
  }
  return ids;
};

const buildChildNode = (map, parentId, side, text, now) => {
  const trimmed = text?.trim();
  if (!trimmed) throw new Error('Escreva o texto do novo tópico.');
  return createMindMapNode({
    id: `n_${now.getTime()}_${map.nodes.length}`,
    parentId,
    side,
    text: trimmed,
  });
};

export function getMindMap(state, mapId) {
  return findMindMap(state, mapId);
}

export function createMindMap(state, input, now = new Date()) {
  const title = input?.title?.trim() || 'Mapa sem título';
  const map = {
    id: `mm_${now.getTime()}`,
    title,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    nodes: [createMindMapNode({ text: title })],
  };
  return { ...state, mindMaps: [map, ...(state.mindMaps || [])] };
}

export function renameMindMap(state, mapId, title, now = new Date()) {
  const trimmed = title?.trim();
  if (!trimmed) throw new Error('Informe um nome para o mapa.');
  return replaceMindMap(state, mapId, (map) => ({
    ...map,
    title: trimmed,
    nodes: map.nodes.map((node) => (node.id === MIND_MAP_ROOT_ID ? { ...node, text: trimmed } : node)),
    updatedAt: now.toISOString(),
  }));
}

export function deleteMindMap(state, mapId) {
  return { ...state, mindMaps: (state.mindMaps || []).filter((map) => map.id !== mapId) };
}

/**
 * Adds a directional child. Direct children of root pick a side from
 * input.side (default 'right'); deeper nodes always inherit their parent's
 * side so a branch never crosses back across the map's center.
 */
export function addMindMapNode(state, mapId, parentNodeId, input, now = new Date()) {
  const map = findMindMap(state, mapId);
  const parent = map?.nodes.find((node) => node.id === parentNodeId);
  if (!map || !parent) return state;

  const side = parentNodeId === MIND_MAP_ROOT_ID
    ? (input?.side === 'left' ? 'left' : 'right')
    : parent.side;
  const node = buildChildNode(map, parentNodeId, side, input?.text, now);

  return replaceMindMap(state, mapId, (current) => ({
    ...current,
    nodes: [...current.nodes, node],
    updatedAt: now.toISOString(),
  }));
}

export function addMindMapSibling(state, mapId, siblingNodeId, input, now = new Date()) {
  const map = findMindMap(state, mapId);
  const reference = map?.nodes.find((node) => node.id === siblingNodeId);
  if (!map || !reference) return state;
  if (reference.id === MIND_MAP_ROOT_ID) throw new Error('O tópico central não tem irmãos.');

  const node = buildChildNode(map, reference.parentId, reference.side, input?.text, now);

  return replaceMindMap(state, mapId, (current) => ({
    ...current,
    nodes: [...current.nodes, node],
    updatedAt: now.toISOString(),
  }));
}

export function updateMindMapNodeText(state, mapId, nodeId, text, now = new Date()) {
  const trimmed = text?.trim();
  if (!trimmed) throw new Error('Escreva o texto do tópico.');

  return replaceMindMap(state, mapId, (map) => ({
    ...map,
    title: nodeId === MIND_MAP_ROOT_ID ? trimmed : map.title,
    nodes: map.nodes.map((node) => (node.id === nodeId ? { ...node, text: trimmed } : node)),
    updatedAt: now.toISOString(),
  }));
}

export function deleteMindMapNode(state, mapId, nodeId, now = new Date()) {
  if (nodeId === MIND_MAP_ROOT_ID) return state;
  return replaceMindMap(state, mapId, (map) => {
    const idsToRemove = collectSubtreeIds(map.nodes, nodeId);
    return {
      ...map,
      nodes: map.nodes.filter((node) => !idsToRemove.has(node.id)),
      updatedAt: now.toISOString(),
    };
  });
}

export function isValidLinkUrl(url) {
  try {
    const parsed = new URL(String(url || '').trim());
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function estimateDataUrlBytes(dataUrl) {
  const match = DATA_IMAGE_RE.exec(String(dataUrl || '').trim());
  if (!match) return Infinity;
  return Math.floor((match[2].length * 3) / 4);
}

export function isValidImageSource(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  if (isValidLinkUrl(value)) return true;
  if (DATA_IMAGE_RE.test(value)) return estimateDataUrlBytes(value) <= MAX_IMAGE_BYTES;
  return false;
}

export function deriveLinkMeta(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
    return { title: `${parsed.hostname}${path}`, favicon: `${parsed.origin}/favicon.ico` };
  } catch {
    return { title: url, favicon: '' };
  }
}

export function addMindMapAttachment(state, mapId, nodeId, input, now = new Date()) {
  const map = findMindMap(state, mapId);
  if (!map || !map.nodes.some((node) => node.id === nodeId)) return state;

  const type = input?.type === 'image' ? 'image' : 'link';
  const url = String(input?.url || '').trim();
  if (type === 'link') {
    if (!isValidLinkUrl(url)) throw new Error('Informe um link http(s) válido.');
  } else if (!isValidImageSource(url)) {
    throw new Error('Imagem inválida ou maior que 2 MB.');
  }

  const attachmentCount = map.nodes.reduce((total, node) => total + node.attachments.length, 0);
  const attachment = { id: `att_${now.getTime()}_${attachmentCount}`, type, url };
  if (type === 'link') {
    const meta = deriveLinkMeta(url);
    attachment.title = meta.title;
    attachment.favicon = meta.favicon;
  }

  return replaceNode(state, mapId, nodeId, (node) => ({
    ...node,
    attachments: [...node.attachments, attachment],
  }), now);
}

export function removeMindMapAttachment(state, mapId, nodeId, attachmentId, now = new Date()) {
  return replaceNode(state, mapId, nodeId, (node) => ({
    ...node,
    attachments: node.attachments.filter((attachment) => attachment.id !== attachmentId),
  }), now);
}

export function updateMindMapNodeNote(state, mapId, nodeId, note, now = new Date()) {
  const trimmed = String(note || '').trim().slice(0, MAX_NOTE_LENGTH);
  return replaceNode(state, mapId, nodeId, (node) => ({ ...node, note: trimmed }), now);
}

export function setMindMapNoteCollapsed(state, mapId, nodeId, collapsed, now = new Date()) {
  return replaceNode(state, mapId, nodeId, (node) => ({ ...node, noteCollapsed: Boolean(collapsed) }), now);
}

export function updateMindMapNodeColor(state, mapId, nodeId, color, now = new Date()) {
  return replaceNode(state, mapId, nodeId, (node) => ({ ...node, color: color || null }), now);
}

/**
 * Bilateral tidy-tree layout: root sits at depth 0, its children fan out to
 * depth 1..N on their own side (left/right), each side gets independent
 * vertical slots so left/right subtrees never fight for row space. Leaves
 * get sequential slots; parents center on their children's slot midpoint.
 * depth/slot are grid units — callers convert to pixels and apply pan/zoom.
 */
export function getMindMapLayout(map) {
  const nodes = map?.nodes || [];
  const root = nodes.find((node) => node.id === MIND_MAP_ROOT_ID);
  if (!root) return [];

  const childrenByParent = new Map();
  nodes.forEach((node) => {
    const key = node.parentId;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(node);
  });

  const positions = new Map();
  const slotCounters = { left: 0, right: 0 };

  const visit = (node, depth, side) => {
    const children = childrenByParent.get(node.id) || [];
    let slot;
    if (!children.length) {
      slot = slotCounters[side];
      slotCounters[side] += 1;
    } else {
      const childSlots = children.map((child) => visit(child, depth + 1, side));
      slot = (childSlots[0] + childSlots[childSlots.length - 1]) / 2;
    }
    positions.set(node.id, {
      id: node.id,
      parentId: node.parentId,
      text: node.text,
      side,
      depth,
      slot,
      hasChildren: children.length > 0,
      attachments: node.attachments,
      note: node.note,
      noteCollapsed: node.noteCollapsed,
      color: node.color,
    });
    return slot;
  };

  const rootChildren = childrenByParent.get(root.id) || [];
  const rightSlots = rootChildren.filter((node) => node.side !== 'left').map((node) => visit(node, 1, 'right'));
  const leftSlots = rootChildren.filter((node) => node.side === 'left').map((node) => visit(node, 1, 'left'));
  const allSlots = [...rightSlots, ...leftSlots];
  const rootSlot = allSlots.length ? (Math.min(...allSlots) + Math.max(...allSlots)) / 2 : 0;

  positions.set(root.id, {
    id: root.id,
    parentId: null,
    text: root.text,
    side: 'root',
    depth: 0,
    slot: rootSlot,
    hasChildren: rootChildren.length > 0,
    attachments: root.attachments,
    note: root.note,
    noteCollapsed: root.noteCollapsed,
    color: root.color,
  });

  return nodes.map((node) => positions.get(node.id)).filter(Boolean);
}
