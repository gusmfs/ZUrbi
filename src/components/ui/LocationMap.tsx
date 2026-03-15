import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface LocationMapProps {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  isLoading: boolean
  errorMessage: string | null
  onLocateClick: () => void
}

const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

function createMarkerElement() {
  const marker = document.createElement('div')
  marker.className = 'relative flex h-5 w-5 items-center justify-center'
  marker.innerHTML = `
    <span style="position:absolute;inset:0;border-radius:9999px;background:#0d3b66;box-shadow:0 8px 24px rgba(13,59,102,0.22);"></span>
    <span style="position:absolute;width:8px;height:8px;border-radius:9999px;background:#ffffff;"></span>
  `
  return marker
}

export function LocationMap({
  latitude,
  longitude,
  accuracy,
  isLoading,
  errorMessage,
  onLocateClick,
}: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || latitude === null || longitude === null) {
      return
    }

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE_URL,
        center: [longitude, latitude],
        zoom: 17,
        attributionControl: false,
      })

      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
        'top-right',
      )
      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }))

      markerRef.current = new maplibregl.Marker({ element: createMarkerElement() })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current)
    } else {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 17,
        speed: 0.8,
        essential: true,
      })

      markerRef.current?.setLngLat([longitude, latitude])
    }
  }, [latitude, longitude])

  useEffect(() => {
    return () => {
      markerRef.current?.remove()
      mapRef.current?.remove()
    }
  }, [])

  const hasLocation = latitude !== null && longitude !== null

  return (
    <div className="relative overflow-hidden rounded-xl border border-cold-gray-lightest bg-white">
      <div ref={mapContainerRef} className="h-72 w-full bg-cold-gray-lightest/40" />

      {!hasLocation && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(226,232,240,0.82))] px-6 text-center">
          <span className="text-sm font-semibold text-institutional">
            {isLoading ? 'Capturando localização...' : 'Ative sua localização para visualizar o mapa real'}
          </span>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-cold-gray">
            {errorMessage ??
              'Usaremos a geolocalização do dispositivo para centralizar o mapa e apoiar o encaminhamento da ocorrência.'}
          </p>
          <button
            type="button"
            onClick={onLocateClick}
            disabled={isLoading}
            className="mt-5 inline-flex items-center rounded-full bg-institutional px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-institutional-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Obtendo localização' : 'Usar minha localização'}
          </button>
        </div>
      )}

      {hasLocation && (
        <div className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-2 text-xs font-medium text-institutional shadow-card backdrop-blur">
          Precisão aproximada: {accuracy ? `${Math.round(accuracy)} m` : 'indisponível'}
        </div>
      )}
    </div>
  )
}
