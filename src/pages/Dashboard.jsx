import { useProblemStore } from '../store';
import './Dashboard.css';

export default function Dashboard() {
  const { problems } = useProblemStore();

  const statusCounts = {
    reported: problems.filter((p) => p.status === 'reported').length,
    inProgress: problems.filter((p) => p.status === 'in_progress').length,
    resolved: problems.filter((p) => p.status === 'resolved').length,
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="page-header">
          <h1>Acompanhamento de Problemas</h1>
          <p className="page-description">
            Veja o status de todos os problemas reportados na plataforma zUrbi.
          </p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-box">
            <div className="stat-value">{problems.length}</div>
            <div className="stat-name">Total de Relatos</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {statusCounts.reported}
            </div>
            <div className="stat-name">Em Análise</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {statusCounts.inProgress}
            </div>
            <div className="stat-name">Em Andamento</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {statusCounts.resolved}
            </div>
            <div className="stat-name">Resolvidos</div>
          </div>
        </div>

        <div className="problems-table-container">
          <h2>Todos os Problemas</h2>
          {problems.length > 0 ? (
            <table className="problems-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Severidade</th>
                  <th>Status</th>
                  <th>data</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td className="title-cell">{problem.title}</td>
                    <td>{problem.type}</td>
                    <td>
                      <span className={`badge badge-${problem.severity === 'high' ? 'error' : problem.severity === 'medium' ? 'warning' : 'primary'}`}>
                        {problem.severity === 'high' ? 'Alta' : problem.severity === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          problem.status === 'resolved'
                            ? 'success'
                            : problem.status === 'in_progress'
                            ? 'primary'
                            : 'warning'
                        }`}
                      >
                        {problem.status === 'resolved'
                          ? 'Resolvido'
                          : problem.status === 'in_progress'
                          ? 'Em Andamento'
                          : 'Reportado'}
                      </span>
                    </td>
                    <td>{new Date(problem.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-message">
              <p>Nenhum problema reportado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
