import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOcorrencias } from '../services/ocorrencias';
import RecentReportsCarousel from '../components/RecentReportsCarousel';
import { calcularEstatisticasPublicas } from '../utils/centralIa';
import './Home.css';

const FEATURE_STEPS = [
  {
    step: '01',
    accent: 'var(--zurbi-blue)',
    title: 'Marque no mapa',
    text: 'Indique o ponto exato do problema em Porto Seguro com o mapa interativo.',
    icon: 'map',
  },
  {
    step: '02',
    accent: 'var(--zurbi-green)',
    title: 'Descreva e envie fotos',
    text: 'Conte o que aconteceu; a triagem ajuda a classificar categoria e urgência.',
    icon: 'edit',
  },
  {
    step: '03',
    accent: 'var(--zurbi-yellow)',
    title: 'Encaminhamento automático',
    text: 'O chamado segue para o órgão da Prefeitura responsável pela área.',
    icon: 'route',
  },
  {
    step: '04',
    accent: 'var(--zurbi-blue-dark)',
    title: 'Acompanhe o protocolo',
    text: 'Consulte o andamento do seu relato com transparência até a conclusão.',
    icon: 'track',
  },
];

function FeatureIcon({ type }) {
  const stroke = 'currentColor';
  const common = { fill: 'none', stroke, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'map':
      return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
          <path {...common} d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
          <circle {...common} cx="12" cy="10" r="2.25" />
        </svg>
      );
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
          <path {...common} d="M4 20h4l10-10-4-4L4 16v4z" />
          <path {...common} d="M14 6l4 4" />
        </svg>
      );
    case 'route':
      return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
          <circle {...common} cx="5" cy="12" r="2.25" />
          <circle {...common} cx="19" cy="6" r="2.25" />
          <circle {...common} cx="19" cy="18" r="2.25" />
          <path {...common} d="M7.2 12h7.6M14.2 8.2l3.5-1.2M14.2 15.8l3.5 1.2" />
        </svg>
      );
    case 'track':
      return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
          <path {...common} d="M4 19V5" />
          <path {...common} d="M4 19h16" />
          <path {...common} d="M8 15v-4M12 15V9M16 15v-6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarOcorrencias()
      .then((lista) => setOcorrencias(Array.isArray(lista) ? lista : []))
      .catch(() => setErro('Não foi possível carregar as estatísticas.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => calcularEstatisticasPublicas(ocorrencias), [ocorrencias]);

  const recentes = useMemo(
    () =>
      [...ocorrencias]
        .filter((o) => o.status !== 'CANCELADO')
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .slice(0, 12),
    [ocorrencias]
  );

  const exibirNumero = (valor) => (loading ? '…' : valor);

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-branding">
              <img src="/zUrbi-logo.png" alt="zUrbi Logo" className="hero-logo" />
            </div>
            <p className="hero-subtitle">
              O canal da Prefeitura de Porto Seguro para você ajudar a cuidar da nossa cidade.
              Conte o que precisa de atenção no seu bairro — buracos, luz, água, trânsito ou limpeza.
            </p>
            <Link to="/registrar" className="btn btn-primary btn-lg">
              Abrir chamado
            </Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <h2>Estatísticas da Plataforma</h2>
          {erro && (
            <p className="home-stats-erro" role="alert">
              {erro}
            </p>
          )}
          <div className="stats-grid">
            <div className="stat-card stat-card--blue">
              <div className="stat-number">{exibirNumero(stats.total)}</div>
              <div className="stat-label">Total de Relatos</div>
            </div>
            <div className="stat-card stat-card--yellow">
              <div className="stat-number">{exibirNumero(stats.emAnalise)}</div>
              <div className="stat-label">Em Análise</div>
            </div>
            <div className="stat-card stat-card--blue">
              <div className="stat-number">{exibirNumero(stats.emAndamento)}</div>
              <div className="stat-label">Em Andamento</div>
            </div>
            <div className="stat-card stat-card--green">
              <div className="stat-number">{exibirNumero(stats.resolvidos)}</div>
              <div className="stat-label">Resolvidos</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" aria-labelledby="features-heading">
        <div className="container">
          <header className="features-header">
            <img
              src="/zUrbi-logo.png"
              alt=""
              className="features-brand-mark"
              aria-hidden="true"
            />
            <p className="features-eyebrow">zUrbi · Porto Seguro</p>
            <h2 id="features-heading">Como funciona</h2>
            <p className="features-lead">
              Quatro passos simples para registrar, encaminhar e acompanhar demandas urbanas
              com a Prefeitura.
            </p>
          </header>

          <ol className="features-grid">
            {FEATURE_STEPS.map((item) => (
              <li
                key={item.step}
                className="feature-card"
                style={{ '--feature-accent': item.accent }}
              >
                <div className="feature-card-top">
                  <span className="feature-step">{item.step}</span>
                  <div className="feature-icon-wrap">
                    <FeatureIcon type={item.icon} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="recent-reports" aria-labelledby="recent-reports-heading">
        <div className="container">
          <header className="recent-reports-header">
            <p className="recent-reports-eyebrow">Transparência</p>
            <h2 id="recent-reports-heading">Últimos relatos na cidade</h2>
            <p className="recent-reports-lead">
              Chamados recentes registrados pelos cidadãos em Porto Seguro.
            </p>
          </header>
          <RecentReportsCarousel items={recentes} loading={loading} />
        </div>
      </section>
    </div>
  );
}
