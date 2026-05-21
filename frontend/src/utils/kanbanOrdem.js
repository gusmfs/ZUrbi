const STORAGE_KEY = 'zurbi-kanban-ordem';

export const COL_SEM_ORGAO = 'sem-orgao';

export function carregarOrdemKanban() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function salvarOrdemKanban(ordem) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordem));
  } catch {
    /* ignore quota */
  }
}

/** Ordena itens conforme ids salvos; novos cards vão ao final. */
export function aplicarOrdemColuna(itens, columnId, ordemMap) {
  const ordem = ordemMap?.[columnId];
  if (!ordem?.length) return itens;

  const byId = new Map(itens.map((o) => [o.id, o]));
  const resultado = [];

  for (const id of ordem) {
    if (byId.has(id)) {
      resultado.push(byId.get(id));
      byId.delete(id);
    }
  }
  for (const restante of byId.values()) {
    resultado.push(restante);
  }
  return resultado;
}

export function reordenarLista(ids, draggedId, targetId) {
  if (!draggedId || draggedId === targetId) return ids;
  const lista = ids.filter((id) => id !== draggedId);
  if (!targetId) return [...lista, draggedId];
  const idx = lista.indexOf(targetId);
  if (idx === -1) return [...lista, draggedId];
  lista.splice(idx, 0, draggedId);
  return lista;
}

export function idsDaColuna(itens) {
  return itens.map((o) => o.id);
}
