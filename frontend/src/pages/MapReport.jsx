import { useState } from 'react';
import { Link } from 'react-router-dom';
import Map from '../components/Map';
import OcorrenciaForm from '../components/OcorrenciaForm';
import { useAuthStore } from '../store';
import { DEMO_USUARIO_CIDADAO } from '../constants/ocorrencia';
import { registrarOcorrencia } from '../services/ocorrencias';
import './MapReport.css';

function resolverUsuarioId(user) {
  if (!user) return DEMO_USUARIO_CIDADAO;
  const id = user.usuarioId || user.id;
  if (typeof id === 'string' && id.includes('-')) return id;
  return DEMO_USUARIO_CIDADAO;
}

function mensagemErroApi(error) {
  const data = error?.response?.data;
  if (!data) return 'Não foi possível registrar o chamado. Tente novamente.';
  if (typeof data.message === 'string') return data.message;
  if (data.detalhes && typeof data.detalhes === 'object') {
    const msgs = Object.values(data.detalhes).filter(Boolean);
    if (msgs.length) return msgs.join(' ');
  }
  return data.error || 'Erro ao registrar o chamado.';
}

export default function MapReport() {
  const { user } = useAuthStore();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [protocoloSucesso, setProtocoloSucesso] = useState(null);
  const [orgaoNomeSucesso, setOrgaoNomeSucesso] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSubmitError(null);
  };

  const handleSubmit = async (formPayload, location) => {
    setIsLoading(true);
    setSubmitError(null);

    const { imagens, ...campos } = formPayload;
    const dados = {
      usuarioId: resolverUsuarioId(user),
      categoria: campos.categoria,
      subcategoria: campos.subcategoria,
      descricao: campos.descricao.trim(),
      urgencia: campos.urgencia,
      latitude: location.lat,
      longitude: location.lng,
      enderecoAproximado: campos.enderecoAproximado?.trim() || null,
      bairro: campos.bairro?.trim() || null,
      riscoAcidente: Boolean(campos.riscoAcidente),
      recorrente: Boolean(campos.recorrente),
    };

    try {
      const criado = await registrarOcorrencia(dados, imagens);
      setProtocoloSucesso(criado.protocolo);
      setOrgaoNomeSucesso(criado.orgaoNome || null);
      setSelectedLocation(null);
      setCurrentStep(4);
    } catch (error) {
      console.error('Erro ao registrar ocorrência:', error);
      setSubmitError(mensagemErroApi(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNovoChamado = () => {
    setProtocoloSucesso(null);
    setOrgaoNomeSucesso(null);
    setSubmitError(null);
    setSelectedLocation(null);
    setCurrentStep(1);
  };

  return (
    <div className="map-report">
      <div className="container">
        <div className="page-header">
          <h1>Abrir chamado</h1>
          <p className="page-description">
            Marque no mapa onde está o problema em Porto Seguro e descreva a situação
            para enviar à prefeitura.
          </p>
        </div>

        <div className={`map-report-layout step-${currentStep}`}>
          <div className="map-section">
            <Map
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </div>

          <div className="form-section">
            <OcorrenciaForm
              selectedLocation={selectedLocation}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onStepChange={setCurrentStep}
              submitError={submitError}
              protocoloSucesso={protocoloSucesso}
              orgaoNomeSucesso={orgaoNomeSucesso}
              onNovoChamado={handleNovoChamado}
            />
            {currentStep === 4 && protocoloSucesso && (
              <p className="map-report-follow">
                <Link to="/acompanhar">Acompanhar chamados</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
