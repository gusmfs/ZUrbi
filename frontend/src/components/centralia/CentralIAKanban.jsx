import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { atualizarOrgao } from '../../services/ocorrencias';
import { montarColunasKanban } from '../../utils/kanbanTriagem';
import {
  COL_SEM_ORGAO,
  carregarOrdemKanban,
  idsDaColuna,
  reordenarLista,
  salvarOrdemKanban,
} from '../../utils/kanbanOrdem';
import { labelCategoria, labelStatus, labelUrgencia } from '../../utils/centralIa';
import CentralIADetalhe from './CentralIADetalhe';

const STATUS_CLASS = {
  RECEBIDO: 'status-recebido',
  EM_ANALISE: 'status-analise',
  EM_ANDAMENTO: 'status-andamento',
  CONCLUIDO: 'status-concluido',
  ENCAMINHADO_EMERGENCIA: 'status-emergencia',
  CANCELADO: 'status-cancelado',
};

function KanbanCard({
  ocorrencia,
  selected,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onDropOnCard,
  isDropTarget,
}) {
  const arrastou = useRef(false);

  return (
    <div
      className={`cia-kanban-card-wrap ${selected ? 'active' : ''} ${isDropTarget ? 'drop-target' : ''}`}
      draggable={!!onDragStart}
      onDragStart={(e) => {
        if (!onDragStart) return;
        arrastou.current = true;
        onDragStart(e, ocorrencia.id);
      }}
      onDragEnd={() => {
        onDragEnd();
        setTimeout(() => {
          arrastou.current = false;
        }, 0);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOverCard(ocorrencia.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDropOnCard(ocorrencia.id);
      }}
    >
      <button
        type="button"
        className="cia-kanban-card"
        aria-label={`Abrir chamado ${ocorrencia.protocolo}, ${ocorrencia.subcategoria}, ${ocorrencia.bairro}`}
        onClick={() => {
          if (!arrastou.current) onOpen(ocorrencia.id);
        }}
      >
        <div className="cia-kanban-card-top">
          <span className="cia-protocol">{ocorrencia.protocolo}</span>
          <span
            className={`cia-urgencia-dot urg-${ocorrencia.urgencia?.toLowerCase()}`}
            title={`Urgência ${labelUrgencia(ocorrencia.urgencia)}`}
            aria-label={`Urgência ${labelUrgencia(ocorrencia.urgencia)}`}
          />
        </div>
        <p className="cia-kanban-card-title">{ocorrencia.subcategoria}</p>
        <p className="cia-kanban-card-meta">
          {ocorrencia.bairro} · {labelCategoria(ocorrencia.categoria)}
        </p>
        <span className={`cia-status-pill ${STATUS_CLASS[ocorrencia.status] || ''}`}>
          {labelStatus(ocorrencia.status)}
        </span>
      </button>
    </div>
  );
}

function KanbanColumn({
  columnId,
  titulo,
  sigla,
  count,
  accent,
  emptyLabel,
  isDragOver,
  onDragOverColumn,
  onDropColumn,
  children,
}) {
  return (
    <div className="cia-kanban-column">
      <header
        className="cia-kanban-column-head"
        style={accent ? { borderTopColor: accent } : undefined}
      >
        <div>
          <h3>{titulo}</h3>
          {sigla && <span className="cia-kanban-sigla">{sigla}</span>}
        </div>
        <span className="cia-count">{count}</span>
      </header>
      <div
        className={`cia-kanban-column-body ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOverColumn(columnId);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDropColumn(columnId, null);
        }}
      >
        {count === 0 ? <p className="cia-kanban-empty">{emptyLabel}</p> : children}
      </div>
    </div>
  );
}

export default function CentralIAKanban({
  ocorrencias,
  orgaos,
  loading,
  selectedId,
  onSelect,
  onCloseDetalhe,
  onOcorrenciaAtualizada,
  detalheProps,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [ordemMap, setOrdemMap] = useState(() => carregarOrdemKanban());
  const [dragging, setDragging] = useState(null);
  const [hoverColumnId, setHoverColumnId] = useState(null);
  const [hoverBeforeId, setHoverBeforeId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroMovimento, setErroMovimento] = useState(null);

  const { semOrgao, colunasOrgaos, totalAtivos } = useMemo(
    () => montarColunasKanban(ocorrencias, orgaos, ordemMap),
    [ocorrencias, orgaos, ordemMap]
  );

  const totalColunas = 1 + colunasOrgaos.length;
  const selectedResumo = ocorrencias.find((o) => o.id === selectedId);

  const colunas = useMemo(
    () => [
      { columnId: COL_SEM_ORGAO, titulo: 'Sem órgão', sigla: 'Triagem', itens: semOrgao, accent: 'var(--cia-warn)' },
      ...colunasOrgaos.map((c) => ({
        columnId: c.id,
        titulo: c.orgao.nome,
        sigla: c.orgao.sigla,
        itens: c.itens,
        accent: undefined,
      })),
    ],
    [semOrgao, colunasOrgaos]
  );

  const persistirOrdem = useCallback((novoMap) => {
    setOrdemMap(novoMap);
    salvarOrdemKanban(novoMap);
  }, []);

  const abrirDetalhe = (id) => {
    onSelect(id);
    setModalAberto(true);
  };

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    onCloseDetalhe?.();
  }, [onCloseDetalhe]);

  const handleDragStart = (_e, ocorrenciaId) => {
    const o = ocorrencias.find((x) => x.id === ocorrenciaId);
    const columnId = o?.orgaoId ?? COL_SEM_ORGAO;
    setDragging({ id: ocorrenciaId, columnId });
    setErroMovimento(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setHoverColumnId(null);
    setHoverBeforeId(null);
  };

  const aplicarMovimento = useCallback(
    async (targetColumnId, beforeItemId) => {
      if (!dragging) return;

      const { id: draggedId, columnId: sourceColumnId } = dragging;
      const sourceCol = colunas.find((c) => c.columnId === sourceColumnId);
      const targetCol = colunas.find((c) => c.columnId === targetColumnId);
      if (!sourceCol || !targetCol) return;

      const sourceIds = idsDaColuna(sourceCol.itens);
      const targetIds = idsDaColuna(targetCol.itens).filter((id) => id !== draggedId);

      let novosTargetIds;
      if (beforeItemId && targetIds.includes(beforeItemId)) {
        novosTargetIds = reordenarLista(targetIds, draggedId, beforeItemId);
      } else {
        novosTargetIds = [...targetIds, draggedId];
      }

      const nextMap = { ...ordemMap };
      if (sourceColumnId === targetColumnId) {
        nextMap[targetColumnId] = beforeItemId
          ? reordenarLista(sourceIds, draggedId, beforeItemId)
          : [...sourceIds.filter((id) => id !== draggedId), draggedId];
        persistirOrdem(nextMap);
        handleDragEnd();
        return;
      }

      nextMap[sourceColumnId] = sourceIds.filter((id) => id !== draggedId);
      nextMap[targetColumnId] = novosTargetIds;
      persistirOrdem(nextMap);

      const novoOrgaoId = targetColumnId === COL_SEM_ORGAO ? null : targetColumnId;

      setSalvando(true);
      setErroMovimento(null);
      try {
        const atualizado = await atualizarOrgao(
          draggedId,
          novoOrgaoId,
          'Movido na fila Kanban'
        );
        onOcorrenciaAtualizada?.(atualizado);
      } catch (e) {
        setErroMovimento(
          e.response?.data?.mensagem || 'Não foi possível atualizar o órgão do chamado.'
        );
        persistirOrdem(ordemMap);
      } finally {
        setSalvando(false);
        handleDragEnd();
      }
    },
    [dragging, colunas, ordemMap, persistirOrdem, onOcorrenciaAtualizada]
  );

  useEffect(() => {
    if (!modalAberto) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') fecharModal();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalAberto, fecharModal]);

  if (loading) {
    return <p className="cia-muted cia-kanban-loading">Carregando fila por órgão...</p>;
  }

  return (
    <div className={`cia-kanban-wrap ${salvando ? 'is-saving' : ''}`}>
      <p className="cia-kanban-hint">
        {totalAtivos} chamados na fila · arraste para reordenar ou mover entre órgãos · clique para
        detalhar
      </p>
      {erroMovimento && (
        <p className="cia-kanban-erro" role="alert">
          {erroMovimento}
        </p>
      )}
      {salvando && <p className="cia-kanban-saving">Salvando movimentação…</p>}

      <div
        className="cia-kanban-board"
        role="list"
        style={{ '--kanban-cols': totalColunas }}
      >
        {colunas.map((col) => (
          <KanbanColumn
            key={col.columnId}
            columnId={col.columnId}
            titulo={col.titulo}
            sigla={col.sigla}
            count={col.itens.length}
            accent={col.accent}
            emptyLabel={
              col.columnId === COL_SEM_ORGAO
                ? 'Nenhum chamado aguardando atribuição.'
                : 'Nenhum chamado nesta fila.'
            }
            isDragOver={hoverColumnId === col.columnId && !hoverBeforeId}
            onDragOverColumn={setHoverColumnId}
            onDropColumn={aplicarMovimento}
          >
            {col.itens.map((o) => (
              <KanbanCard
                key={o.id}
                ocorrencia={o}
                selected={modalAberto && selectedId === o.id}
                onOpen={abrirDetalhe}
                onDragStart={salvando ? undefined : handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOverCard={(id) => {
                  setHoverColumnId(col.columnId);
                  setHoverBeforeId(id);
                }}
                onDropOnCard={(beforeId) => aplicarMovimento(col.columnId, beforeId)}
                isDropTarget={hoverBeforeId === o.id && dragging?.id !== o.id}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      {modalAberto && selectedId && (
        <div className="cia-modal-backdrop" role="presentation" onClick={fecharModal}>
          <div
            className="cia-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cia-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cia-modal-head">
              <div>
                <p className="cia-modal-eyebrow">Detalhe e triagem</p>
                <h2 id="cia-modal-title">{selectedResumo?.protocolo || 'Chamado'}</h2>
              </div>
              <button
                type="button"
                className="cia-modal-close"
                onClick={fecharModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>
            <div className="cia-modal-body">
              <CentralIADetalhe {...detalheProps} selectedResumo={selectedResumo} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
