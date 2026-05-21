import { useCallback, useEffect, useMemo, useState } from 'react';

import {

  Bar,

  BarChart,

  CartesianGrid,

  Cell,

  ResponsiveContainer,

  Tooltip,

  XAxis,

  YAxis,

} from 'recharts';

import CentralIAKanban from '../components/centralia/CentralIAKanban';
import CentralIAMapa from '../components/centralia/CentralIAMapa';

import CentralIADetalhe from '../components/centralia/CentralIADetalhe';
import CentralIAAssistente from '../components/centralia/CentralIAAssistente';

import { listarOcorrencias, buscarOcorrencia } from '../services/ocorrencias';

import { listarOrgaos } from '../services/orgaos';

import { obterTriagem, aplicarTriagem } from '../services/triagem';

import {

  agregarPorBairro,

  agregarPorCategoria,

  contarPorStatus,

  labelCategoria,

  labelStatus,

  labelUrgencia,

} from '../utils/centralIa';

import { contarSemOrgaoNaFila, filaKanbanAtiva } from '../utils/kanbanTriagem';

import { ZURBI_BRAND, chartColorByIndex } from '../constants/brandColors';

import './CentralIA.css';



const ABAS = [

  { id: 'geral', label: 'Geral' },

  { id: 'kanban', label: 'Fila de triagem' },

];



const STATUS_CLASS = {

  RECEBIDO: 'status-recebido',

  EM_ANALISE: 'status-analise',

  EM_ANDAMENTO: 'status-andamento',

  CONCLUIDO: 'status-concluido',

  ENCAMINHADO_EMERGENCIA: 'status-emergencia',

  CANCELADO: 'status-cancelado',

};



