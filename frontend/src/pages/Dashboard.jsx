import { useProblemStore } from '../store';
import {
  PageHeader,
  Card,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableContainer,
} from '../components/ui';
import './Dashboard.css';

const SEVERITY_LABELS = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const SEVERITY_VARIANTS = { high: 'error', medium: 'warning', low: 'primary' };
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
        <PageHeader
          title="Acompanhamento de Problemas"
          description="Veja o status de todos os problemas reportados na plataforma zUrbi."
        />

        <div className="dashboard-stats">
          <Card variant="stat" className="card--stat-accent-blue">
            <div className="stat-value">{problems.length}</div>
            <div className="stat-name">Total de Relatos</div>
          </Card>
          <Card variant="stat" className="card--stat-accent-yellow">
            <div className="stat-value stat-value--warning">{statusCounts.reported}</div>
            <div className="stat-name">Em Análise</div>
          </Card>
          <Card variant="stat" className="card--stat-accent-blue">
            <div className="stat-value stat-value--info">{statusCounts.inProgress}</div>
            <div className="stat-name">Em Andamento</div>
          </Card>
          <Card variant="stat" className="card--stat-accent-green">
            <div className="stat-value stat-value--success">{statusCounts.resolved}</div>
            <div className="stat-name">Resolvidos</div>
          </Card>
        </div>

        <TableContainer title="Todos os Problemas">
          {problems.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Título</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Severidade</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Data</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell emphasis>{problem.title}</TableCell>
                    <TableCell>{problem.type}</TableCell>
                    <TableCell>
                      <Badge variant={SEVERITY_VARIANTS[problem.severity] || 'primary'}>
                        {SEVERITY_LABELS[problem.severity] || 'Baixa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[problem.status] || 'warning'}>
                        {STATUS_LABELS[problem.status] || 'Reportado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(problem.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="empty-message">
              <p>Nenhum problema reportado ainda.</p>
            </div>
          )}
        </TableContainer>
      </div>
    </div>
  );
}
