"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Search } from "lucide-react"
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

  // Mantiene siempre la versión más reciente disponible para el listener de abajo,
  // sin necesidad de recrear el Autocomplete cada vez que cambia (evita duplicarlo).
  const updateLocationDetailsRef = useRef(updateLocationDetails)
  useEffect(() => {
    updateLocationDetailsRef.current = updateLocationDetails
  }, [updateLocationDetails])

  useEffect(() => {
    // Guard: sin esto, el efecto se re-ejecutaba apenas cargaba el marcador
    // (porque updateLocationDetails cambiaba de referencia) y creaba una SEGUNDA
    // instancia de Autocomplete sobre el mismo input, con comportamiento errático.
    if (isLoaded && map && !autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("pac-input") as HTMLInputElement,
        // "geocode" en vez de "address": "address" es demasiado estricto y no
        // devuelve resultados para ciudades, barrios o direcciones informales.
        { types: ["geocode"] },
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

        updateLocationDetailsRef.current(place)
      })
    }
  }, [isLoaded, map, t.noGeometry])

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
    <div className="space-y-2">
      <div className="h-[400px] w-full relative rounded-lg overflow-hidden border">
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

        {/* Buscador flotante sobre el mapa: deja claro que la búsqueda ubica el punto abajo */}
        <div className="absolute top-3 left-3 right-3 z-10">
          <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-[#39759E] transition-shadow">
            <MapPin className="absolute left-3.5 h-4 w-4 text-[#39759E] shrink-0" />
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
              className="w-full pl-10 pr-10 border-0 shadow-none rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {isLoading ? (
              <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-gray-400 shrink-0" />
            ) : (
              <Search className="absolute right-3.5 h-4 w-4 text-gray-400 shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}