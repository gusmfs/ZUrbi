import api from './api';

export async function obterStatusAssistente() {
  const { data } = await api.get('/api/assistente/status');
  return data;
}

export async function enviarMensagemAssistente({
  mensagem,
  ocorrenciaSelecionadaId,
  historico,
}) {
  const { data } = await api.post(
    '/api/assistente/chat',
    {
      mensagem,
      ocorrenciaSelecionadaId: ocorrenciaSelecionadaId || null,
      historico: historico || [],
    },
    { timeout: 130000 }
  );
  return data;
}
