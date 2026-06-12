import api from './api';

/**
 * Cadastra novo cidadão no backend.
 * @param {{ nome: string, cpf: string, email: string, senha: string }} dados
 */
export async function criarUsuario(dados) {
  const { data } = await api.post('/api/usuarios', {
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email,
    senha: dados.senha,
    tipo: 'CIDADAO',
  });
  return data;
}
