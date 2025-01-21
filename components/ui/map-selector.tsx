'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationDetails {
  address: string
  lat: number
  lng: number
  postalCode: string
  streetNumber: string
  city: string
  state: string
  country: string
}

interface MapSelectorProps {
  onLocationSelected: (details: LocationDetails) => void
}

function DraggableMarker({ position, setPosition }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  useEffect(() => {
    if (map) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])

  return (
    <Marker
      draggable={true}
      position={position}
      icon={blueIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          if (marker && marker.getLatLng) {
            setPosition(marker.getLatLng())
          }
        },
      }}
    />
  )
}

function MapUpdater({ center }: { center: L.LatLng }) {
  const map = useMap()
  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function MapSelector({ onLocationSelected }: MapSelectorProps) {
  const [userInput, setUserInput] = useState('')
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(51.505, -0.09))
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    address: '',
    lat: 51.505,
    lng: -0.09,
    postalCode: '',
    streetNumber: '',
    city: '',
    state: '',
    country: '',
  })

  interface AddressDetails {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  }
  
  const updateLocationDetails = useCallback((pos: L.LatLng, address: string, addressDetails?: AddressDetails) => {
    if (!pos) return
    const details: LocationDetails = {
      address: address || '',
      lat: pos.lat,
      lng: pos.lng,
      postalCode: addressDetails?.postcode || '',
      streetNumber: addressDetails?.house_number || '',
      city: addressDetails?.city || addressDetails?.town || addressDetails?.village || '',
      state: addressDetails?.state || '',
      country: addressDetails?.country || '',
    }
    setLocationDetails(details)
    onLocationSelected(details)
  }, [onLocationSelected])
  

  const geocodeAddress = useCallback(async (searchAddress: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&addressdetails=1`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name, address } = data[0]
        const newPosition = new L.LatLng(parseFloat(lat), parseFloat(lon))
        setPosition(newPosition)
        updateLocationDetails(newPosition, display_name, address)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }, [updateLocationDetails])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      if (data && data.address) {
        updateLocationDetails(new L.LatLng(lat, lng), data.display_name, data.address)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }, [updateLocationDetails])

  useEffect(() => {
    if (userInput.trim()) {
      geocodeAddress(userInput)
    }
  }, [userInput, geocodeAddress])

  useEffect(() => {
    reverseGeocode(position.lat, position.lng)
  }, [position, reverseGeocode])

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Escribe tu dirección y ubica el punto en el mapa"
          className="flex-grow"
        />
      </div>
      <div className="h-[400px] w-full relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }} 
          className="rounded-lg shadow-md z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker position={position} setPosition={setPosition} />
          <MapUpdater center={position} />
        </MapContainer>
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Detalles de la Ubicación</h3>
          <p><strong>Dirección Completa:</strong> {locationDetails.address}</p>
          <p><strong>Latitud:</strong> {locationDetails.lat.toFixed(6)}</p>
          <p><strong>Longitud:</strong> {locationDetails.lng.toFixed(6)}</p>
          <p><strong>Código Postal:</strong> {locationDetails.postalCode}</p>
          <p><strong>Número de Calle:</strong> {locationDetails.streetNumber}</p>
          <p><strong>Ciudad:</strong> {locationDetails.city}</p>
          <p><strong>Estado:</strong> {locationDetails.state}</p>
          <p><strong>País:</strong> {locationDetails.country}</p>
        </CardContent>
      </Card>
    </div>
  )
}