export default function CentralIA() {

  const [aba, setAba] = useState('geral');

  const [ocorrencias, setOcorrencias] = useState([]);

  const [orgaos, setOrgaos] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [detalhe, setDetalhe] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const [error, setError] = useState(null);

  const [filtroStatus, setFiltroStatus] = useState('');

  const [filtroBairro, setFiltroBairro] = useState('');

  const [busca, setBusca] = useState('');

  const [triagem, setTriagem] = useState(null);

  const [loadingTriagem, setLoadingTriagem] = useState(false);

  const [triagemError, setTriagemError] = useState(null);

  const [aplicandoTriagem, setAplicandoTriagem] = useState(false);

  const [triagemFeedback, setTriagemFeedback] = useState(null);



  const carregar = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const [data, listaOrgaos] = await Promise.all([

        listarOcorrencias(),

        listarOrgaos(),

      ]);

      setOcorrencias(data);

      setOrgaos(listaOrgaos);

      setSelectedId((prev) => {

        if (prev && data.some((o) => o.id === prev)) return prev;

        return data.length > 0 ? data[0].id : null;

      });

    } catch {

      setError(

        'Não foi possível conectar à API. Verifique se o backend está em http://localhost:8080 e reinicie o frontend (npm run dev).'

      );

      setOcorrencias([]);

      setOrgaos([]);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    carregar();

  }, [carregar]);



  useEffect(() => {

    if (!selectedId) {

      setDetalhe(null);

      setTriagem(null);

      setTriagemError(null);

      setTriagemFeedback(null);

      return;

    }

    let cancelled = false;

    setTriagemFeedback(null);

    (async () => {

      setLoadingDetalhe(true);

      setLoadingTriagem(true);

      setTriagemError(null);

      try {

        const [d, t] = await Promise.all([

          buscarOcorrencia(selectedId),

          obterTriagem(selectedId),

        ]);

        if (!cancelled) {

          setDetalhe(d);

          setTriagem(t);

        }

      } catch {

        if (!cancelled) {

          setDetalhe(null);

          setTriagem(null);

          setTriagemError('Não foi possível carregar o detalhe ou a triagem deste chamado.');

        }

      } finally {

        if (!cancelled) {

          setLoadingDetalhe(false);

          setLoadingTriagem(false);

        }

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [selectedId]);



  const atualizarItemNaLista = useCallback((atualizado) => {

    setOcorrencias((prev) =>

      prev.map((o) =>

        o.id === atualizado.id

          ? {

              ...o,

              orgaoId: atualizado.orgaoId,

              orgaoNome: atualizado.orgaoNome,

              status: atualizado.status,

            }

          : o

      )

    );

  }, []);



  const confirmarEncaminhamento = async () => {

    if (!selectedId || aplicandoTriagem) return;

    setAplicandoTriagem(true);

    setTriagemError(null);

    setTriagemFeedback(null);

    try {

      const atualizado = await aplicarTriagem(

        selectedId,

        'Confirmado na Central de Operações'

      );

      setDetalhe(atualizado);

      atualizarItemNaLista(atualizado);

      const t = await obterTriagem(selectedId);

      setTriagem(t);

      setTriagemFeedback('Encaminhamento confirmado e registrado no histórico.');

    } catch (e) {

      const msg =

        e.response?.data?.mensagem ||

        'Não foi possível aplicar a triagem. Verifique o status do chamado e tente novamente.';

      setTriagemError(msg);

    } finally {

      setAplicandoTriagem(false);

    }

  };



  const bairros = useMemo(() => {

    const set = new Set(ocorrencias.map((o) => o.bairro).filter(Boolean));

    return [...set].sort();

  }, [ocorrencias]);



  const filaFiltrada = useMemo(() => {

    const q = busca.trim().toLowerCase();

    return ocorrencias.filter((o) => {

      if (filtroStatus && o.status !== filtroStatus) return false;

      if (filtroBairro && o.bairro !== filtroBairro) return false;

      if (!q) return true;

      return (

        o.protocolo?.toLowerCase().includes(q) ||

        o.subcategoria?.toLowerCase().includes(q) ||

        o.bairro?.toLowerCase().includes(q) ||

        o.descricao?.toLowerCase().includes(q)

      );

    });

  }, [ocorrencias, busca, filtroStatus, filtroBairro]);



  const kpis = useMemo(() => {

    const porStatus = contarPorStatus(ocorrencias);

    const pendentes = (porStatus.RECEBIDO || 0) + (porStatus.EM_ANALISE || 0);

    const semOrgao = contarSemOrgaoNaFila(ocorrencias);

    const alta = ocorrencias.filter((o) => o.urgencia === 'ALTA').length;

    return {

      total: ocorrencias.length,

      pendentes,

      semOrgao,

      alta,

      concluidos: porStatus.CONCLUIDO || 0,

    };

  }, [ocorrencias]);



  const dadosBairro = useMemo(() => agregarPorBairro(ocorrencias).slice(0, 8), [ocorrencias]);

  const dadosCategoria = useMemo(() => agregarPorCategoria(ocorrencias), [ocorrencias]);



  const mapaPontos = useMemo(

    () =>

      filaKanbanAtiva(ocorrencias).map((o) => ({

        id: o.id,

        lat: o.latitude,

        lng: o.longitude,

        bairro: o.bairro,

        protocolo: o.protocolo,

        subcategoria: o.subcategoria,

        urgencia: o.urgencia,

        status: o.status,

      })),

    [ocorrencias]

  );



  const selectedResumo = ocorrencias.find((o) => o.id === selectedId);



  const orgaoSugeridoLabel = triagem?.orgaoNome

    ? triagem.orgaoSigla

      ? `${triagem.orgaoNome} (${triagem.orgaoSigla})`

      : triagem.orgaoNome

    : 'Triagem manual necessária';



  const precisaAplicar =

    triagem &&

    detalhe &&

    (!triagem.alinhadoComOrgaoAtual || triagem.statusSugerido !== detalhe.status);



  const podeConfirmar =

    triagem?.orgaoId &&

    detalhe?.status !== 'CANCELADO' &&

    !triagem?.requerRevisaoHumana &&

    precisaAplicar &&

    !loadingTriagem &&

    !aplicandoTriagem;



  const verdictClass = triagem

    ? !detalhe?.orgaoId

      ? 'pending'

      : triagem.alinhadoComOrgaoAtual

        ? 'ok'

        : 'warn'

    : '';



  const detalheProps = {

    detalhe,

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

    onConfirmar: confirmarEncaminhamento,

  };



  return (

    <div className={`central-ia${aba === 'kanban' ? ' central-ia--kanban' : ''}`} data-theme="light">

      <header className="cia-header">

        <div className="cia-header-main">

          <p className="cia-header-eyebrow">zUrbi · Porto Seguro, BA</p>

          <h1>Central de Operações</h1>

          <p className="cia-header-desc">

            Monitoramento, priorização e encaminhamento de ocorrências urbanas

          </p>

        </div>

        <div className="cia-header-meta">

          <button type="button" className="cia-btn-ghost" onClick={carregar} disabled={loading}>

            Atualizar dados

          </button>

        </div>

      </header>



      <nav className="cia-tabs" role="tablist" aria-label="Seções da central">

        {ABAS.map((item) => (

          <button

            key={item.id}

            type="button"

            role="tab"

            aria-selected={aba === item.id}

            className={`cia-tab ${aba === item.id ? 'active' : ''}`}

            onClick={() => {
              setAba(item.id);
              if (item.id === 'kanban') setSelectedId(null);
            }}

          >

            {item.label}

            {item.id === 'kanban' && !loading && kpis.semOrgao > 0 && (

              <span className="cia-tab-badge">{kpis.semOrgao}</span>

            )}

          </button>

        ))}

      </nav>



      {error && (

        <div className="cia-alert" role="alert">

          {error}

        </div>

      )}



      {aba === 'geral' && (

        <>

          <section className="cia-kpis">

            <article className="cia-kpi">

              <span className="cia-kpi-label">Chamados monitorados</span>

              <strong className="cia-kpi-value">{loading ? '—' : kpis.total}</strong>

              <span className="cia-kpi-hint">Todas as ocorrências cadastradas</span>

            </article>

            <article className="cia-kpi cia-kpi-accent">

              <span className="cia-kpi-label">Fila de triagem</span>

              <strong className="cia-kpi-value">{loading ? '—' : kpis.pendentes}</strong>

              <span className="cia-kpi-hint">Recebidos + em análise</span>

            </article>

            <article className="cia-kpi cia-kpi-warn">

              <span className="cia-kpi-label">Sem órgão</span>

              <strong className="cia-kpi-value">{loading ? '—' : kpis.semOrgao}</strong>

              <span className="cia-kpi-hint">Na fila operacional (mesmo critério do Kanban)</span>

            </article>

            <article className="cia-kpi">

              <span className="cia-kpi-label">Urgência alta</span>

              <strong className="cia-kpi-value">{loading ? '—' : kpis.alta}</strong>

              <span className="cia-kpi-hint">Prioridade imediata</span>

            </article>

            <article className="cia-kpi cia-kpi-success">

              <span className="cia-kpi-label">Resolvidos</span>

              <strong className="cia-kpi-value">{loading ? '—' : kpis.concluidos}</strong>

              <span className="cia-kpi-hint">Status concluído</span>

            </article>

          </section>



          <div className="cia-grid">

            <aside className="cia-panel cia-fila">

              <div className="cia-panel-head">

                <h2>Fila de chamados</h2>

                <span className="cia-count">{filaFiltrada.length}</span>

              </div>

              <div className="cia-filters">

                <input

                  type="search"

                  placeholder="Buscar protocolo, bairro..."

                  value={busca}

                  onChange={(e) => setBusca(e.target.value)}

                  className="cia-input"

                />

                <select

                  className="cia-select"

                  value={filtroStatus}

                  onChange={(e) => setFiltroStatus(e.target.value)}

                >

                  <option value="">Todos os status</option>

                  <option value="RECEBIDO">Recebido</option>

                  <option value="EM_ANALISE">Em análise</option>

                  <option value="EM_ANDAMENTO">Em andamento</option>

                  <option value="CONCLUIDO">Concluído</option>

                  <option value="ENCAMINHADO_EMERGENCIA">Emergência</option>

                  <option value="CANCELADO">Cancelado</option>

                </select>

                <select

                  className="cia-select"

                  value={filtroBairro}

                  onChange={(e) => setFiltroBairro(e.target.value)}

                >

                  <option value="">Todos os bairros</option>

                  {bairros.map((b) => (

                    <option key={b} value={b}>

                      {b}

                    </option>

                  ))}

                </select>

              </div>

              <ul className="cia-queue-list">

                {loading ? (

                  <li className="cia-queue-empty">Carregando chamados...</li>

                ) : filaFiltrada.length === 0 ? (

                  <li className="cia-queue-empty">Nenhum chamado encontrado.</li>

                ) : (

                  filaFiltrada.map((o) => (

                    <li key={o.id}>

                      <button

                        type="button"

                        className={`cia-queue-item ${selectedId === o.id ? 'active' : ''}`}

                        onClick={() => setSelectedId(o.id)}

                      >

                        <div className="cia-queue-top">

                          <span className="cia-protocol">{o.protocolo}</span>

                          <span className={`cia-urgencia urg-${o.urgencia?.toLowerCase()}`}>

                            {labelUrgencia(o.urgencia)}

                          </span>

                        </div>

                        <p className="cia-queue-title">{o.subcategoria}</p>

                        <p className="cia-queue-meta">

                          {o.bairro} · {labelCategoria(o.categoria)}

                        </p>

                        <div className="cia-queue-footer">

                          <span className={`cia-status-pill ${STATUS_CLASS[o.status] || ''}`}>

                            {labelStatus(o.status)}

                          </span>

                          {!o.orgaoId && o.status !== 'CANCELADO' && (

                            <span className="cia-tag-ia">Aguardando órgão</span>

                          )}

                        </div>

                      </button>

                    </li>

                  ))

                )}

              </ul>

            </aside>



            <main className="cia-main">

              <div className="cia-panel cia-map-panel">

                <div className="cia-panel-head">

                  <h2>Mapa operacional</h2>

                  <span className="cia-panel-sub">
                    Porto Seguro · {mapaPontos.length} em aberto
                  </span>

                </div>

                <div className="cia-map-wrap">
                  <CentralIAMapa
                    pontos={mapaPontos}
                    selectedId={selectedId}
                    onSelectPonto={setSelectedId}
                  />
                </div>

              </div>



              <div className="cia-charts-row">

                <div className="cia-panel cia-chart-card">

                  <h3>Hotspots por bairro</h3>

                  <ResponsiveContainer width="100%" height={150}>

                    <BarChart data={dadosBairro} layout="vertical" margin={{ left: 8, right: 16 }}>

                      <CartesianGrid

                        strokeDasharray="3 3"

                        stroke="rgba(15, 23, 42, 0.08)"

                        horizontal={false}

                      />

                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />

                      <YAxis

                        type="category"

                        dataKey="bairro"

                        width={100}

                        tick={{ fill: '#475569', fontSize: 10 }}

                      />

                      <Tooltip

                        contentStyle={{

                          background: '#ffffff',

                          border: '1px solid #e2e8f0',

                          borderRadius: 8,

                          boxShadow: '0 4px 12px rgba(15,23,42,0.08)',

                        }}

                      />

                      <Bar dataKey="total" radius={[0, 6, 6, 0]}>

                        {dadosBairro.map((_, i) => (

                          <Cell key={i} fill={chartColorByIndex(i)} />

                        ))}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                </div>

                <div className="cia-panel cia-chart-card">

                  <h3>Mix por categoria</h3>

                  <ResponsiveContainer width="100%" height={150}>

                    <BarChart data={dadosCategoria}>

                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />

                      <XAxis dataKey="categoria" tick={{ fill: '#64748b', fontSize: 10 }} />

                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />

                      <Tooltip

                        contentStyle={{

                          background: '#ffffff',

                          border: '1px solid #e2e8f0',

                          borderRadius: 8,

                          boxShadow: '0 4px 12px rgba(15,23,42,0.08)',

                        }}

                      />

                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>

                        {dadosCategoria.map((_, i) => (

                          <Cell key={i} fill={chartColorByIndex(i)} />

                        ))}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </main>



            <aside className="cia-panel cia-detail">

              <div className="cia-panel-head">

                <h2>Detalhe do chamado</h2>

              </div>

              <CentralIADetalhe {...detalheProps} selectedResumo={selectedResumo} />

            </aside>

          </div>

        </>

      )}



      {aba === 'kanban' && (

        <CentralIAKanban

          ocorrencias={ocorrencias}

          orgaos={orgaos}

          loading={loading}

          selectedId={selectedId}

          onSelect={setSelectedId}

          onCloseDetalhe={() => setSelectedId(null)}

          onOcorrenciaAtualizada={atualizarItemNaLista}

          detalheProps={detalheProps}

        />

      )}

      <CentralIAAssistente />

    </div>

  );

}


