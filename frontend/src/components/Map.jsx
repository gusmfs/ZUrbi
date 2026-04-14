import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelect, selectedLocation }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>
        Latitude: {selectedLocation.lat.toFixed(5)}
        <br />
        Longitude: {selectedLocation.lng.toFixed(5)}
      </Popup>
    </Marker>
  ) : null;
}

export default function Map({ onLocationSelect, selectedLocation, problems }) {
  const defaultCenter = [-23.5505, -46.6333]; // São Paulo
  const zoom = 13;

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={zoom} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
        {problems && problems.map((problem) => (
          <Marker key={problem.id} position={[problem.location.lat, problem.location.lng]}>
            <Popup>
              <div className="marker-popup">
                <h4>{problem.title}</h4>
                <p>{problem.description}</p>
                <small>{new Date(problem.createdAt).toLocaleDateString('pt-BR')}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-instructions">
        <p>💡 Clique no mapa para marcar a localização do problema</p>
      </div>
    </div>
  );
}
