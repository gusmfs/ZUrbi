import { labelCategoria, labelStatus, labelUrgencia } from '../../utils/centralIa';

const STATUS_CLASS = {
  RECEBIDO: 'status-recebido',
  EM_ANALISE: 'status-analise',
  EM_ANDAMENTO: 'status-andamento',
  CONCLUIDO: 'status-concluido',
  ENCAMINHADO_EMERGENCIA: 'status-emergencia',
  CANCELADO: 'status-cancelado',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CentralIADetalhe({
  detalhe,
  selectedResumo,
  loadingDetalhe,
  triagem,
  loadingTriagem,
  triagemError,
  triagemFeedback,
  orgaoSugeridoLabel,
  verdictClass,
  podeConfirmar,
  precisaAplicar,
  aplicandoTriagem,
  onConfirmar,
}) {
  if (loadingDetalhe) {
    return <p className="cia-muted">Carregando detalhe...</p>;
  }

  if (!detalhe && selectedResumo) {
    return (
      <div className="cia-detail-body">
        <p className="cia-protocol-lg">{selectedResumo.protocolo}</p>
        <p className="cia-muted">Selecione um chamado para ver histórico completo.</p>
      </div>
    );
  }

  if (!detalhe) {
    return <p className="cia-muted">Nenhum chamado selecionado.</p>;
  }

  return (
    <div className="cia-detail-body">
      <p className="cia-protocol-lg">{detalhe.protocolo}</p>
      <h3 className="cia-detail-title">{detalhe.subcategoria}</h3>
      <p className="cia-detail-desc">{detalhe.descricao}</p>

      <dl className="cia-meta-grid">
        <div>
          <dt>Bairro</dt>
          <dd>{detalhe.bairro}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>{detalhe.enderecoAproximado || '—'}</dd>
        </div>
        <div>
          <dt>Categoria</dt>
          <dd>{labelCategoria(detalhe.categoria)}</dd>
        </div>
        <div>
          <dt>Cidadão</dt>
          <dd>{detalhe.usuarioNome}</dd>
        </div>
        <div>
          <dt>Órgão atual</dt>
          <dd>{detalhe.orgaoNome || 'Não atribuído'}</dd>
        </div>
        <div>
          <dt>Abertura</dt>
          <dd>{formatDate(detalhe.criadoEm)}</dd>
        </div>
      </dl>

      <div className="cia-flags">
        {detalhe.riscoAcidente && <span className="cia-flag danger">Risco de acidente</span>}
        {detalhe.recorrente && <span className="cia-flag warn">Recorrente</span>}
        <span className={`cia-urgencia urg-${detalhe.urgencia?.toLowerCase()}`}>
          {labelUrgencia(detalhe.urgencia)}
        </span>
        <span className={`cia-status-pill ${STATUS_CLASS[detalhe.status] || ''}`}>
          {labelStatus(detalhe.status)}
        </span>
      </div>

      {(loadingTriagem || triagem || triagemError) && (
        <section className="cia-ai-card">
          <div className="cia-ai-head">
            <div>
              <span className="cia-ai-label">Triagem automática</span>
              <h4>Sugestão de encaminhamento</h4>
            </div>
            {triagem && !loadingTriagem && (
              <span className="cia-ai-badge">Prioridade {triagem.prioridadeScore}</span>
            )}
          </div>

          {loadingTriagem && <p className="cia-muted">Calculando triagem...</p>}

          {triagemError && !loadingTriagem && (
            <p className="cia-ai-error" role="alert">
              {triagemError}
            </p>
          )}

          {triagemFeedback && (
            <p className="cia-ai-success" role="status">
              {triagemFeedback}
            </p>
          )}

          {triagem && !loadingTriagem && (
            <>
              <div className="cia-ai-confidence">
                <div className="cia-ai-bar">
                  <div className="cia-ai-bar-fill" style={{ width: `${triagem.confianca}%` }} />
                </div>
                <span>{triagem.confianca}% confiança</span>
              </div>
              <p className="cia-ai-orgao">
                Encaminhar para: <strong>{orgaoSugeridoLabel}</strong>
              </p>
              {triagem.statusSugerido !== detalhe.status && (
                <p className="cia-ai-status-hint">
                  Status sugerido: <strong>{labelStatus(triagem.statusSugerido)}</strong>
                </p>
              )}
              <ul className="cia-ai-motivos">
                {triagem.motivos.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
              <div className={`cia-ai-verdict ${verdictClass}`}>
                {detalhe.status === 'CANCELADO'
                  ? 'Chamado cancelado — triagem não pode ser aplicada.'
                  : !detalhe.orgaoId
                    ? 'Aguardando atribuição de órgão — confirme para registrar o encaminhamento.'
                    : triagem.alinhadoComOrgaoAtual
                      ? 'Órgão atual alinhado com a sugestão automática.'
                      : 'Divergência detectada — revisão sugerida pelo gestor.'}
              </div>
              <button
                type="button"
                className="cia-btn-primary"
                disabled={!podeConfirmar}
                onClick={onConfirmar}
                title={
                  detalhe.status === 'CANCELADO'
                    ? 'Chamado cancelado'
                    : !triagem.orgaoId
                      ? 'Nenhum órgão sugerido'
                      : !precisaAplicar
                        ? 'Órgão e status já estão alinhados com a sugestão'
                        : undefined
                }
              >
                {aplicandoTriagem ? 'Aplicando...' : 'Confirmar encaminhamento'}
              </button>
            </>
          )}
        </section>
      )}

      {detalhe.historico?.length > 0 && (
        <section className="cia-timeline">
          <h4>Histórico</h4>
          <ol>
            {detalhe.historico.map((h, i) => (
              <li key={i}>
                <span className="cia-tl-status">
                  {labelStatus(h.statusAnterior)} → {labelStatus(h.statusNovo)}
                </span>
                <span className="cia-tl-obs">{h.observacao}</span>
                <time>{formatDate(h.atualizadoEm)}</time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
