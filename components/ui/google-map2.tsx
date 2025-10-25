"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface OSMMapProps {
  lat: number
  lng: number
}

export function GoogleMap({ lat, lng }: OSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current)

      // Definir un icono personalizado con sombra
      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
      })

      // Agregar marcador con icono y sombra
      L.marker([lat, lng], { icon: customIcon })
        .addTo(mapInstance.current)
        .bindPopup("Ubicación seleccionada")
    } else {
      mapInstance.current.setView([lat, lng], 15)
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [lat, lng])

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} />
}
