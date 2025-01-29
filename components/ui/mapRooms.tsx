"use client"

import { useCallback, useState, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import Image from 'next/image'
import Link from 'next/link'

interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  rooms: number
  image: string
}

interface MapProps {
  markers: MapMarker[]
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

const colombiaCenter = {
  lat: 4.570868,
  lng: -74.297333
}

export function MapRooms({ markers }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback() {
    mapRef.current = null
    setMap(null)
  }, [])

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      markers.forEach((marker) => {
        bounds.extend({ lat: marker.lat, lng: marker.lng })
      })
      mapRef.current.fitBounds(bounds)
    }
  }, [markers, map])

  if (!isLoaded) return <div>Cargando...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={colombiaCenter}
      zoom={6}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="max-w-xs">
            <Link href={`/propiedades/${selectedMarker.id}`} className="block">
              {selectedMarker.image && (
                <Image
                  src={`/webapi/assets/${selectedMarker.image}`}
                  alt={selectedMarker.name}
                  width={200}
                  height={150}
                  className="w-full h-auto object-cover mb-2 rounded"
                />
              )}
              <h3 className="font-bold text-lg mb-1 text-[#4A7598] hover:underline">{selectedMarker.name}</h3>
            </Link>
            <p className="font-bold text-gray-700">
              {selectedMarker.rooms} <span className="font-normal">habitación(es) disponible(s)</span>
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}

