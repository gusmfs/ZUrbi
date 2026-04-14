import { Link } from 'react-router-dom';
import { useProblemStore } from '../store';
import './Home.css';

export default function Home() {
  const { problems } = useProblemStore();

  const statusCounts = {
    reported: problems.filter((p) => p.status === 'reported').length,
    inProgress: problems.filter((p) => p.status === 'in_progress').length,
    resolved: problems.filter((p) => p.status === 'resolved').length,
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-branding">
              <img src="/zUrbi-logo.png" alt="zUrbi Logo" className="hero-logo" />
            </div>
            <p className="hero-subtitle">
              Transformando a cidade através de você. Reporte problemas urbanos como buracos nas ruas, faixas interceptadas e infraestrutura danificada.
            </p>
            <Link to="/mapa" className="btn btn-primary btn-lg">
              Reportar Problema
            </Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <h2>Estatísticas da Plataforma</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{problems.length}</div>
              <div className="stat-label">Total de Relatos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statusCounts.reported}</div>
              <div className="stat-label">Em Análise</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statusCounts.inProgress}</div>
              <div className="stat-label">Em Andamento</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statusCounts.resolved}</div>
              <div className="stat-label">Resolvidos</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Como Funciona</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Localize o Problema</h3>
              <p>Use o mapa interativo para marcar a localização exata do problema urbano.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Descreva o Problema</h3>
              <p>Forneça detalhes e anexe fotos para ajudar a identificação do problema.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Envie para Autoridades</h3>
              <p>Seu relato é automaticamente roteado para o órgão público competente.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Acompanhe o Progresso</h3>
              <p>Receba atualizações em tempo real sobre o status do seu relato.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-problems">
        <div className="container">
          <h2>Últimos Relatos</h2>
          {problems.length > 0 ? (
            <div className="problems-list">
              {problems.slice(-5).reverse().map((problem) => (
                <div key={problem.id} className="problem-item">
                  <div className="problem-header">
                    <h4>{problem.title}</h4>
                    <span className={`badge badge-${problem.status === 'resolved' ? 'success' : problem.status === 'in_progress' ? 'primary' : 'warning'}`}>
                      {problem.status === 'resolved' ? 'Resolvido' : problem.status === 'in_progress' ? 'Em Andamento' : 'Reportado'}
                    </span>
                  </div>
                  <p>{problem.description}</p>
                  <small className="text-muted">
                    {new Date(problem.createdAt).toLocaleDateString('pt-BR')}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhum relato ainda. Seja o primeiro a reportar um problema!</p>
              <Link to="/mapa" className="btn btn-primary">
                Reportar Agora
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
