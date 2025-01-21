'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import debounce from 'lodash.debounce'

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationDetails {
  address: string;
  lat: number;
  lng: number;
  postalCode: string;
  streetNumber: string;
  city: string;
  state: string;
  country: string;
}

interface MapSelectorProps {
  onLocationSelected: (details: LocationDetails) => void;
}

function DraggableMarker({ position, setPosition }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return (
    <Marker
      draggable={true}
      position={position}
      icon={blueIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          setPosition(marker.getLatLng())
        },
      }}
    />
  )
}

export function MapSelectorComponent({ onLocationSelected }: MapSelectorProps) {
  const [userInput, setUserInput] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(51.505, -0.09))
  const [mapKey, setMapKey] = useState(0)
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

  const geocodeAddress = useCallback(async (searchAddress: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`)
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setPosition(new L.LatLng(parseFloat(lat), parseFloat(lon)))
        setMapKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }, [])

  const debouncedGeocodeAddress = useMemo(
    () => debounce(geocodeAddress, 500),
    [geocodeAddress]
  )

  useEffect(() => {
    if (userInput) {
      debouncedGeocodeAddress(userInput)
    }
    return () => {
      debouncedGeocodeAddress.cancel()
    }
  }, [userInput, debouncedGeocodeAddress])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      if (data && data.address) {
        const details: LocationDetails = {
          address: data.display_name,
          lat,
          lng,
          postalCode: data.address.postcode || '',
          streetNumber: data.address.house_number || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          country: data.address.country || '',
        }
        setLocationDetails(details)
        setFullAddress(details.address)
        if (typeof onLocationSelected === 'function') {
          onLocationSelected(details)
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }, [onLocationSelected])

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
          key={mapKey} 
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
        </MapContainer>
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Location Details</h3>
          <p><strong>User Input:</strong> {userInput}</p>
          <p><strong>Full Address:</strong> {fullAddress}</p>
          <p><strong>Latitude:</strong> {locationDetails.lat.toFixed(6)}</p>
          <p><strong>Longitude:</strong> {locationDetails.lng.toFixed(6)}</p>
          <p><strong>Postal Code:</strong> {locationDetails.postalCode}</p>
          <p><strong>Street Number:</strong> {locationDetails.streetNumber}</p>
          <p><strong>City:</strong> {locationDetails.city}</p>
          <p><strong>State:</strong> {locationDetails.state}</p>
          <p><strong>Country:</strong> {locationDetails.country}</p>
        </CardContent>
      </Card>
    </div>
  )
}