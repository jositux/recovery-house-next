"use client"

import { useCallback, useState, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import Image from 'next/image'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  price: number
  latitude: number
  longitude: number
  image: string
}

interface MapProps {
  properties: Property[]
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

const colombiaCenter = {
  lat: 4.570868,
  lng: -74.297333
}

export function Map({ properties }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
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
    if (mapRef.current && properties.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      properties.forEach((property) => {
        bounds.extend({ lat: property.latitude, lng: property.longitude })
      })
      mapRef.current.fitBounds(bounds)
    }
  }, [properties, map])

  if (!isLoaded) return <div>Loading...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={colombiaCenter}
      zoom={6}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={{ lat: property.latitude, lng: property.longitude }}
          onClick={() => setSelectedProperty(property)}
        />
      ))}

      {selectedProperty && (
        <InfoWindow
          position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div className="max-w-xs">
            <Link href={`/properties/${selectedProperty.id}`} className="block">
              <Image
                src={selectedProperty.image}
                alt={selectedProperty.title}
                width={200}
                height={150}
                className="w-full h-auto object-cover mb-2 rounded"
              />
              <h3 className="font-bold text-lg mb-1 text-[#39759E] hover:underline">{selectedProperty.title}</h3>
            </Link>
            <p className="font-bold text-[#162F40]">
              ${selectedProperty.price.toLocaleString('es-CO')} <span className="font-normal">COP por noche</span>
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}

