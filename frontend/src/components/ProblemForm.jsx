import { useState } from 'react';
import './ProblemForm.css';

const PROBLEM_TYPES = [
  { value: 'broken_road', label: 'Buraco na Rua' },
  { value: 'intercepted_lane', label: 'Faixa Interceptada' },
  { value: 'street_infrastructure', label: 'Infraestrutura de Rua' },
  { value: 'general_maintenance', label: 'Manutenção Geral' },
];

const SEVERITY_LEVELS = [
  {
    value: 'low',
    label: 'Nível 1 - Baixo',
    description: 'Pequenos danos, não afeta a circulação',
  },
  {
    value: 'medium',
    label: 'Nível 2 - Médio',
    description: 'Moderados, podem afetar a segurança',
  },
  {
    value: 'high',
    label: 'Nível 3 - Alto',
    description: 'Graves, risco significativo de acidentes',
  },
];

export default function ProblemForm({ selectedLocation, onSubmit, isLoading, onStepChange }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'broken_road',
    severity: 'medium',
    location: selectedLocation,
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [protocol, setProtocol] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
      if (!formData.description.trim())
        newErrors.description = 'Descrição é obrigatória';
      if (!selectedLocation) newErrors.location = 'Selecione uma localização';
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const nextStep = step + 1;
    setStep(nextStep);
    if (onStepChange) onStepChange(nextStep);
  };

  const handleBack = () => {
    setErrors({});
    const prevStep = step - 1;
    setStep(prevStep);
    if (onStepChange) onStepChange(prevStep);
  };

  const generateProtocol = () => {
    return `ZRB-${Date.now().toString().slice(-6).toUpperCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) {
      handleNext();
      return;
    }

    const generatedProtocol = generateProtocol();
    setProtocol(generatedProtocol);

    const finalData = {
      ...formData,
      location: selectedLocation,
      protocol: generatedProtocol,
      status: 'reported',
      views: 0,
    };

    onSubmit(finalData);
    setStep(4);
  };

  const handleEmailSubmit = () => {
    setFormData({
      title: '',
      description: '',
      type: 'broken_road',
      severity: 'medium',
      location: null,
      email: '',
    });
    setProtocol(null);
    setStep(1);
  };

  return (
    <form className="problem-form stepped-form">
      <div className="progress-indicator">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`step-dot ${step >= num ? 'active' : ''}`}>
            {num}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="form-step">
          <h2>Passo 1: Localização e Descrição</h2>

          <div className="form-group">
            <label htmlFor="title">Título do Problema *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Buraco grande na Rua X"
              aria-invalid={!!errors.title}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição Detalhada *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva os detalhes do problema, tamanho, localização específica, etc."
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
            <div className="form-hint">Máximo 500 caracteres</div>
          </div>

          <div className="form-group">
            <label>Localização no Mapa *</label>
            {selectedLocation ? (
              <div className="location-display">
                <p>
                  📍 Latitude: <strong>{selectedLocation.lat.toFixed(5)}</strong>
                </p>
                <p>
                  📍 Longitude: <strong>{selectedLocation.lng.toFixed(5)}</strong>
                </p>
              </div>
            ) : (
              <div className="form-error">
                {errors.location ||
                  'Por favor, clique no mapa para selecionar a localização'}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step">
          <h2>Passo 2: Tipo e Nível de Gravidade</h2>

          <div className="form-group">
            <label htmlFor="type">Tipo de Problema *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {PROBLEM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nível de Gravidade *</label>
            <div className="severity-selector">
              {SEVERITY_LEVELS.map((level) => (
                <div
                  key={level.value}
                  className={`severity-option ${
                    formData.severity === level.value ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      severity: level.value,
                    }))
                  }
                >
                  <div className="severity-label">{level.label}</div>
                  <div className="severity-description">{level.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step">
          <h2>Passo 3: Confirmação</h2>

          <div className="confirmation-box">
            <div className="confirmation-item">
              <span className="label">📍 Localização:</span>
              <span className="value">
                {selectedLocation?.lat.toFixed(5)}, {selectedLocation?.lng.toFixed(5)}
              </span>
            </div>

            <div className="confirmation-item">
              <span className="label">📝 Título:</span>
              <span className="value">{formData.title}</span>
            </div>

            <div className="confirmation-item">
              <span className="label">📋 Descrição:</span>
              <span className="value">{formData.description}</span>
            </div>

            <div className="confirmation-item">
              <span className="label">🏷️ Tipo:</span>
              <span className="value">
                {PROBLEM_TYPES.find((t) => t.value === formData.type)?.label}
              </span>
            </div>

            <div className="confirmation-item">
              <span className="label">⚠️ Gravidade:</span>
              <span className="value">
                {SEVERITY_LEVELS.find((l) => l.value === formData.severity)?.label}
              </span>
            </div>
          </div>

          <p className="info-text">
            ✓ Tudo correto? Clique em "Confirmar e Continuar" para finalizar o reporte.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="form-step">
          <h2>Passo 4: Protocolo e Atualização por Email</h2>

          <div className="protocol-box">
            <div className="protocol-number">
              <p className="protocol-label">Seu Número de Protocolo:</p>
              <p className="protocol-value">{protocol}</p>
              <p className="protocol-info">
                Guarde este número para consultar atualizações sobre o reporte.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email para Receber Atualizações</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
            />
            <div className="form-hint">
              Deixe em branco se não deseja receber atualizações por email.
            </div>
          </div>

          <div className="alert alert-success">
            ✓ Seu reporte foi enviado com sucesso! Obrigado por ajudar a melhorar zUrbi!
          </div>
        </div>
      )}

      <div className="form-actions">
        {step > 1 && step < 4 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            ← Voltar
          </button>
        )}

        {step < 4 && (
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {step === 3
              ? isLoading
                ? 'Enviando...'
                : 'Confirmar e Enviar'
              : 'Próximo →'}
          </button>
        )}

        {step === 4 && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleEmailSubmit}
          >
            Novo Reporte
          </button>
        )}
      </div>
    </form>
  );
}
