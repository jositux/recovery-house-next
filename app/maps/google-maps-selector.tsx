"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import type { Libraries } from "@react-google-maps/api"

declare global {
  interface Window {
    google: typeof google
  }
}

export interface LocationDetails {
  address: string
  lat: number
  lng: number
  postalCode: string
}

interface GoogleMapsSelectorProps {
  onLocationSelected: (details: LocationDetails) => void
  defaultLocation?: LocationDetails
  apiKey: string
}

const libraries: Libraries = ["places"]

export default function GoogleMapsSelector({
  onLocationSelected,
  defaultLocation = {
    address: "",
    lat: 40.416775,
    lng: -3.70379,
    postalCode: "",
  },
  
}: GoogleMapsSelectorProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: defaultLocation.lat, lng: defaultLocation.lng })
  const [searchInput, setSearchInput] = useState<string>(defaultLocation.address)

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (isLoaded && map) {
      const inputElement = document.getElementById("pac-input") as HTMLInputElement
      if (inputElement) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputElement, { types: ["address"] })
        autocomplete.bindTo("bounds", map)
        autocompleteRef.current = autocomplete

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry")
            return
          }

          updateLocationDetails(place)
        })
      }
    }
  }, [isLoaded, map])

  const updateLocationDetails = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      setPosition(newPosition)
      map?.panTo(newPosition)
      marker?.setPosition(newPosition)

      const details: LocationDetails = {
        address: place.formatted_address || "",
        lat: newPosition.lat,
        lng: newPosition.lng,
        postalCode:
          place.address_components?.find((component) => component.types.includes("postal_code"))?.long_name || "",
      }

      console.log("Geolocation:", newPosition)
      console.log("Postal Code:", details.postalCode)

      onLocationSelected(details)
    }
  }

  const handleMarkerDrag = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() }
      setPosition(newPosition)
      reverseGeocode(newPosition)
    }
  }

  const reverseGeocode = (location: { lat: number; lng: number }) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { location: location },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === "OK" && results && results[0]) {
          const place = results[0]
          updateLocationDetails(place)
        } else {
          console.error("Geocoder failed due to: " + status)
        }
      },
    )
  }

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="pac-input"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Busca una dirección y mueve el punto para ubicar con precisión"
          className="w-full pr-10"
        />
      </div>
      <div className="h-[400px] w-full relative">
        <GoogleMap
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={position}
          zoom={13}
          onLoad={(map) => {
            setMap(map)
            mapRef.current = map
          }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          <Marker
            position={position}
            draggable={true}
            onDragEnd={handleMarkerDrag}
            onLoad={(marker) => setMarker(marker)}
          />
        </GoogleMap>
      </div>
    </div>
  )
}
