"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import type { Libraries } from "@react-google-maps/api"

// 💡 Importación de Locale
import { type Locale } from "@/lib/i18n" 

// Definimos un tipo más específico para window.google
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
  defaultLocation: LocationDetails
  lang: Locale // 💡 Usando el tipo Locale
}

const libraries: Libraries = ["places"]

// 💡 Objeto de Traducciones
const translations = {
  es: {
    loadingMaps: "Cargando mapas",
    errorMaps: "Error al cargar los mapas",
    searchPlaceholder: "Busca una dirección y mueve el punto para ubicar con precisión",
    noGeometry: "El lugar devuelto no contiene geometría",
    geocoderFailed: "Geocodificador falló debido a:",
  },
  en: {
    loadingMaps: "Loading maps",
    errorMaps: "Error loading maps",
    searchPlaceholder: "Search for an address and move the marker to locate precisely",
    noGeometry: "Returned place contains no geometry",
    geocoderFailed: "Geocoder failed due to:",
  },
}


export default function GoogleMapsSelector({ onLocationSelected, defaultLocation, lang }: GoogleMapsSelectorProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  
  // 💡 Variables de traducción
  const t = translations[lang] || translations.es
  //const isSpanish = lang === 'es'

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries,
    language: lang, // Usa el idioma para el script de Google Maps
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [position, setPosition] = useState({ lat: defaultLocation.lat, lng: defaultLocation.lng })
  const [searchInput, setSearchInput] = useState(defaultLocation.address)
  const [isLoading, setIsLoading] = useState(false)

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const updateLocationDetails = useCallback(
    (place: google.maps.places.PlaceResult) => {
      setIsLoading(true)
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

        setSearchInput(details.address)
        onLocationSelected(details)
      }
      setIsLoading(false)
    },
    [map, marker, onLocationSelected],
  )

  useEffect(() => {
    if (isLoaded && map) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("pac-input") as HTMLInputElement,
        { types: ["address"] },
      )
      autocomplete.bindTo("bounds", map)
      autocompleteRef.current = autocomplete

      autocomplete.addListener("place_changed", () => {
        setIsLoading(true)
        const place = autocomplete.getPlace()
        if (!place.geometry || !place.geometry.location) {
          console.log(t.noGeometry)
          setIsLoading(false)
          return
        }

        updateLocationDetails(place)
      })
    }
  }, [isLoaded, map, t.noGeometry, updateLocationDetails])

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() }
      setPosition(newPosition)
      setIsLoading(true)
      reverseGeocode(newPosition)
    }
  }, [])

  const reverseGeocode = useCallback(
    (location: { lat: number; lng: number }) => {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode(
        { location: location },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === "OK" && results && results[0]) {
            const place = results[0]
            updateLocationDetails(place)
          } else {
            console.error(t.geocoderFailed + " " + status)
            setIsLoading(false)
          }
        },
      )
    },
    [t.geocoderFailed, updateLocationDetails],
  )

  if (loadError) return <div>{t.errorMaps}</div>
  if (!isLoaded) return <div>{t.loadingMaps}</div>

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="pac-input"
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            if (e.target.value === "") {
              setIsLoading(false)
            } else {
              setIsLoading(true)
            }
          }}
          placeholder={t.searchPlaceholder}
          className="w-full pr-10"
        />
        {isLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
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