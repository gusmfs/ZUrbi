import { useEffect, useState } from 'react';
import { getOcorrencias } from '../services/api';
import { PageHeader, Card, Badge, Alert } from './ui';
import './ListaOcorrencias.css';

function ListaOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const carregarOcorrencias = async () => {
      setStatus('loading');
      setError(null);

      try {
        const response = await getOcorrencias();
        if (cancelled) return;

        setOcorrencias(response.data);
        setStatus('success');
      } catch {
        if (cancelled) return;
        setStatus('error');
        setError('Não foi possível carregar as ocorrências. Tente novamente.');
      }
    };

    carregarOcorrencias();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="lista-ocorrencias">
      <div className="container container-sm">
        <PageHeader title="Minhas Ocorrências" />

        {status === 'loading' && (
          <p className="loading-state" aria-live="polite">
            Carregando ocorrências...
          </p>
        )}

        {status === 'error' && (
          <Alert variant="error" role="alert">
            {error}
          </Alert>
        )}

        {status === 'success' && ocorrencias.length === 0 && (
          <Card variant="flat" className="lista-ocorrencias__empty">
            <p>Nenhuma ocorrência registrada</p>
          </Card>
        )}

        {status === 'success' && ocorrencias.length > 0 && (
          <ul className="lista-ocorrencias__list">
            {ocorrencias.map((ocorrencia) => (
              <li key={ocorrencia.id}>
                <Card variant="flat" className="lista-ocorrencias__item">
                  <div className="lista-ocorrencias__header">
                    <strong>{ocorrencia.protocolo}</strong>
                    <Badge variant="primary">{ocorrencia.status}</Badge>
                  </div>
                  <p className="lista-ocorrencias__descricao">{ocorrencia.descricao}</p>
                  <small className="lista-ocorrencias__meta">
                    {ocorrencia.categoria} · {ocorrencia.bairro}
                  </small>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ListaOcorrencias;
