"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { countriesData, CountryData, StateData } from "@/data/countries"

interface LocationSelectorProps {
  onChange: (location: { country: string; state: string; city: string }) => void
  defaultCountry?: string
  defaultState?: string
  defaultCity?: string
  error?: {
    country?: string;
    state?: string;
    city?: string;
  }
}

export function LocationSelector({
  onChange,
  defaultCountry,
  defaultState,
  defaultCity,
  error
}: LocationSelectorProps) {
  const [country, setCountry] = useState<string>(defaultCountry || "")
  const [state, setState] = useState<string>(defaultState || "")
  const [city, setCity] = useState<string>(defaultCity || "")

  const [states, setStates] = useState<Record<string, string>>({})
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    if (country) {
      const selectedCountry = countriesData[country as keyof typeof countriesData]
      if (selectedCountry) {
        setStates(Object.fromEntries(Object.entries(selectedCountry.states).map(([key, value]) => [key, value.name])))
        setState(prevState => prevState || "")
        setCity(prevCity => prevCity || "")
      }
    }
  }, [country, defaultState])

  useEffect(() => {
    if (country && state) {
      const selectedCountry = countriesData[country as keyof typeof countriesData] as CountryData | undefined
      if (selectedCountry) {
        const selectedState = selectedCountry.states[state as keyof typeof selectedCountry['states']] as StateData | undefined
        if (selectedState) {
          setCities(selectedState.cities)
          setCity(prevCity => prevCity || "")
        }
      }
    }
  }, [country, state, defaultCity])

  // Removed useEffect hook
  // useEffect(() => {
  //   if (country && state && city) {
  //     onChange({ country, state, city })
  //   }
  // }, [country, state, city, onChange])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="country">País</Label>
        <Select onValueChange={(value) => { setCountry(value); onChange({ country: value, state, city }); }} value={country}>
          <SelectTrigger id="country" className={error?.country ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un país" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(countriesData).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.country && <p className="text-sm text-red-500 mt-1">{error.country}</p>}
      </div>

      <div>
        <Label htmlFor="state">Estado</Label>
        <Select onValueChange={(value) => { setState(value); onChange({ country, state: value, city }); }} value={state}>
          <SelectTrigger id="state" className={error?.state ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(states).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.state && <p className="text-sm text-red-500 mt-1">{error.state}</p>}
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Select onValueChange={(value) => { setCity(value); onChange({ country, state, city: value }); }} value={city}>
          <SelectTrigger id="city" className={error?.city ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecciona una ciudad" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.city && <p className="text-sm text-red-500 mt-1">{error.city}</p>}
      </div>
    </div>
  )
}

