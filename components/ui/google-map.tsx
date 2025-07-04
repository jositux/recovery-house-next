"use client"

import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface GoogleMapProps {
  lat: number
  lng: number
  apiKey?: string
}

export function GoogleMap({ lat, lng, apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerInstance = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || !apiKey) return

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"],
        })

        const google = await loader.load()

        if (!mapInstance.current) {
          // Crear el mapa
          mapInstance.current = new google.maps.Map(mapRef.current!, {
            center: { lat, lng },
            zoom: 15,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          })

          // Crear el marcador
          markerInstance.current = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstance.current,
            title: "Ubicación seleccionada",
            animation: google.maps.Animation.DROP,
          })

          // Agregar InfoWindow al marcador
          const infoWindow = new google.maps.InfoWindow({
            content: "Ubicación seleccionada",
          })

          markerInstance.current.addListener("click", () => {
            infoWindow.open(mapInstance.current, markerInstance.current)
          })
        } else {
          // Actualizar posición del mapa y marcador
          const newPosition = { lat, lng }
          mapInstance.current.setCenter(newPosition)

          if (markerInstance.current) {
            markerInstance.current.setPosition(newPosition)
          }
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    initializeMap()

    return () => {
      if (markerInstance.current) {
        markerInstance.current.setMap(null)
        markerInstance.current = null
      }
      if (mapInstance.current) {
        mapInstance.current = null
      }
    }
  }, [lat, lng, apiKey])

  if (!apiKey) {
    return (
      <div
        style={{ width: "100%", height: "300px" }}
        className="flex items-center justify-center bg-gray-100 text-gray-500"
      >
        Google Maps API key is required
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} className="rounded-lg overflow-hidden" />
}
