import { useEffect, useState } from 'react';
import { getOcorrencias } from '../services/api';

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

        const dados = response.data;
        setOcorrencias(dados);
        setStatus('success');
      } catch (err) {
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

  if (status === 'loading') {
    return <p>Carregando ocorrências...</p>;
  }

  if (status === 'error') {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (ocorrencias.length === 0) {
    return <p>Nenhuma ocorrência registrada</p>;
  }

  return (
    <div>
      <h2>Lista de Ocorrências</h2>
      <ul>
        {ocorrencias.map((ocorrencia) => (
          <li key={ocorrencia.id}>
            <strong>{ocorrencia.protocolo}</strong> — {ocorrencia.descricao}
            <br />
            <small>
              {ocorrencia.categoria} · {ocorrencia.bairro} · {ocorrencia.status}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaOcorrencias;
