import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { OperationIncident, OperationIncidentSeverity, OperationIncidentType } from '@/data/operations'

interface OperationsMapProps {
  incidents: OperationIncident[]
  selectedIncidentId: string
  onSelectIncident: (incidentId: string) => void
}

const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

const markerColors: Record<OperationIncidentSeverity, string> = {
  baixa: '#0d3b66',
  media: '#00b4d8',
  alta: '#d64545',
}

function getIconPath(type: OperationIncidentType) {
  switch (type) {
    case 'viario':
      return '<path d="M8 3h3l1 18H9L8 3Zm4 0h3l1 18h-3L12 3Z" />'
    case 'iluminacao':
      return '<path d="M12 3a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Zm-2 14h4m-3 3h2" />'
    case 'saneamento':
      return '<path d="M12 3c2 3 5 6 5 10a5 5 0 0 1-10 0c0-4 3-7 5-10Z" />'
    case 'transito':
      return '<path d="M12 4v10m0 3v3m-4-4h8m-7-8h6" />'
    case 'limpeza':
      return '<path d="M9 6h6m-5 0V4h4v2m-6 2 1 11h6l1-11H8Z" />'
  }
}

function createMarkerElement(incident: OperationIncident, selected: boolean) {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.style.width = selected ? '42px' : '36px'
  marker.style.height = selected ? '42px' : '36px'
  marker.style.border = 'none'
  marker.style.padding = '0'
  marker.style.cursor = 'pointer'
  marker.style.background = 'transparent'
  marker.style.transition = 'transform 180ms ease'
  marker.innerHTML = `
    <span style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:100%;
      height:100%;
      border-radius:9999px;
      background:${markerColors[incident.severity]};
      box-shadow:${selected ? '0 10px 24px rgba(13,59,102,0.32)' : '0 6px 16px rgba(13,59,102,0.22)'};
      border:${selected ? '3px solid white' : '2px solid white'};
      transform:${selected ? 'scale(1.06)' : 'scale(1)'};
      ">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${getIconPath(incident.type)}
      </svg>
    </span>
  `
  return marker
}

export function OperationsMap({ incidents, selectedIncidentId, onSelectIncident }: OperationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const popupRef = useRef<maplibregl.Popup | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const firstIncident = incidents[0]

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: [firstIncident.longitude, firstIncident.latitude],
      zoom: 14.7,
      attributionControl: false,
    })

    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
      'top-right',
    )
    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }))

    return () => {
      popupRef.current?.remove()
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [incidents])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    incidents.forEach((incident) => {
      const marker = new maplibregl.Marker({
        element: createMarkerElement(incident, incident.id === selectedIncidentId),
        anchor: 'center',
      })
        .setLngLat([incident.longitude, incident.latitude])
        .addTo(map)

      marker.getElement().addEventListener('click', () => {
        onSelectIncident(incident.id)
      })

      markersRef.current.set(incident.id, marker)
    })
  }, [incidents, onSelectIncident, selectedIncidentId])

  useEffect(() => {
    const map = mapRef.current
    const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId)

    if (!map || !selectedIncident) {
      return
    }

    map.flyTo({
      center: [selectedIncident.longitude, selectedIncident.latitude],
      zoom: 15.8,
      speed: 0.65,
      essential: true,
    })

    popupRef.current?.remove()
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      offset: 18,
      className: 'zurbi-map-popup',
    })
      .setLngLat([selectedIncident.longitude, selectedIncident.latitude])
      .setHTML(`
        <div style="min-width: 180px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#00b4d8;">
            ${selectedIncident.district}
          </p>
          <p style="margin:6px 0 0;font-size:14px;font-weight:700;color:#0d3b66;">
            ${selectedIncident.title}
          </p>
          <p style="margin:6px 0 0;font-size:12px;line-height:1.45;color:#4a5568;">
            ${selectedIncident.updatedAt}
          </p>
        </div>
      `)
      .addTo(map)
  }, [incidents, selectedIncidentId])

  return (
    <div className="overflow-hidden rounded-2xl border border-cold-gray-lightest bg-white shadow-card">
      <div ref={mapContainerRef} className="h-[520px] w-full bg-cold-gray-lightest/40" />
    </div>
  )
}
