import { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MAPA_PORTO_SEGURO } from '../constants/ocorrencia';
import './Map.css';

const defaultCenter = MAPA_PORTO_SEGURO.center;
const mapBounds = MAPA_PORTO_SEGURO.bounds;
const defaultZoom = MAPA_PORTO_SEGURO.zoom;

const selectedLocationIcon = {
  path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  fillColor: '#4285F4',
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 2,
  scale: 1.5,
};

const problemIcon = {
  path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  fillColor: '#EA4335',
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 2,
  scale: 1.2,
};

function triggerMapResize(map) {
  if (!map || typeof google === 'undefined') return;
  google.maps.event.trigger(map, 'resize');
  map.setCenter(defaultCenter);
}

function MapUnconfigured() {
  return (
    <div className="map-container map-container--unconfigured">
      <div className="map-setup-hint">
        <h3>Mapa não configurado</h3>
        <p>
          É necessária uma chave da <strong>Maps JavaScript API</strong> do Google Cloud.
        </p>
        <ol>
          <li>
            Acesse{' '}
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud Console → Maps
            </a>
          </li>
          <li>Crie um projeto e ative <strong>Maps JavaScript API</strong></li>
          <li>
            No arquivo <code>.env.local</code> na raiz do projeto:
            <pre>VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui</pre>
          </li>
          <li>Reinicie a aplicação após configurar a chave</li>
        </ol>
      </div>
    </div>
  );
}

function GoogleMapView({ onLocationSelect, selectedLocation, problems, variant, apiKey }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    language: 'pt-BR',
  });

  const handleMapClick = useCallback(
    (event) => {
      onLocationSelect({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    },
    [onLocationSelect]
  );

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    requestAnimationFrame(() => triggerMapResize(map));
    setTimeout(() => triggerMapResize(map), 150);
    setTimeout(() => triggerMapResize(map), 500);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !mapRef.current) return undefined;

    const ro = new ResizeObserver(() => {
      triggerMapResize(mapRef.current);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoaded]);

  if (loadError) {
    return (
      <div className={`map-container map-container--error${variant ? ` map-container--${variant}` : ''}`}>
        <p>Não foi possível carregar o mapa. Verifique a chave da API e as restrições no Google Cloud.</p>
      </div>
    );
  }

  const containerClass = [
    'map-container',
    variant ? `map-container--${variant}` : '',
    !isLoaded ? 'map-container--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClass}>
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="map-canvas"
          center={defaultCenter}
          zoom={defaultZoom}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          restriction={{
            latLngBounds: mapBounds,
            strictBounds: false,
          }}
          options={{
            maxZoom: 18,
            minZoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {selectedLocation && (
            <Marker
              position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
              }}
              title="Localização selecionada"
              icon={selectedLocationIcon}
            >
              <InfoWindow position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
                <div className="info-window">
                  <p>Local marcado no mapa</p>
                </div>
              </InfoWindow>
            </Marker>
          )}

          {problems?.map((problem) => (
            <Marker
              key={problem.id}
              position={{
                lat: problem.location.lat,
                lng: problem.location.lng,
              }}
              title={problem.title}
              icon={problemIcon}
            />
          ))}
        </GoogleMap>
      ) : (
        <div className="map-loading-placeholder" aria-busy="true">
          <span>Carregando mapa…</span>
        </div>
      )}
      {variant !== 'report' && (
        <div className="map-instructions">
          <p>Clique no mapa para marcar onde está o problema (Porto Seguro)</p>
        </div>
      )}
    </div>
  );
}

export default function Map(props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return <MapUnconfigured />;
  }
  return <GoogleMapView {...props} apiKey={apiKey} />;
}
