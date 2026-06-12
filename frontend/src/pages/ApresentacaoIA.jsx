import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOcorrencias } from '../services/ocorrencias';
import {
  agregarPorCategoria,
  calcularEstatisticasPublicas,
} from '../utils/centralIa';
import { contarSemOrgaoNaFila } from '../utils/kanbanTriagem';
import './ApresentacaoIA.css';

const FLUXOS = [
  {
    id: 'cidadao',
    accent: 'var(--zurbi-blue)',
    titulo: 'Abertura de chamado',
    rota: '/registrar',
    passos: [
      'Cidadão descreve o problema no mapa de Porto Seguro',
      'Ao avançar, o motor classifica categoria, tipo e urgência',
      'Card de triagem com confiança, órgão previsto e motivos',
      'Envio com protocolo — revisão humana opcional nos campos',
    ],
  },
  {
    id: 'gestor',
    accent: 'var(--zurbi-green)',
    titulo: 'Central de Operações',
    rota: '/central-ia',
    passos: [
      'Fila, Kanban por órgão, mapa e KPIs alinhados à fila operacional',
      'Assistente (Ollama): perguntas sobre a fila, contagens e tabelas por secretaria',
      'Por chamado: sugestão de triagem com confiança, motivos e status',
      'Confirmar encaminhamento grava órgão e histórico — decisão humana oficial',
    ],
  },
];

const CAMADAS_IA = [
  {
    id: 'regras',
    status: 'Em uso',
    statusVariant: 'live',
    titulo: 'Motor de triagem',
    descricao:
      'Motor de triagem por regras e vocabulário no backend. Explicável, auditável e sem custo de API externa.',
    itens: ['Classificação na abertura', 'Triagem na Central', 'Confirmação no banco'],
  },
  {
    id: 'assistente',
    status: 'Piloto',
    statusVariant: 'pilot',
    titulo: 'Assistente conversacional',
    descricao:
      'Assistente com modelo de linguagem (Ollama) na Central. Lê contexto da fila e complementa o motor de regras.',
    itens: ['Chat na Central', 'Contexto ao vivo', 'Listas por órgão'],
  },
];

const ENTREGAS_RECENTES = [
  {
    titulo: 'Triagem explicável',
    detalhe: 'Categoria, tipo, órgão, urgência e motivos — integração com o backend de triagem.',
  },
  {
    titulo: 'Central de Operações',
    detalhe: 'Fila, detalhe com triagem, Kanban arrastável, mapa por urgência e indicadores.',
  },
  {
    titulo: 'Assistente Ollama',
    detalhe:
      'Perguntas em linguagem natural sobre a fila; tabelas montadas no servidor quando o órgão está claro.',
  },
  {
    titulo: 'Vocabulário ampliado',
    detalhe: 'Ex.: “placa caída no chão” → Trânsito / placa ou sinal caído, encaminhamento à SOI.',
  },
];

const SUGESTOES_MOTOR = [
  { label: 'Categoria e tipo', cor: 'var(--zurbi-blue)' },
  { label: 'Órgão responsável', cor: 'var(--zurbi-green)' },
  { label: 'Urgência e prioridade', cor: 'var(--zurbi-yellow)' },
  { label: 'Confiança e motivos', cor: 'var(--zurbi-blue-dark)' },
];

const INCLUI = [
  'Motor de triagem por regras (~150 termos)',
  'Classificação na abertura do chamado e triagem na Central',
  'Kanban por órgão; indicadores alinhados à fila operacional',
  'Assistente na Central (Ollama, contexto da fila em tempo real)',
  'APIs REST de triagem e classificação',
  'Emergências direcionadas à Defesa Civil (DCM)',
];

const NAO_INCLUI = [
  'Decisões automáticas sem confirmação humana na Central',
  'Modelo treinado com histórico real da prefeitura',
  'Interpretação de fotos anexadas',
  'Painel de acurácia e métricas do motor',
  'Assistente como fonte única da verdade (pode errar; regras e banco prevalecem)',
];

