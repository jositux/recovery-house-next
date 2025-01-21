'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import debounce from 'lodash.debounce'

const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
})

export interface LocationDetails {
  address: string;
  lat: number;
  lng: number;
  postalCode: string;
}

interface OpenStreetMapSelectorProps {
  onLocationSelected: (details: LocationDetails) => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

function DraggableMarker({ position, setPosition }: { position: L.LatLng; setPosition: (pos: L.LatLng) => void }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return (
    <Marker
      draggable={true}
      position={position}
      icon={icon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target as L.Marker
          setPosition(marker.getLatLng())
        },
      }}
    />
  )
}

export default function OpenStreetMapSelector({ onLocationSelected }: OpenStreetMapSelectorProps) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(40.416775, -3.703790))
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    address: '',
    lat: 40.416775,
    lng: -3.703790,
    postalCode: ''
  })
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const mapRef = useRef<L.Map | null>(null)

  const handleSearch = useCallback(debounce(async (query: string) => {
    if (query.length < 3) return

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data: Suggestion[] = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }, 300), [])

  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    const newPosition = new L.LatLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon))
    setPosition(newPosition)
    setSearchInput(suggestion.display_name)
    setSuggestions([])
    updateLocationDetails(newPosition, suggestion.display_name)
  }

  const updateLocationDetails = async (pos: L.LatLng, address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
      const data: { address?: { postcode?: string } } = await response.json()
      const details: LocationDetails = {
        address: address,
        lat: pos.lat,
        lng: pos.lng,
        postalCode: data.address?.postcode || ''
      }
      setLocationDetails(details)
      onLocationSelected(details)
    } catch (error) {
      console.error('Error fetching location details:', error)
    }
  }

  const handleMarkerDrag = async (newPosition: L.LatLng) => {
    setPosition(newPosition)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}`)
      const data: { display_name?: string; address?: { postcode?: string } } = await response.json()
      const details: LocationDetails = {
        address: data.display_name || '',
        lat: newPosition.lat,
        lng: newPosition.lng,
        postalCode: data.address?.postcode || ''
      }
      setLocationDetails(details)
      onLocationSelected(details)
      setSearchInput(data.display_name || '')
    } catch (error) {
      console.error('Error fetching location details:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Busca una dirección"
          className="w-full"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-[400px] w-full relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg shadow-md z-0"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker position={position} setPosition={handleMarkerDrag} />
        </MapContainer>
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Detalles de la ubicación</h3>
          <p><strong>Dirección:</strong> {locationDetails.address}</p>
          <p><strong>Latitud:</strong> {locationDetails.lat.toFixed(6)}</p>
          <p><strong>Longitud:</strong> {locationDetails.lng.toFixed(6)}</p>
          <p><strong>Código Postal:</strong> {locationDetails.postalCode}</p>
        </CardContent>
      </Card>
    </div>
  )
}
