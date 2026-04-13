import { useState } from 'react';
import './ProblemForm.css';

const PROBLEM_TYPES = [
  { value: 'broken_road', label: 'Buraco na Rua' },
  { value: 'intercepted_lane', label: 'Faixa Interceptada' },
  { value: 'street_infrastructure', label: 'Infraestrutura de Rua' },
  { value: 'general_maintenance', label: 'Manutenção Geral' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export default function ProblemForm({ selectedLocation, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'broken_road',
    severity: 'medium',
    location: selectedLocation,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.location) {
      newErrors.location = 'Selecione uma localização no mapa';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      location: selectedLocation,
    });

    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        type: 'broken_road',
        severity: 'medium',
        location: null,
      });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <form className="problem-form" onSubmit={handleSubmit}>
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
        {errors.description && <div className="form-error">{errors.description}</div>}
        <div className="form-hint">Máximo 500 caracteres</div>
      </div>

      <div className="form-grid">
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
          <label htmlFor="severity">Nível de Severidade *</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            {SEVERITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Localização *</label>
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
          <div className={`form-error`}>
            {errors.location || 'Por favor, clique no mapa para selecionar a localização'}
          </div>
        )}
      </div>

      {submitted && (
        <div className="alert alert-success">
          ✓ Problema reportado com sucesso! Obrigado por ajudar a melhorar nossa cidade.
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={isLoading || submitted}
      >
        {isLoading ? 'Enviando...' : 'Reportar Problema'}
      </button>
    </form>
  );
}
