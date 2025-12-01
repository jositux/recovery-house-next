"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, MapPin } from "lucide-react"

// 🛑 Importar el tipo de LocationOption desde el servicio (o definirlo aquí si no lo importas)
// Asumimos que la estructura del tipo simplificado es la siguiente:
interface LocationOption {
  id: string // Identificador de la API
  city: string
  state: string
  country: string
  // 🛑 ELIMINAMOS stateCode y countryCode ya que no vienen de la API en el payload
}


interface Props {
  value?: string
  onChange?: (value: string) => void
  lang: string
  // 🛑 NUEVA PROP: La lista de ubicaciones precargada desde el servidor
  availableLocations: LocationOption[] 
}

// Función para normalizar texto (eliminar acentos y caracteres especiales)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^\w\s]/g, "") // Eliminar caracteres especiales
}

// 🛑 EXPORT DEFAULT FUNCTION CON LA NUEVA PROP
export default function LocationAutocomplete({ value, lang, onChange, availableLocations }: Props) {
  const [inputValue, setInputValue] = useState(value || "")
  const [suggestions, setSuggestions] = useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // 🛑 ASIGNAMOS allLocations DIRECTAMENTE A LA PROP
  const allLocations = availableLocations
  const isSpanish = lang === "es"
  
  // 🛑 ELIMINAMOS el `useEffect` que generaba `allLocations` a partir de `countriesData`

  // Sincronizar el valor interno con el valor externo
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)

      // Si hay un valor pero no hay una ubicación seleccionada, intentar encontrar una coincidencia
      if (value && !selectedLocation && allLocations.length > 0) {
        const normalizedValue = normalizeText(value)
        const matchingLocation = allLocations.find((location) => {
          const formattedLoc = formatLocation(location)
          return normalizeText(formattedLoc).includes(normalizedValue)
        })

        if (matchingLocation) {
          setSelectedLocation(matchingLocation)
        }
      }
    }
  }, [value, allLocations, selectedLocation]) // allLocations es ahora una dependencia estable (prop)

  // Calcular puntuación de relevancia para ordenar resultados (lógica se mantiene)
  const calculateRelevanceScore = (location: LocationOption, normalizedInput: string): number => {
    let score = 0
    const normalizedCity = normalizeText(location.city)
    const normalizedState = normalizeText(location.state)
    const normalizedCountry = normalizeText(location.country)

    // Coincidencia exacta de ciudad (mayor prioridad)
    if (normalizedCity === normalizedInput) {
      score += 100
    }
    // Ciudad comienza con el texto de búsqueda
    else if (normalizedCity.startsWith(normalizedInput)) {
      score += 80
    }
    // Ciudad contiene el texto de búsqueda
    else if (normalizedCity.includes(normalizedInput)) {
      score += 60
    }

    // Coincidencia en estado
    if (normalizedState === normalizedInput) {
      score += 40
    } else if (normalizedState.startsWith(normalizedInput)) {
      score += 30
    } else if (normalizedState.includes(normalizedInput)) {
      score += 20
    }

    // Coincidencia en país
    if (normalizedCountry === normalizedInput) {
      score += 10
    } else if (normalizedCountry.startsWith(normalizedInput)) {
      score += 5
    } else if (normalizedCountry.includes(normalizedInput)) {
      score += 1
    }

    return score
  }

  // Filter locations based on input (lógica se mantiene)
  const filterLocations = (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    const normalizedInput = normalizeText(input)

    const filtered = allLocations
      .filter((location) => {
        const cityMatch = normalizeText(location.city).includes(normalizedInput)
        const stateMatch = normalizeText(location.state).includes(normalizedInput)
        const countryMatch = normalizeText(location.country).includes(normalizedInput)

        return cityMatch || stateMatch || countryMatch
      })
      // Ordenar por relevancia
      .sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, normalizedInput)
        const scoreB = calculateRelevanceScore(b, normalizedInput)
        return scoreB - scoreA // Orden descendente por puntuación
      })
      .slice(0, 10) // Limit to 10 results for performance

    setSuggestions(filtered)
  }

  // Handle input change (lógica se mantiene)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    filterLocations(value)
    if (onChange) onChange(value)
    setIsOpen(true)

    if (selectedLocation) {
      const normalizedValue = normalizeText(value)
      const normalizedSelected = normalizeText(formatLocation(selectedLocation))

      if (!normalizedSelected.includes(normalizedValue)) {
        setSelectedLocation(null)
      }
    }
  }

  // Format location for display (lógica se mantiene)
  const formatLocation = (location: LocationOption) => {
    return `${location.city}, ${location.state}, ${location.country}`
  }

  // Handle selection (lógica se mantiene)
  const handleSelectLocation = (location: LocationOption) => {
    setSelectedLocation(location)
    setInputValue(formatLocation(location))
    if (onChange) onChange(formatLocation(location))
    setSuggestions([])
    setIsOpen(false)
  }

  // Handle click outside to close dropdown (lógica se mantiene)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Clear selection (lógica se mantiene)
  const handleClear = () => {
    setSelectedLocation(null)
    setInputValue("")
    if (onChange) onChange("")
    setSuggestions([])
  }

  const placeholderText = isSpanish
  ? "¿Dónde deseas recuperarte?"
  : "Where would you like to recover?"

  return (
    <div className="w-full max-w-md mx-auto" ref={wrapperRef}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={placeholderText}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => inputValue && setIsOpen(true)}
              className="w-full h-6 border-0 p-4 md:p-0 mx-0 bg-white focus-visible:ring-0 text-sm"
              aria-label="Dónde deseas recuperarte?"
            />
            {selectedLocation && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 bg-white top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={handleClear}
                aria-label="Limpiar selección"
              >
                <span className="sr-only">Limpiar</span>×
              </Button>
            )}
          </div>
        </div>

        {isOpen && suggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
            <ul className="py-1">
              {suggestions.map((location, index) => (
                <li
                  // 🛑 CAMBIAMOS LA KEY para usar el 'id' de la API, que es más estable
                  key={location.id || index} 
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedLocation && formatLocation(selectedLocation) === formatLocation(location)
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                  onClick={() => handleSelectLocation(location)}
                >
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{location.city}</div>
                    <div className="text-sm text-gray-500">
                      {location.state}, {location.country}
                    </div>
                  </div>
                  {selectedLocation && formatLocation(selectedLocation) === formatLocation(location) && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Los comentarios de la ubicación seleccionada se mantienen igual (y comentados) */}
    </div>
  )
}