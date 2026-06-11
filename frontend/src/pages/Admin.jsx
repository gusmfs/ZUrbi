import { useState } from 'react';
import { useProblemStore } from '../store';
import {
  PageHeader,
  Card,
  Badge,
  Select,
  Button,
} from '../components/ui';
import './Admin.css';

const STATUS_OPTIONS = ['reported', 'in_progress', 'resolved'];
const STATUS_LABELS = {
  resolved: 'Resolvido',
  in_progress: 'Em Andamento',
  reported: 'Reportado',
};
const STATUS_VARIANTS = {
  resolved: 'success',
  in_progress: 'primary',
  reported: 'warning',
};

export default function Admin() {
  const { problems, updateProblem } = useProblemStore();
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleStatusChange = (problemId, newStatus) => {
    updateProblem(problemId, { status: newStatus });
  };

  return (
    <div className="admin">
      <div className="container">
        <PageHeader
          title="Painel de Administração"
          description="Gerencie os problemas reportados na plataforma zUrbi e atualize o status dos trabalhos."
        />

        <div className="admin-layout">
          <Card variant="flat" className="admin-list">
            <h2 className="admin-panel-title">Problemas</h2>
            {problems.length > 0 ? (
              <div className="problem-list" role="list">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    type="button"
                    role="listitem"
                    className={`problem-item ${selectedProblem?.id === problem.id ? 'active' : ''}`}
                    onClick={() => setSelectedProblem(problem)}
                    aria-pressed={selectedProblem?.id === problem.id}
                  >
                    <div className="problem-item-header">
                      <h4>{problem.title}</h4>
                      <Badge variant={STATUS_VARIANTS[problem.status] || 'warning'}>
                        {STATUS_LABELS[problem.status] || 'Reportado'}
                      </Badge>
                    </div>
                    <p>{problem.description.substring(0, 50)}...</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>Nenhum problema ainda.</p>
              </div>
            )}
          </Card>

          <Card variant="flat" className="admin-detail">
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
                    <p>
                      {selectedProblem.severity === 'high'
                        ? 'Alta'
                        : selectedProblem.severity === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </p>
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

                <Select
                  id="status"
                  label="Status"
                  required
                  value={selectedProblem.status}
                  onChange={(e) =>
                    handleStatusChange(selectedProblem.id, e.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>

                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Salvar alterações do problema selecionado"
                >
                  Salvar Alterações
                </Button>
              </div>
            ) : (
              <div className="empty-state">
                <p>Selecione um problema para ver os detalhes</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
