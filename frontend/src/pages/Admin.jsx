import { useState } from 'react';
import { useProblemStore } from '../store';
import './Admin.css';

const STATUS_OPTIONS = ['reported', 'in_progress', 'resolved'];

export default function Admin() {
  const { problems, updateProblem } = useProblemStore();
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleStatusChange = (problemId, newStatus) => {
    updateProblem(problemId, { status: newStatus });
  };

  return (
    <div className="admin">
      <div className="container">
        <div className="page-header">
          <h1>Painel de Administração</h1>
          <p className="page-description">
            Gerencie os problemas reportados na plataforma zUrbi e atualize o status dos trabalhos.
          </p>
        </div>

        <div className="admin-layout">
          <div className="admin-list">
            <h2>Problemas</h2>
            {problems.length > 0 ? (
              <div className="problem-list">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`problem-item ${selectedProblem?.id === problem.id ? 'active' : ''}`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <div className="problem-item-header">
                      <h4>{problem.title}</h4>
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
                    </div>
                    <p>{problem.description.substring(0, 50)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>Nenhum problema ainda.</p>
              </div>
            )}
          </div>

          <div className="admin-detail">
            {selectedProblem ? (
              <div className="detail-card">
                <h2>{selectedProblem.title}</h2>
                <div className="detail-field">
                  <label>Descrição</label>
                  <p>{selectedProblem.description}</p>
                </div>

                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Tipo</label>
                    <p>{selectedProblem.type}</p>
                  </div>
                  <div className="detail-field">
                    <label>Severidade</label>
                    <p>{selectedProblem.severity === 'high' ? 'Alta' : selectedProblem.severity === 'medium' ? 'Média' : 'Baixa'}</p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Latitude</label>
                    <p>{selectedProblem.location.lat.toFixed(5)}</p>
                  </div>
                  <div className="detail-field">
                    <label>Longitude</label>
                    <p>{selectedProblem.location.lng.toFixed(5)}</p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Data de Criação</label>
                    <p>{new Date(selectedProblem.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="detail-field">
                    <label>Visualizações</label>
                    <p>{selectedProblem.views || 0}</p>
                  </div>
                </div>

                <div className="detail-field">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    value={selectedProblem.status}
                    onChange={(e) => handleStatusChange(selectedProblem.id, e.target.value)}
                    className="detail-select"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status === 'resolved'
                          ? 'Resolvido'
                          : status === 'in_progress'
                          ? 'Em Andamento'
                          : 'Reportado'}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-secondary">
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <p>Selecione um problema para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
