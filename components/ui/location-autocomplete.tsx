"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, MapPin } from "lucide-react"
import { countriesData } from "@/data/countries"

interface Props {
  value?: string
  onChange?: (value: string) => void // Nueva prop
}

interface LocationOption {
  city: string
  state: string
  stateCode: string
  country: string
  countryCode: string
}

// Función para normalizar texto (eliminar acentos y caracteres especiales)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^\w\s]/g, "") // Eliminar caracteres especiales
}

export default function LocationAutocomplete({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [allLocations, setAllLocations] = useState<LocationOption[]>([])

  // Generate all location options
  useEffect(() => {
    const locations: LocationOption[] = []

    Object.entries(countriesData).forEach(([countryCode, country]) => {
      Object.entries(country.states).forEach(([stateCode, state]) => {
        state.cities.forEach((city) => {
          locations.push({
            city,
            state: state.name,
            stateCode,
            country: country.name,
            countryCode,
          })
        })
      })
    })

    setAllLocations(locations)
  }, [])

  // Calcular puntuación de relevancia para ordenar resultados
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

  // Filter locations based on input
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

  // Handle input change
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

  // Format location for display
  const formatLocation = (location: LocationOption) => {
    return `${location.city}, ${location.state}, ${location.country}`
  }

  // Handle selection
  const handleSelectLocation = (location: LocationOption) => {
    setSelectedLocation(location)
    setInputValue(formatLocation(location))
    if (onChange) onChange(formatLocation(location)) 
    setSuggestions([])
    setIsOpen(false)
  }

  // Handle click outside to close dropdown
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

  // Clear selection
  const handleClear = () => {
    setSelectedLocation(null)
    setInputValue("")
    if (onChange) onChange("") 
    setSuggestions([])
  }

  return (
    <div className="w-full max-w-md mx-auto" ref={wrapperRef}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Dónde deseas recuperarte?"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => inputValue && setIsOpen(true)}
              className="w-full h-6 border-0 p-0 focus-visible:ring-0"
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
                  key={`${location.countryCode}-${location.stateCode}-${location.city}-${index}`}
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

      {/*selectedLocation && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium">Ubicación seleccionada:</h3>
          <div className="mt-1">
            <div>
              <span className="font-medium">Ciudad:</span> {selectedLocation.city}
            </div>
            <div>
              <span className="font-medium">Estado/Departamento:</span> {selectedLocation.state} (
              {selectedLocation.stateCode})
            </div>
            <div>
              <span className="font-medium">País:</span> {selectedLocation.country} ({selectedLocation.countryCode})
            </div>
          </div>
        </div>
              )*/}
    </div>
  )
}

