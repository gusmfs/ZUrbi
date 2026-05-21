import { useState } from 'react';
import { Link } from 'react-router-dom';
import Map from '../components/Map';
import OcorrenciaForm from '../components/OcorrenciaForm';
import { useAuthStore } from '../store';
import { DEMO_USUARIO_CIDADAO } from '../constants/ocorrencia';
import { registrarOcorrencia } from '../services/ocorrencias';
import './MapReport.css';

const STEP_TITLES = {
  1: 'Local e descrição',
  2: 'Classificação',
  3: 'Revisar',
  4: 'Concluído',
};

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

  const showMap = currentStep === 1;

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
      riscoAcidente: false,
      recorrente: false,
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
    <div className="map-report map-report--flow">
      <header className="map-report-toolbar">
        <div className="map-report-toolbar-inner">
          <h1 className="map-report-title">Abrir chamado</h1>
          <p className="map-report-step-meta">
            Passo {currentStep} de 4 · {STEP_TITLES[currentStep]}
          </p>
        </div>
      </header>

      <div className={`map-report-body step-${currentStep}`}>
        {showMap && (
          <div className="map-report-map-stage" aria-label="Mapa — marque o local do problema">
            <div className="map-report-map-inner">
              <Map
                variant="report"
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            </div>
            <p className="map-report-map-hint" role="status">
              {selectedLocation
                ? 'Local marcado. Preencha os dados abaixo.'
                : 'Toque no mapa onde está o problema'}
            </p>
          </div>
        )}

        <div
          className={`map-report-panel${showMap ? ' map-report-panel--sheet' : ' map-report-panel--full'}`}
        >
          <OcorrenciaForm
            selectedLocation={selectedLocation}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStepChange={setCurrentStep}
            submitError={submitError}
            protocoloSucesso={protocoloSucesso}
            orgaoNomeSucesso={orgaoNomeSucesso}
            onNovoChamado={handleNovoChamado}
            mobileFlow
          />
          {currentStep === 4 && protocoloSucesso && (
            <p className="map-report-follow">
              <Link to="/acompanhar">Acompanhar chamados</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
