import { useCallback, useEffect, useRef, useState } from 'react';
import { enviarMensagemAssistente, obterStatusAssistente } from '../../services/assistente';
import { ConteudoMensagemAssistente } from '../../utils/renderMarkdownAssistente';
import './CentralIAAssistente.css';

const SUGESTOES = [
  'O que devo priorizar na fila agora?',
  'Quantos chamados foram resolvidos até agora?',
  'Quantos chamados estão sem órgão?',
  'Liste os chamados prioritários em tabela',
  'Quantos chamados em aberto na SOI?',
];

const MENSAGEM_BOAS_VINDAS = {
  role: 'assistant',
  content:
    'Olá! Sou o assistente da Central de Operações e estou aqui para ajudar você a entender a fila de chamados e as estatísticas de Porto Seguro.\n\n'
    + 'Ainda estou no começo — em algumas perguntas posso demorar um pouquinho para responder, mas estou aprendendo e vou melhorar a cada uso. '
    + 'Pode me perguntar quantos chamados há por secretaria e, na sequência, pedir a lista em tabela — mantenho o mesmo órgão da conversa.',
};

function mensagemContemTabela(content) {
  return typeof content === 'string' && /^\s*\|/m.test(content);
}

function extrairMensagemErro(err) {
  return (
    err?.response?.data?.mensagem
    || err?.message
    || 'Não foi possível obter resposta do assistente.'
  );
}

export default function CentralIAAssistente() {
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState(null);
  const [mensagens, setMensagens] = useState([MENSAGEM_BOAS_VINDAS]);
  const [entrada, setEntrada] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const listaRef = useRef(null);

  const recarregarStatus = useCallback(() => {
    obterStatusAssistente()
      .then(setStatus)
      .catch(() => setStatus({ disponivel: false, habilitado: true, orientacao: 'Backend indisponível.' }));
  }, []);

  useEffect(() => {
    recarregarStatus();
  }, [recarregarStatus]);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensagens, aberto, enviando]);

  const enviar = async (texto) => {
    const mensagem = (texto || entrada).trim();
    if (!mensagem || enviando) return;

    setErro(null);
    setEnviando(true);
    const historico = mensagens
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10);

    setMensagens((prev) => [...prev, { role: 'user', content: mensagem }]);
    setEntrada('');

    try {
      const res = await enviarMensagemAssistente({
        mensagem,
        ocorrenciaSelecionadaId: null,
        historico,
      });
      setMensagens((prev) => [...prev, { role: 'assistant', content: res.resposta }]);
      if (!status?.disponivel) recarregarStatus();
    } catch (err) {
      const msg = extrairMensagemErro(err);
      setErro(msg);
      setMensagens((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Não consegui consultar o Ollama. ${msg}`,
        },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviar();
  };

  const ollamaOk = status?.disponivel;

  return (
    <div className={`cia-assistente${aberto ? ' is-open' : ''}`}>
      {aberto && (
        <section
          className="cia-assistente-panel"
          role="dialog"
          aria-label="Assistente operacional zUrbi"
        >
          <header className="cia-assistente-header">
            <div>
              <h2>Assistente zUrbi</h2>
              <p className="cia-assistente-sub">
                {ollamaOk ? (
                  <>
                    <span className="cia-assistente-dot cia-assistente-dot--on" aria-hidden />
                    Ollama · {status?.modelo || 'modelo'}
                  </>
                ) : (
                  <>
                    <span className="cia-assistente-dot" aria-hidden />
                    Ollama offline — {status?.orientacao || 'verifique o serviço'}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              className="cia-assistente-close"
              onClick={() => setAberto(false)}
              aria-label="Fechar assistente"
            >
              ✕
            </button>
          </header>

          <div className="cia-assistente-corpo">
            <div className="cia-assistente-scroll" ref={listaRef}>
              <div className="cia-assistente-sugestoes" role="group" aria-label="Perguntas sugeridas">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="cia-assistente-chip"
                    disabled={enviando}
                    onClick={() => enviar(s)}
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="cia-assistente-mensagens">
                {mensagens.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={[
                      'cia-assistente-msg',
                      `cia-assistente-msg--${m.role}`,
                      m.role === 'assistant' && mensagemContemTabela(m.content)
                        ? 'cia-assistente-msg--com-tabela'
                        : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <ConteudoMensagemAssistente content={m.content} role={m.role} />
                  </div>
                ))}
                {enviando && (
                  <div className="cia-assistente-msg cia-assistente-msg--assistant">
                    <p className="cia-assistente-typing">Analisando a fila…</p>
                  </div>
                )}
              </div>
            </div>

            {erro && (
              <p className="cia-assistente-erro" role="alert">
                {erro}
              </p>
            )}

            <form className="cia-assistente-form" onSubmit={handleSubmit}>
              <textarea
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Mensagem"
                rows={1}
                disabled={enviando}
                aria-label="Mensagem para o assistente"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
              />
              <button
                type="submit"
                className="cia-assistente-enviar"
                disabled={enviando || !entrada.trim()}
                aria-label="Enviar mensagem"
              />
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        className="cia-assistente-fab"
        onClick={() => setAberto((o) => !o)}
        aria-expanded={aberto}
        aria-label={aberto ? 'Fechar assistente' : 'Abrir assistente operacional'}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path
            fill="currentColor"
            d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2Z"
          />
        </svg>
        <span>Assistente</span>
      </button>
    </div>
  );
}
