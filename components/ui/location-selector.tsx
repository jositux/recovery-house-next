"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { countriesData } from "@/data/countries"

interface LocationSelectorProps {
  onChange: (location: { country: string; state: string; city: string }) => void
  defaultCountry?: string
  defaultState?: string
  defaultCity?: string
  error?: {
    country?: string
    state?: string
    city?: string
  }
}

export function LocationSelector({
  onChange,
  defaultCountry,
  defaultState,
  defaultCity,
  error,
}: LocationSelectorProps) {
  const [country, setCountry] = useState<string>(defaultCountry || "")
  const [state, setState] = useState<string>(defaultState || "")
  const [city, setCity] = useState<string>(defaultCity || "")

  useEffect(() => {
    if (country && state && city) {
      onChange({ country, state, city })
    }
  }, [country, state, city, onChange])

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry)
    setState("")
    setCity("")
  }

  const handleStateChange = (selectedState: string) => {
    setState(selectedState)
    setCity("")
  }

  const getStates = (countryName: string) => {
    const countryData = Object.values(countriesData).find((c) => c.name === countryName)
    return countryData ? Object.values(countryData.states).map((s) => s.name) : []
  }

  const getCities = (countryName: string, stateName: string) => {
    const countryData = Object.values(countriesData).find((c) => c.name === countryName)
    if (countryData) {
      const stateData = Object.values(countryData.states).find((s) => s.name === stateName)
      return stateData ? stateData.cities : []
    }
    return []
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="country">País</Label>
        <Select onValueChange={handleCountryChange} value={country}>
          <SelectTrigger id="country" className={error?.country ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un país" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(countriesData).map((countryData) => (
              <SelectItem key={countryData.name} value={countryData.name}>
                {countryData.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.country && <p className="text-sm text-red-500 mt-1">{error.country}</p>}
      </div>

      <div>
        <Label htmlFor="state">Estado</Label>
        <Select onValueChange={handleStateChange} value={state}>
          <SelectTrigger id="state" className={error?.state ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {country &&
              getStates(country).map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {error?.state && <p className="text-sm text-red-500 mt-1">{error.state}</p>}
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Select onValueChange={setCity} value={city}>
          <SelectTrigger id="city" className={error?.city ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona una ciudad" />
          </SelectTrigger>
          <SelectContent>
            {country &&
              state &&
              getCities(country, state).map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {error?.city && <p className="text-sm text-red-500 mt-1">{error.city}</p>}
      </div>
    </div>
  )
}

