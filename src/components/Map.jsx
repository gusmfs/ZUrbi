import { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './Map.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333,
};

const mapBounds = {
  north: -23.38,
  south: -23.80,
  east: -46.27,
  west: -46.97,
};

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

export default function Map({ onLocationSelect, selectedLocation, problems }) {
  const [hoveredProblem, setHoveredProblem] = useState(null);
  const mapRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleMapClick = useCallback((event) => {
    onLocationSelect({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  }, [onLocationSelect]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey={apiKey} language="pt-BR">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          restriction={{
            latLngBounds: mapBounds,
            strictBounds: false,
          }}
          options={{
            maxZoom: 18,
            minZoom: 11,
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
                  <p>Latitude: {selectedLocation.lat.toFixed(5)}</p>
                  <p>Longitude: {selectedLocation.lng.toFixed(5)}</p>
                </div>
              </InfoWindow>
            </Marker>
          )}

          {problems &&
            problems.map((problem) => (
              <Marker
                key={problem.id}
                position={{
                  lat: problem.location.lat,
                  lng: problem.location.lng,
                }}
                title={problem.title}
                icon={problemIcon}
                onMouseOver={() => setHoveredProblem(problem.id)}
                onMouseOut={() => setHoveredProblem(null)}
              >
                {hoveredProblem === problem.id && (
                  <InfoWindow
                    position={{
                      lat: problem.location.lat,
                      lng: problem.location.lng,
                    }}
                  >
                    <div className="marker-popup">
                      <h4>{problem.title}</h4>
                      <p>{problem.description}</p>
                      <small>{new Date(problem.createdAt).toLocaleDateString('pt-BR')}</small>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      </LoadScript>
      <div className="map-instructions">
        <p>💡 Clique no mapa para marcar a localização do problema</p>
      </div>
    </div>
  );
}
