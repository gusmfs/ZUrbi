const CATEGORIA_LABEL = {
  VIARIO: 'Viário',
  ILUMINACAO: 'Iluminação',
  SANEAMENTO: 'Saneamento',
  TRANSITO: 'Trânsito',
  LIMPEZA: 'Limpeza',
};

const STATUS_LABEL = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em análise',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  ENCAMINHADO_EMERGENCIA: 'Emergência',
  CANCELADO: 'Cancelado',
};

const URGENCIA_LABEL = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
};

export function labelCategoria(c) {
  return CATEGORIA_LABEL[c] || c;
}

export function labelStatus(s) {
  return STATUS_LABEL[s] || s;
}

export function labelUrgencia(u) {
  return URGENCIA_LABEL[u] || u;
}

export function agregarPorBairro(ocorrencias) {
  const map = {};
  for (const o of ocorrencias) {
    const b = o.bairro || 'Sem bairro';
    map[b] = (map[b] || 0) + 1;
  }
  return Object.entries(map)
    .map(([bairro, total]) => ({ bairro, total }))
    .sort((a, b) => b.total - a.total);
}

export function agregarPorCategoria(ocorrencias) {
  const map = {};
  for (const o of ocorrencias) {
    map[o.categoria] = (map[o.categoria] || 0) + 1;
  }
  return Object.entries(map).map(([categoria, total]) => ({
    categoria: labelCategoria(categoria),
    total,
  }));
}

export function contarPorStatus(ocorrencias) {
  const map = {};
  for (const o of ocorrencias) {
    map[o.status] = (map[o.status] || 0) + 1;
  }
  return map;
}

/** KPIs da home pública (chamados ativos, alinhado ao backend). */
export function calcularEstatisticasPublicas(ocorrencias) {
  const porStatus = contarPorStatus(
    ocorrencias.filter((o) => o.status !== 'CANCELADO')
  );
  return {
    total: Object.values(porStatus).reduce((s, n) => s + n, 0),
    emAnalise: (porStatus.RECEBIDO || 0) + (porStatus.EM_ANALISE || 0),
    emAndamento:
      (porStatus.EM_ANDAMENTO || 0) + (porStatus.ENCAMINHADO_EMERGENCIA || 0),
    resolvidos: porStatus.CONCLUIDO || 0,
  };
}

export function badgeClassStatus(status) {
  if (status === 'CONCLUIDO') return 'success';
  if (status === 'EM_ANDAMENTO' || status === 'ENCAMINHADO_EMERGENCIA') return 'primary';
  if (status === 'CANCELADO') return 'secondary';
  return 'warning';
}
