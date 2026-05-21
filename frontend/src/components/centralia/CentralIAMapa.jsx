import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MAPA_PORTO_SEGURO } from '../../constants/ocorrencia';
import { labelStatus, labelUrgencia } from '../../utils/centralIa';
import './CentralIAMapa.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

/** Fallback SVG (círculo unitário) se `google.maps` ainda não estiver disponível. */
const CIRCLE_PATH_FALLBACK = 'M 0,0 m -1,0 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0';

function corUrgencia(urgencia) {
  if (urgencia === 'ALTA') return '#DC2626';
  if (urgencia === 'MEDIA') return '#F0B429';
  return '#2A7FD6';
}

function pathBolinha() {
  if (typeof google !== 'undefined' && google.maps?.SymbolPath?.CIRCLE != null) {
    return google.maps.SymbolPath.CIRCLE;
  }
  return CIRCLE_PATH_FALLBACK;
}

/** Marcador em bolinha (ponto) colorido pela urgência. */
function iconeBolinha(cor, selecionado = false) {
  return {
    path: pathBolinha(),
    fillColor: cor,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: selecionado ? 3 : 2,
    scale: selecionado ? 11 : 8,
  };
}

export default function CentralIAMapa({ pontos = [], selectedId, onSelectPonto }) {
  const mapRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const pontosValidos = useMemo(
    () => pontos.filter((p) => p.lat != null && p.lng != null),
    [pontos]
  );

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const alvo = pontosValidos.find((p) => p.id === selectedId);
    if (alvo) {
      mapRef.current.panTo({ lat: alvo.lat, lng: alvo.lng });
    }
  }, [selectedId, pontosValidos]);

  if (!apiKey || apiKey === 'undefined') {
    return (
      <div className="cia-mapa cia-mapa--unconfigured">
        <p>
          Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> no <code>.env.local</code> para exibir o
          mapa operacional.
        </p>
      </div>
    );
  }

  return (
    <div className="cia-mapa">
      <div className="cia-mapa__canvas">
        <LoadScript googleMapsApiKey={apiKey} language="pt-BR">
          <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={MAPA_PORTO_SEGURO.center}
          zoom={MAPA_PORTO_SEGURO.zoom}
          onLoad={onMapLoad}
          restriction={{
            latLngBounds: MAPA_PORTO_SEGURO.bounds,
            strictBounds: false,
          }}
          options={{
            maxZoom: 18,
            minZoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {pontosValidos.map((p) => {
            const selecionado = p.id === selectedId;
            const emHover = p.id === hoveredId;
            const cor = corUrgencia(p.urgencia);
            const mostrarInfo = selecionado || emHover;

            return (
              <Marker
                key={p.id}
                position={{ lat: p.lat, lng: p.lng }}
                title={p.protocolo}
                icon={iconeBolinha(cor, selecionado)}
                onClick={() => onSelectPonto?.(p.id)}
                onMouseOver={() => setHoveredId(p.id)}
                onMouseOut={() => setHoveredId((id) => (id === p.id ? null : id))}
                zIndex={selecionado ? 1000 : 1}
              >
                {mostrarInfo && (
                  <InfoWindow
                    position={{ lat: p.lat, lng: p.lng }}
                    onCloseClick={() => setHoveredId(null)}
                  >
                    <div className="marker-popup cia-mapa-popup">
                      <strong>{p.protocolo}</strong>
                      <p>{p.subcategoria || p.bairro}</p>
                      <p>
                        {p.bairro} · {labelUrgencia(p.urgencia)}
                      </p>
                      <small>{labelStatus(p.status)}</small>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
          </GoogleMap>
        </LoadScript>
      </div>
      <div className="cia-map-caption">
        <span>
          Porto Seguro · {pontosValidos.length} em aberto · clique na bolinha para ver o detalhe
        </span>
        <span className="cia-mapa-legenda" aria-hidden="true">
          <span className="cia-mapa-legenda__item">
            <i className="cia-mapa-dot" style={{ background: '#DC2626' }} /> Alta
          </span>
          <span className="cia-mapa-legenda__item">
            <i className="cia-mapa-dot" style={{ background: '#F0B429' }} /> Média
          </span>
          <span className="cia-mapa-legenda__item">
            <i className="cia-mapa-dot" style={{ background: '#2A7FD6' }} /> Baixa
          </span>
        </span>
      </div>
    </div>
  );
}
