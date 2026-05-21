import { useEffect, useRef, useState } from 'react';
import {
  CATEGORIAS,
  SUBCATEGORIAS_POR_CATEGORIA,
  URGENCIAS,
} from '../constants/ocorrencia';
import { BAIRROS_PORTO_SEGURO } from '../constants/bairrosPortoSeguro';
import { buscarEnderecoPorCoordenadas } from '../services/geocoding';
import { classificarChamado } from '../services/triagem';
import { classificarChamadoLocal } from '../utils/triagemLocal';
import './ProblemForm.css';

const MAX_FOTOS = 5;
const MAX_DESCRICAO = 500;

const BAIRROS_OPCOES = [...BAIRROS_PORTO_SEGURO].sort((a, b) =>
  a.localeCompare(b, 'pt-BR')
);

export default function OcorrenciaForm({
  selectedLocation,
  onSubmit,
  isLoading,
  onStepChange,
  submitError,
  protocoloSucesso,
  orgaoNomeSucesso,
  onNovoChamado,
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    categoria: 'VIARIO',
    subcategoria: SUBCATEGORIAS_POR_CATEGORIA.VIARIO[0],
    descricao: '',
    enderecoAproximado: '',
    bairro: '',
    urgencia: 'MEDIA',
    riscoAcidente: false,
    recorrente: false,
  });
  const [imagens, setImagens] = useState([]);
  const [errors, setErrors] = useState({});
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [classificacaoIA, setClassificacaoIA] = useState(null);
  const [loadingClassificacao, setLoadingClassificacao] = useState(false);
  const [classificacaoErro, setClassificacaoErro] = useState(null);
  const geocodeSeq = useRef(0);

  const aplicarClassificacao = (resultado) => {
    const categoria = resultado.categoria || 'VIARIO';
    const opcoes = SUBCATEGORIAS_POR_CATEGORIA[categoria] || [];
    const subcategoria = opcoes.includes(resultado.subcategoria)
      ? resultado.subcategoria
      : opcoes[0] || '';

    setFormData((prev) => ({
      ...prev,
      categoria,
      subcategoria,
      urgencia: resultado.urgenciaSugerida || prev.urgencia,
    }));
    setClassificacaoIA(resultado);
  };

  useEffect(() => {
    if (!selectedLocation?.lat || !selectedLocation?.lng) return;

    const seq = ++geocodeSeq.current;
    setBuscandoEndereco(true);

    buscarEnderecoPorCoordenadas(selectedLocation.lat, selectedLocation.lng)
      .then(({ enderecoAproximado, bairro }) => {
        if (seq !== geocodeSeq.current) return;
        const bairroValido = bairro && BAIRROS_PORTO_SEGURO.includes(bairro) ? bairro : '';
        setFormData((prev) => ({
          ...prev,
          enderecoAproximado: enderecoAproximado || prev.enderecoAproximado,
          bairro: bairroValido || prev.bairro,
        }));
      })
      .catch(() => {
        /* usuário pode preencher manualmente */
      })
      .finally(() => {
        if (seq === geocodeSeq.current) setBuscandoEndereco(false);
      });

    return () => {
      geocodeSeq.current += 1;
    };
  }, [selectedLocation?.lat, selectedLocation?.lng]);

  useEffect(() => {
    if (protocoloSucesso) {
      setStep(4);
      if (onStepChange) onStepChange(4);
    }
  }, [protocoloSucesso, onStepChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    const subs = SUBCATEGORIAS_POR_CATEGORIA[categoria] || [];
    setFormData((prev) => ({
      ...prev,
      categoria,
      subcategoria: subs[0] || '',
    }));
  };

  const handleImagensChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_FOTOS);
    setImagens(files);
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!selectedLocation) newErrors.location = 'Selecione um ponto no mapa';
      if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
      if (formData.descricao.length > MAX_DESCRICAO) {
        newErrors.descricao = `Máximo ${MAX_DESCRICAO} caracteres`;
      }
      if (!formData.bairro) newErrors.bairro = 'Selecione o bairro';
    }
    if (stepNum === 2) {
      if (!formData.subcategoria.trim()) newErrors.subcategoria = 'Escolha a subcategoria';
    }
    return newErrors;
  };

  const goToStep = (next) => {
    setStep(next);
    if (onStepChange) onStepChange(next);
  };

  const avancarPasso = async () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (step === 1) {
      setLoadingClassificacao(true);
      setClassificacaoErro(null);
      try {
        let resultado;
        try {
          resultado = await classificarChamado({
            descricao: formData.descricao.trim(),
            riscoAcidente: formData.riscoAcidente,
            recorrente: formData.recorrente,
          });
        } catch {
          resultado = classificarChamadoLocal({
            descricao: formData.descricao.trim(),
            riscoAcidente: formData.riscoAcidente,
            recorrente: formData.recorrente,
          });
          setClassificacaoErro(
            'Servidor de triagem indisponível — classificação aplicada localmente. Você pode ajustar abaixo.'
          );
        }
        aplicarClassificacao(resultado);
        if (!resultado?.origemLocal) setClassificacaoErro(null);
      } catch {
        const local = classificarChamadoLocal({
          descricao: formData.descricao.trim(),
          riscoAcidente: formData.riscoAcidente,
          recorrente: formData.recorrente,
        });
        aplicarClassificacao(local);
        setClassificacaoErro(null);
      } finally {
        setLoadingClassificacao(false);
      }
    }

    goToStep(step + 1);
  };

  const handleBack = () => {
    setErrors({});
    goToStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) {
      await avancarPasso();
      return;
    }

    const newErrors = validateStep(1);
    Object.assign(newErrors, validateStep(2));
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({ ...formData, imagens }, selectedLocation);
  };

  const resetForm = () => {
    geocodeSeq.current += 1;
    setBuscandoEndereco(false);
    setClassificacaoIA(null);
    setClassificacaoErro(null);
    setLoadingClassificacao(false);
    setFormData({
      categoria: 'VIARIO',
      subcategoria: SUBCATEGORIAS_POR_CATEGORIA.VIARIO[0],
      descricao: '',
      enderecoAproximado: '',
      bairro: '',
      urgencia: 'MEDIA',
      riscoAcidente: false,
      recorrente: false,
    });
    setImagens([]);
    setErrors({});
    goToStep(1);
    if (onNovoChamado) onNovoChamado();
  };

  const subs =
    SUBCATEGORIAS_POR_CATEGORIA[formData.categoria] || [];

  return (
    <form className="problem-form stepped-form" onSubmit={handleSubmit}>
      <div className="progress-indicator">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`step-dot ${step >= num ? 'active' : ''}`}>
            {num}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="form-step">
          <h2>Passo 1: Local e descrição</h2>

          <div className="form-group">
            <label>Localização no mapa *</label>
            {selectedLocation ? (
              <div className="location-display">
                <p>
                  Latitude: <strong>{selectedLocation.lat.toFixed(5)}</strong>
                </p>
                <p>
                  Longitude: <strong>{selectedLocation.lng.toFixed(5)}</strong>
                </p>
              </div>
            ) : (
              <div className="form-error">
                {errors.location || 'Clique no mapa para marcar o local do problema'}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição do problema *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o que está acontecendo, tamanho, referências próximas..."
              maxLength={MAX_DESCRICAO}
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao && (
              <div className="form-error">{errors.descricao}</div>
            )}
            <div className="form-hint">
              {formData.descricao.length}/{MAX_DESCRICAO} caracteres
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="enderecoAproximado">Endereço aproximado</label>
            <input
              type="text"
              id="enderecoAproximado"
              name="enderecoAproximado"
              value={formData.enderecoAproximado}
              onChange={handleChange}
              placeholder={
                buscandoEndereco
                  ? 'Buscando endereço do local marcado...'
                  : 'Preenchido ao clicar no mapa'
              }
              readOnly={buscandoEndereco}
              aria-busy={buscandoEndereco}
            />
            <div className="form-hint">
              {buscandoEndereco
                ? 'Identificando endereço a partir do mapa...'
                : 'Você pode ajustar o texto se necessário'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bairro">Bairro *</label>
            <select
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              aria-invalid={!!errors.bairro}
            >
              <option value="">Selecione o bairro</option>
              {BAIRROS_OPCOES.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
            {errors.bairro && <div className="form-error">{errors.bairro}</div>}
            <div className="form-hint">
              Bairros oficiais de Porto Seguro — confirme o do local marcado no mapa
            </div>
          </div>

          <div className="form-group form-group--inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="riscoAcidente"
                checked={formData.riscoAcidente}
                onChange={handleChange}
              />
              Há risco de acidente neste local
            </label>
          </div>

          <div className="form-group form-group--inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="recorrente"
                checked={formData.recorrente}
                onChange={handleChange}
              />
              Problema recorrente (já ocorreu antes)
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step">
          <h2>Passo 2: Classificação sugerida pela IA</h2>

          {loadingClassificacao && (
            <p className="ocorrencia-ia-loading">Analisando sua descrição...</p>
          )}

          {classificacaoErro && !loadingClassificacao && (
            <div className="alert alert-warning" role="status">
              {classificacaoErro}
            </div>
          )}

          {classificacaoIA && !loadingClassificacao && (
            <section className="ocorrencia-ia-card" aria-live="polite">
              <div className="ocorrencia-ia-head">
                <span className="ocorrencia-ia-label">Triagem automática</span>
                {classificacaoIA.confianca != null && (
                  <span className="ocorrencia-ia-badge">{classificacaoIA.confianca}% confiança</span>
                )}
              </div>
              {classificacaoIA.orgaoNome && (
                <p className="ocorrencia-ia-orgao">
                  Encaminhamento previsto:{' '}
                  <strong>
                    {classificacaoIA.orgaoNome}
                    {classificacaoIA.orgaoSigla ? ` (${classificacaoIA.orgaoSigla})` : ''}
                  </strong>
                </p>
              )}
              {classificacaoIA.motivos?.length > 0 && (
                <ul className="ocorrencia-ia-motivos">
                  {classificacaoIA.motivos.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
              <p className="form-hint ocorrencia-ia-hint">
                Você pode alterar categoria e tipo abaixo. A urgência será definida automaticamente
                ao enviar o chamado.
              </p>
            </section>
          )}

          <div className="form-group">
            <label htmlFor="categoria">Categoria *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleCategoriaChange}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subcategoria">Tipo do problema *</label>
            <select
              id="subcategoria"
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleChange}
            >
              {subs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.subcategoria && (
              <div className="form-error">{errors.subcategoria}</div>
            )}
            {classificacaoIA?.categoria === formData.categoria && (
              <div className="form-hint">Sugerido pela IA com base na sua descrição</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="imagens">Fotos (opcional)</label>
            <input
              type="file"
              id="imagens"
              accept="image/*"
              multiple
              onChange={handleImagensChange}
            />
            <div className="form-hint">
              Até {MAX_FOTOS} imagens para ajudar na triagem.
              {imagens.length > 0 && ` (${imagens.length} selecionada(s))`}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step">
          <h2>Passo 3: Confirmação</h2>

          <div className="confirmation-box">
            <div className="confirmation-item">
              <span className="label">Local:</span>
              <span className="value">
                {selectedLocation?.lat.toFixed(5)}, {selectedLocation?.lng.toFixed(5)}
              </span>
            </div>
            {formData.bairro && (
              <div className="confirmation-item">
                <span className="label">Bairro:</span>
                <span className="value">{formData.bairro}</span>
              </div>
            )}
            <div className="confirmation-item">
              <span className="label">Categoria:</span>
              <span className="value">
                {CATEGORIAS.find((c) => c.value === formData.categoria)?.label}
              </span>
            </div>
            <div className="confirmation-item">
              <span className="label">Tipo:</span>
              <span className="value">{formData.subcategoria}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">Urgência:</span>
              <span className="value">
                {URGENCIAS.find((u) => u.value === formData.urgencia)?.label || 'Média'} (IA)
              </span>
            </div>
            <div className="confirmation-item">
              <span className="label">Descrição:</span>
              <span className="value">{formData.descricao}</span>
            </div>
          </div>

          {submitError && (
            <div className="alert alert-error" role="alert">
              {submitError}
            </div>
          )}

          <p className="info-text">
            Ao confirmar, o chamado será registrado e encaminhado conforme a categoria.
          </p>
        </div>
      )}

      {step === 4 && protocoloSucesso && (
        <div className="form-step">
          <h2>Chamado registrado</h2>

          <div className="protocol-box">
            <div className="protocol-number">
              <p className="protocol-label">Protocolo:</p>
              <p className="protocol-value">{protocoloSucesso}</p>
              {orgaoNomeSucesso && (
                <p className="protocol-info">
                  Encaminhado para: <strong>{orgaoNomeSucesso}</strong>
                </p>
              )}
              <p className="protocol-info">
                Guarde o protocolo para acompanhar em &quot;Acompanhar&quot;.
              </p>
            </div>
          </div>

          <div className="alert alert-success">
            Chamado enviado com sucesso. Obrigado por contribuir com a cidade!
          </div>
        </div>
      )}

      <div className="form-actions">
        {step > 1 && step < 4 && (
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            Voltar
          </button>
        )}

        {step < 4 && (
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading || loadingClassificacao}
          >
            {step === 1 && loadingClassificacao
              ? 'Classificando...'
              : step === 3
                ? isLoading
                  ? 'Enviando...'
                  : 'Confirmar e abrir chamado'
                : 'Próximo'}
          </button>
        )}

        {step === 4 && (
          <button type="button" className="btn btn-primary btn-lg" onClick={resetForm}>
            Novo chamado
          </button>
        )}
      </div>
    </form>
  );
}
