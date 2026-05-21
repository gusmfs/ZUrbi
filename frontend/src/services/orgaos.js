import api from './api';

export async function listarOrgaos() {
  const { data } = await api.get('/api/orgaos');
  return data;
}
