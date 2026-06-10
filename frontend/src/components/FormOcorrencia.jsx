import { useState } from 'react';
import { criarOcorrencia } from '../services/api';

function FormOcorrencia() {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Viário');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!descricao || !categoria) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const novaOcorrencia = {
        descricao,
        categoria,
        bairro: 'Vila Mariana',
        status: 'Recebido',
      };
      await criarOcorrencia(novaOcorrencia);
      setStatus('success');
      setDescricao('');
      setCategoria('Viário');
    } catch (err) {
      setStatus('error');
      setError('Falha ao enviar ocorrência. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Nova Ocorrência</h2>

      {status === 'success' && (
        <p style={{ color: 'green' }}>Ocorrência registrada com sucesso!</p>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="categoria">Categoria:</label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="Viário">Viário</option>
          <option value="Iluminação">Iluminação</option>
          <option value="Saneamento">Saneamento</option>
        </select>
      </div>
      <div>
        <label htmlFor="descricao">Descrição:</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Enviando...' : 'Enviar Ocorrência'}
      </button>
    </form>
  );
}

export default FormOcorrencia;
