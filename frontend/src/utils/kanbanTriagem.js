const ORDEM_URGENCIA = { ALTA: 0, MEDIA: 1, BAIXA: 2 };

const STATUS_FORA_DA_FILA = new Set(['CANCELADO', 'CONCLUIDO']);

/** Chamados que compõem a fila operacional (exclui concluídos e cancelados). */
export function filaKanbanAtiva(ocorrencias) {
  return ocorrencias.filter((o) => !STATUS_FORA_DA_FILA.has(o.status));
}

/** Sem órgão na mesma base do Kanban (não inclui concluídos/cancelados). */
export function contarSemOrgaoNaFila(ocorrencias) {
  return filaKanbanAtiva(ocorrencias).filter((o) => !o.orgaoId).length;
}

export function ordenarCardsKanban(a, b) {
  const ua = ORDEM_URGENCIA[a.urgencia] ?? 9;
  const ub = ORDEM_URGENCIA[b.urgencia] ?? 9;
  if (ua !== ub) return ua - ub;
  return new Date(b.criadoEm) - new Date(a.criadoEm);
}

/**
 * Colunas do Kanban: "Sem órgão" + uma coluna por órgão cadastrado (ordem por sigla).
 */
export function montarColunasKanban(ocorrencias, orgaos, ordemMap = null) {
  const ativos = filaKanbanAtiva(ocorrencias);

  const semOrgaoBase = ativos.filter((o) => !o.orgaoId).sort(ordenarCardsKanban);
  const semOrgao = ordemMap
    ? aplicarOrdemImportada(semOrgaoBase, ordemMap['sem-orgao'])
    : semOrgaoBase;

  const colunasOrgaos = [...orgaos]
    .sort((a, b) => (a.sigla || a.nome).localeCompare(b.sigla || b.nome, 'pt-BR'))
    .map((orgao) => {
      const itensBase = ativos.filter((o) => o.orgaoId === orgao.id).sort(ordenarCardsKanban);
      const itens = ordemMap ? aplicarOrdemImportada(itensBase, ordemMap[orgao.id]) : itensBase;
      return { id: orgao.id, orgao, itens };
    });

  return {
    semOrgao,
    colunasOrgaos,
    totalAtivos: ativos.length,
  };
}

function aplicarOrdemImportada(itens, ordemIds) {
  if (!ordemIds?.length) return itens;
  const byId = new Map(itens.map((o) => [o.id, o]));
  const resultado = [];
  for (const id of ordemIds) {
    if (byId.has(id)) {
      resultado.push(byId.get(id));
      byId.delete(id);
    }
  }
  for (const o of byId.values()) resultado.push(o);
  return resultado;
}
