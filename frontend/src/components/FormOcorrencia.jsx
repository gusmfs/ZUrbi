import { useState } from 'react';
import { criarOcorrencia } from '../services/api';
import { PageHeader, Card, Select, Textarea, Button, Alert } from './ui';
import './FormOcorrencia.css';

const CATEGORIAS = ['Viário', 'Iluminação', 'Saneamento'];

function FormOcorrencia() {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Viário');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!descricao || !categoria) {
      setError('Por favor, preencha todos os campos.');
      setStatus('error');
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
    } catch {
      setStatus('error');
      setError('Falha ao enviar ocorrência. Tente novamente.');
    }
  };

  return (
    <section className="form-ocorrencia">
      <div className="container container-sm">
        <Card variant="flat" className="form-ocorrencia__card">
          <PageHeader title="Registrar Nova Ocorrência" />

          <form onSubmit={handleSubmit} noValidate>
            {status === 'success' && (
              <Alert variant="success">Ocorrência registrada com sucesso!</Alert>
            )}
            {status === 'error' && error && (
              <Alert variant="error">{error}</Alert>
            )}

            <Select
              id="categoria"
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Textarea
              id="descricao"
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />

            <div className="form-ocorrencia__actions">
              <Button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar Ocorrência'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default FormOcorrencia;
