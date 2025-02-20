"use client"

import { useState, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { countriesData, type CountryData, type StateData } from "@/data/countries"

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
  const [countryName, setCountryName] = useState<string>(defaultCountry || "")
  const [stateName, setStateName] = useState<string>(defaultState || "")
  const [city, setCity] = useState<string>(defaultCity || "")

  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const getCountryKeyByName = useCallback((name: string): string => {
    return Object.entries(countriesData).find(([_, country]) => country.name === name)?.[0] || ""
  }, [])

  const getStateKeyByName = useCallback((countryKey: string, stateName: string): string => {
    const country = countriesData[countryKey as keyof typeof countriesData]
    return Object.entries(country.states).find(([_, state]) => state.name === stateName)?.[0] || ""
  }, [])

  useEffect(() => {
    if (countryName) {
      const countryKey = getCountryKeyByName(countryName)
      const selectedCountry = countriesData[countryKey as keyof typeof countriesData]

      if (selectedCountry) {
        setStates(Object.values(selectedCountry.states).map((state) => state.name))
        setStateName((prevState) => prevState || "")
        setCity((prevCity) => prevCity || "")
      }
    }
  }, [countryName, getCountryKeyByName])

  useEffect(() => {
    if (countryName && stateName) {
      const countryKey = getCountryKeyByName(countryName)
      const stateKey = getStateKeyByName(countryKey, stateName)
      const selectedCountry = countriesData[countryKey as keyof typeof countriesData] as CountryData | undefined
      if (selectedCountry) {
        const selectedState = selectedCountry.states[stateKey as keyof (typeof selectedCountry)["states"]] as
          | StateData
          | undefined
        if (selectedState) {
          setCities(selectedState.cities)
          setCity((prevCity) => prevCity || "")
        }
      }
    }
  }, [countryName, stateName, getCountryKeyByName, getStateKeyByName])

  useEffect(() => {
    onChange({ country: countryName, state: stateName, city })
  }, [countryName, stateName, city, onChange])

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="country">País</Label>
        <Select onValueChange={(value) => setCountryName(value)} value={countryName}>
          <SelectTrigger id="country" className={error?.country ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un país" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(countriesData).map((country) => (
              <SelectItem key={country.name} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.country && <p className="text-sm text-red-500 mt-1">{error.country}</p>}
      </div>

      <div>
        <Label htmlFor="state">Estado</Label>
        <Select onValueChange={(value) => setStateName(value)} value={stateName}>
          <SelectTrigger id="state" className={error?.state ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.state && <p className="text-sm text-red-500 mt-1">{error.state}</p>}
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Select onValueChange={(value) => setCity(value)} value={city}>
          <SelectTrigger id="city" className={error?.city ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona una ciudad" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.city && <p className="text-sm text-red-500 mt-1">{error.city}</p>}
      </div>
    </div>
  )
}