const EXEMPLO_TRIAGEM = {
  entrada: 'placa caída no chão',
  categoria: 'Trânsito',
  tipo: 'Placa ou sinal caído',
  orgao: 'SOI — Secretaria de Obras',
  confianca: 92,
  motivos: [
    'Categoria Trânsito identificada pelo texto.',
    'Tipo sugerido: Placa ou sinal caído.',
    'Encaminhamento previsto: Secretaria de Obras e Infraestrutura (SOI).',
  ],
};

const PROXIMOS = [
  'Amadurecer o assistente (mais perguntas, respostas mais estáveis)',
  'Triagem automática ao registrar, quando a confiança for alta',
  'Fila ordenada por prioridade inteligente',
  'Reincidência e atuação preditiva em pontos críticos',
  'Métricas de acurácia do motor e do uso do assistente',
];

function exibirNumero(n, isLoading) {
  return isLoading ? '—' : String(n ?? 0);
}

export default function ApresentacaoIA() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarOcorrencias()
      .then((lista) => setOcorrencias(Array.isArray(lista) ? lista : []))
      .catch(() => setOcorrencias([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => calcularEstatisticasPublicas(ocorrencias), [ocorrencias]);

  const semOrgao = useMemo(
    () => contarSemOrgaoNaFila(ocorrencias),
    [ocorrencias]
  );

  const topCategorias = useMemo(
    () => agregarPorCategoria(ocorrencias).slice(0, 4),
    [ocorrencias]
  );

  return (
    <div className="apresentacao-ia">
      <section className="ia-hero" aria-labelledby="ia-hero-title">
        <div className="ia-hero-glow" aria-hidden />
        <div className="container ia-hero-inner">
          <div className="ia-hero-brand">
            <img
              src="/zUrbi-logo.png"
              alt=""
              className="ia-hero-logo"
              aria-hidden="true"
            />
          </div>
          <p className="ia-hero-badge">Porto Seguro · maio/2026</p>
          <h1 id="ia-hero-title">Inteligência no zUrbi</h1>
          <p className="ia-hero-lead">
            O zUrbi combina um motor de triagem por regras — explicável e auditável — com um
            assistente conversacional na Central de Operações para apoiar gestores e cidadãos.
          </p>
          <div className="ia-hero-actions">
            <Link to="/registrar" className="ia-btn ia-btn-primary">
              Ver no fluxo do cidadão
            </Link>
            <Link to="/central-ia" className="ia-btn ia-btn-ghost">
              Central de Operações
            </Link>
          </div>
        </div>
      </section>

      <section className="ia-status" aria-labelledby="ia-status-title">
        <div className="container">
          <div className="ia-status-card">
            <h2 id="ia-status-title">Onde estamos</h2>
            <p>
              A inteligência do zUrbi se apoia em código explícito: vocabulário, regras e APIs.
              O assistente com Ollama permite ao gestor consultar a fila em linguagem natural,
              complementando a triagem oficial — sempre com confirmação humana.
            </p>
            <ul className="ia-status-list">
              <li>
                <span className="ia-status-tag ia-status-tag--live">Produção</span>
                Motor de triagem (abertura + Central + banco)
              </li>
              <li>
                <span className="ia-status-tag ia-status-tag--pilot">Piloto</span>
                Assistente na Central (
                <code className="ia-code">/api/assistente</code>
                )
              </li>
              <li>
                <span className="ia-status-tag ia-status-tag--plan">Planejado</span>
                Predição, reincidência e métricas de acurácia
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="ia-metrics" aria-label="Dados da plataforma">
        <div className="container">
          <p className="ia-section-eyebrow">Base ao vivo</p>
          <h2 className="ia-section-title ia-section-title--center">
            O que temos na plataforma agora
          </h2>
          <div className="ia-metrics-grid">
            <article className="ia-metric ia-metric--blue">
              <span className="ia-metric-value">{exibirNumero(stats.total, loading)}</span>
              <span className="ia-metric-label">Chamados ativos</span>
            </article>
            <article className="ia-metric ia-metric--yellow">
              <span className="ia-metric-value">{exibirNumero(stats.emAnalise, loading)}</span>
              <span className="ia-metric-label">Em análise</span>
            </article>
            <article className="ia-metric ia-metric--blue">
              <span className="ia-metric-value">{exibirNumero(stats.emAndamento, loading)}</span>
              <span className="ia-metric-label">Em andamento</span>
            </article>
            <article className="ia-metric ia-metric--green">
              <span className="ia-metric-value">{exibirNumero(stats.resolvidos, loading)}</span>
              <span className="ia-metric-label">Resolvidos</span>
            </article>
          </div>
          <div className="ia-metrics-meta">
            <div className="ia-meta-chip">
              <strong>{exibirNumero(semOrgao, loading)}</strong>
              <span>sem órgão na fila operacional (Kanban)</span>
            </div>
            <div className="ia-meta-chip">
              <strong>~150</strong>
              <span>termos no vocabulário do motor</span>
            </div>
            <div className="ia-meta-chip">
              <strong>5</strong>
              <span>órgãos municipais no encaminhamento</span>
            </div>
          </div>
          {topCategorias.length > 0 && !loading && (
            <div className="ia-categorias">
              <span className="ia-categorias-label">Distribuição por área</span>
              <ul className="ia-categorias-list">
                {topCategorias.map((item) => (
                  <li key={item.categoria}>
                    <span>{item.categoria}</span>
                    <em>{item.total}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="ia-camadas" aria-labelledby="ia-camadas-title">
        <div className="container">
          <p className="ia-section-eyebrow">Duas frentes</p>
          <h2 id="ia-camadas-title" className="ia-section-title ia-section-title--center">
            O que já está implementado
          </h2>
          <div className="ia-camadas-grid">
            {CAMADAS_IA.map((camada) => (
              <article
                key={camada.id}
                className={`ia-camada-card ia-camada-card--${camada.statusVariant}`}
              >
                <span className={`ia-status-tag ia-status-tag--${camada.statusVariant}`}>
                  {camada.status}
                </span>
                <h3>{camada.titulo}</h3>
                <p>{camada.descricao}</p>
                <ul>
                  {camada.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ia-entregas" aria-labelledby="ia-entregas-title">
        <div className="container">
          <p className="ia-section-eyebrow">Entregas recentes</p>
          <h2 id="ia-entregas-title" className="ia-section-title">
            Evolução da Central e do motor
          </h2>
          <div className="ia-entregas-grid">
            {ENTREGAS_RECENTES.map((item) => (
              <article key={item.titulo} className="ia-entrega-card">
                <h3>{item.titulo}</h3>
                <p>{item.detalhe}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ia-conceito" aria-labelledby="ia-conceito-title">
        <div className="container ia-conceito-grid">
          <div className="ia-conceito-text">
            <p className="ia-section-eyebrow">Definição</p>
            <h2 id="ia-conceito-title">O que chamamos de IA hoje</h2>
            <p>
              O <strong>motor de triagem</strong> é a IA principal: lê o relato, aplica vocabulário
              e regras no backend e devolve sugestões auditáveis. O <strong>assistente Ollama</strong>{' '}
              é camada opcional na Central — consulta estatísticas e listas montadas a partir do
              banco; o gestor continua confirmando encaminhamentos pela triagem oficial.
            </p>
          </div>
          <ul className="ia-sugestoes-list">
            {SUGESTOES_MOTOR.map((item) => (
              <li key={item.label} style={{ '--ia-accent': item.cor }}>
                <span className="ia-sugestoes-dot" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ia-fluxos" aria-labelledby="ia-fluxos-title">
        <div className="container">
          <p className="ia-section-eyebrow">Dois momentos</p>
          <h2 id="ia-fluxos-title" className="ia-section-title">
            Onde a triagem aparece
          </h2>
          <div className="ia-fluxos-grid">
            {FLUXOS.map((fluxo) => (
              <article
                key={fluxo.id}
                className="ia-fluxo-card"
                style={{ '--ia-fluxo-accent': fluxo.accent }}
              >
                <h3>{fluxo.titulo}</h3>
                <ol>
                  {fluxo.passos.map((passo) => (
                    <li key={passo}>{passo}</li>
                  ))}
                </ol>
                <Link to={fluxo.rota} className="ia-fluxo-link">
                  Acessar →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ia-exemplo" aria-labelledby="ia-exemplo-title">
        <div className="container ia-exemplo-grid">
          <div>
            <p className="ia-section-eyebrow">Exemplo real</p>
            <h2 id="ia-exemplo-title">Classificação em ação</h2>
            <p className="ia-exemplo-desc">
              Entrada do cidadão processada pelo endpoint{' '}
              <code className="ia-code">POST /api/triagem/classificar</code>
              — sem gravar chamado, apenas sugerir.
            </p>
          </div>
          <div className="ia-exemplo-card">
            <div className="ia-exemplo-input">
              <span className="ia-exemplo-tag">Descrição</span>
              <p>&ldquo;{EXEMPLO_TRIAGEM.entrada}&rdquo;</p>
            </div>
            <div className="ia-exemplo-result">
              <div className="ia-exemplo-row">
                <span>Categoria</span>
                <strong>{EXEMPLO_TRIAGEM.categoria}</strong>
              </div>
              <div className="ia-exemplo-row">
                <span>Tipo</span>
                <strong>{EXEMPLO_TRIAGEM.tipo}</strong>
              </div>
              <div className="ia-exemplo-row">
                <span>Órgão</span>
                <strong>{EXEMPLO_TRIAGEM.orgao}</strong>
              </div>
              <div className="ia-exemplo-confianca">
                <span>Confiança</span>
                <strong>{EXEMPLO_TRIAGEM.confianca}%</strong>
              </div>
              <ul className="ia-exemplo-motivos">
                {EXEMPLO_TRIAGEM.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ia-escopo" aria-labelledby="ia-escopo-title">
        <div className="container">
          <p className="ia-section-eyebrow">Escopo</p>
          <h2 id="ia-escopo-title" className="ia-section-title ia-section-title--center">
            Recursos disponíveis e limitações atuais
          </h2>
          <p className="ia-escopo-intro">
            O zUrbi entrega triagem explicável por regras e apoio conversacional na Central;
            os itens abaixo delimitam o que está operacional hoje.
          </p>
          <div className="ia-escopo-grid">
            <div className="ia-escopo-col">
              <h3>Incluído</h3>
              <ul>
                {INCLUI.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="ia-escopo-col ia-escopo-col--muted">
              <h3>Ainda não</h3>
              <ul>
                {NAO_INCLUI.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ia-roadmap" aria-labelledby="ia-roadmap-title">
        <div className="container ia-roadmap-inner">
          <div>
            <p className="ia-section-eyebrow">Evolução</p>
            <h2 id="ia-roadmap-title">Próximos passos</h2>
            <p className="ia-roadmap-note">
              A triagem explicável e o apoio ao gestor são a base da plataforma. Os itens abaixo
              representam evoluções previstas, sujeitas a validação com a prefeitura.
            </p>
          </div>
          <ul className="ia-roadmap-list">
            {PROXIMOS.map((item, i) => (
              <li key={item}>
                <span className="ia-roadmap-num">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ia-cta">
        <div className="container ia-cta-inner">
          <h2>Do relato à resolução</h2>
          <p>
            Do registro no mapa até a triagem e o assistente na Central — Porto Seguro integrado
            de ponta a ponta.
          </p>
          <div className="ia-cta-actions">
            <Link to="/registrar" className="ia-btn ia-btn-primary">
              Abrir chamado
            </Link>
            <Link to="/central-ia" className="ia-btn ia-btn-ghost ia-btn-ghost--light">
              Operações
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
