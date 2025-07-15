"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface Alert {
  id: string
  latitude: number
  longitude: number
  urgencyScore: number
  status: string
  createdAt: string
  user?: {
    name: string
  }
}

interface AlertsMapProps {
  alerts: Alert[]
}

// Fix for default markers in react-leaflet
const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#fff" strokeWidth="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

export function AlertsMap({ alerts }: AlertsMapProps) {
  const mapRef = useRef<any>(null)

  const getMarkerColor = (urgencyScore: number) => {
    if (urgencyScore >= 0.8) return "#dc2626" // red
    if (urgencyScore >= 0.6) return "#ea580c" // orange
    if (urgencyScore >= 0.4) return "#ca8a04" // yellow
    return "#16a34a" // green
  }

  // Center map on FUTO campus (approximate coordinates)
  const defaultCenter: [number, number] = [5.3944, 7.0467]

  useEffect(() => {
    if (mapRef.current && alerts.length > 0) {
      const bounds = alerts.map((alert) => [alert.latitude, alert.longitude] as [number, number])
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [alerts])

  return (
    <MapContainer center={defaultCenter} zoom={15} style={{ height: "100%", width: "100%" }} ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={createCustomIcon(getMarkerColor(alert.urgencyScore))}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Alert #{alert.id.slice(-6)}</h3>
              <p className="text-sm text-gray-600">From: {alert.user?.name || "Anonymous"}</p>
              <p className="text-sm text-gray-600">Urgency: {Math.round(alert.urgencyScore * 100)}%</p>
              <p className="text-sm text-gray-600">Status: {alert.status}</p>
              <p className="text-sm text-gray-600">Time: {new Date(alert.createdAt).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
