import api from './api';

export async function listarOcorrencias(filtros = {}) {
  const params = {};
  if (filtros.bairro) params.bairro = filtros.bairro;
  if (filtros.status) params.status = filtros.status;
  if (filtros.categoria) params.categoria = filtros.categoria;
  if (filtros.usuarioId) params.usuarioId = filtros.usuarioId;

  const { data } = await api.get('/api/ocorrencias', { params });
  return data;
}

export async function buscarOcorrencia(id) {
  const { data } = await api.get(`/api/ocorrencias/${id}`);
  return data;
}

export async function atualizarOrgao(ocorrenciaId, orgaoId, observacao) {
  const { data } = await api.patch(`/api/ocorrencias/${ocorrenciaId}/orgao`, {
    orgaoId: orgaoId ?? null,
    observacao: observacao ?? null,
  });
  return data;
}

/**
 * Registra nova ocorrência (multipart: JSON em "dados" + arquivos em "imagens").
 * @param {object} dados — campos do OcorrenciaRequestDTO
 * @param {File[]} [imagens]
 */
export async function registrarOcorrencia(dados, imagens = []) {
  const formData = new FormData();
  formData.append(
    'dados',
    new Blob([JSON.stringify(dados)], { type: 'application/json' })
  );
  imagens.forEach((arquivo) => {
    if (arquivo) formData.append('imagens', arquivo);
  });

  const { data } = await api.post('/api/ocorrencias', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
