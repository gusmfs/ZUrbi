import api from './api';

/** Triagem na abertura do chamado (antes de existir ocorrência no banco). */
export async function classificarChamado({ descricao, riscoAcidente, recorrente }) {
  const { data } = await api.post('/api/triagem/classificar', {
    descricao,
    riscoAcidente: Boolean(riscoAcidente),
    recorrente: Boolean(recorrente),
  });
  return data;
}

export async function obterTriagem(ocorrenciaId) {
  const { data } = await api.get(`/api/ocorrencias/${ocorrenciaId}/triagem`);
  return data;
}

export async function aplicarTriagem(ocorrenciaId, observacaoGestor) {
  const body = observacaoGestor ? { observacaoGestor } : {};
  const { data } = await api.post(
    `/api/ocorrencias/${ocorrenciaId}/triagem/aplicar`,
    body
  );
  return data;
}
