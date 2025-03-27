"use client"

import * as React from "react"
import { useState, Suspense } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Check, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { NumberCounter } from "./number-counter"
//import { Input } from "@/components/ui/input"
import LocationAutocomplete from "@/components/ui/location-autocomplete"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import styles from "./MedicalSearch.module.css"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

interface Procedure {
  name: string
  icon: string
}

const procedures: Procedure[] = [
  { name: "Cirugía plástica", icon: "/assets/icons/00.svg" },
  { name: "Cirugía bariátrica", icon: "/assets/icons/01.svg" },
  { name: "Implante capilar", icon: "/assets/icons/02.svg" },
  { name: "Salud mental", icon: "/assets/icons/03.svg" },
  { name: "Rehabilitación", icon: "/assets/icons/04.svg" },
  { name: "Otro", icon: "/assets/icons/05.svg" },
]

interface SearchParamsHandlerProps {
  setSelectedProcedures: React.Dispatch<React.SetStateAction<string[]>>
  setLocation: React.Dispatch<React.SetStateAction<string>>
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  setTravelers: React.Dispatch<React.SetStateAction<number>>
}

function SearchParamsHandler({ setSelectedProcedures, setLocation, setDate, setTravelers }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const proceduresParam = searchParams.get("procedures")
    const locationParam = searchParams.get("location")
    const checkInParam = searchParams.get("checkIn")
    const checkOutParam = searchParams.get("checkOut")
    const travelersParam = searchParams.get("travelers")

    if (proceduresParam) {
      setSelectedProcedures(proceduresParam.split(","))
    }

    if (locationParam) {
      setLocation(locationParam)
    }

    if (checkInParam) {
      const fromDate = parseISO(checkInParam)
      setDate((prev) => ({ ...prev, from: fromDate }))
    }

    if (checkOutParam) {
      const toDate = parseISO(checkOutParam)
      setDate((prev) => ({
        from: prev?.from ?? undefined,
        to: toDate,
      }))
    }

    if (travelersParam) {
      const travelersCount = Number.parseInt(travelersParam, 10)
      if (!isNaN(travelersCount) && travelersCount > 0) {
        setTravelers(travelersCount)
      }
    }
  }, [searchParams, setDate, setLocation, setSelectedProcedures, setTravelers])

  return null
}

export function SearchBar() {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const [travelers, setTravelers] = React.useState(1)
  const [location, setLocation] = React.useState("")

  const toggleProcedure = (procedureName: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procedureName) ? prev.filter((name) => name !== procedureName) : [...prev, procedureName],
    )
  }

  //const resetLocation = () => setLocation("")
  const resetDates = () => setDate(undefined)
  const resetTravelers = () => setTravelers(1)

  const router = useRouter()

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (selectedProcedures.length > 0) {
      searchParams.append("procedures", selectedProcedures.join(","))
    }
    if (location) {
      searchParams.append("location", location)
    }
    if (date?.from) {
      searchParams.append("checkIn", date.from.toISOString().split("T")[0])
    }
    if (date?.to) {
      searchParams.append("checkOut", date.to.toISOString().split("T")[0])
    }
    if (travelers > 1) {
      searchParams.append("travelers", travelers.toString())
    }

    const searchUrl = `/rooms?${searchParams.toString()}`
    router.push(searchUrl)
  }

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler
          setSelectedProcedures={setSelectedProcedures}
          setLocation={setLocation}
          setDate={setDate}
          setTravelers={setTravelers}
        />
      </Suspense>
      <div
        className={`${styles.Content} hidden relative z-100 lg:mt-[-50px] lg:block w-full max-w-[820px] mx-auto bg-[#1B2B3A] rounded-3xl`}
      >
        <div className="px-8 bg-[#1B2B3A] rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h2 className="text-white leading-[1.2rem] font-medium text-sm whitespace-nowrap">
              Motivo médico <br />
              de tu viaje
            </h2>
            <div className="grid grid-cols-6 md:grid-cols-6 gap-10 flex-1">
              {procedures.map((procedure) => (
                <Button
                  key={procedure.name}
                  variant="ghost"
                  className={`flex flex-col items-center space-y-0 h-auto py-4 bg-transparent hover:bg-transparent ${
                    selectedProcedures.includes(procedure.name)
                      ? "text-white hover:text-white"
                      : "text-white hover:text-white"
                  }`}
                  onClick={() => toggleProcedure(procedure.name)}
                >
                  <div className="relative">
                    <Image
                      src={procedure.icon || "/placeholder.svg"}
                      alt={procedure.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    {selectedProcedures.includes(procedure.name) && (
                      <div className="absolute top-2 -right-6 bg-[#69C6FB] rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-light">{procedure.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 gap-1 p-2 bg-white rounded-2xl shadow-lg border">
          {/* Lugar */}
          <div className="relative flex-1">
            <div className="py-1">
              <div className="text-sm font-semibold mb-1">Lugar</div>
              <LocationAutocomplete
                value={location}
                onChange={(newLocation) => {
                  setLocation(newLocation)
                }}
              />
              {/*<div className="relative">
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dónde deseas recuperarte?"
                  className="border-0 p-0 h-6 text-sm focus-visible:ring-0 placeholder:text-muted-foreground pr-6"
                />
                {location && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                    onClick={resetLocation}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}


                </div>*/}
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Check-in/Check-out */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex-1 flex cursor-pointer rounded-full hover:bg-gray-100 px-6 py-3 relative">
                <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                  <div>
                    <div className="text-sm font-semibold">Llegada</div>
                    <div className="text-sm text-muted-foreground">
                      {date?.from ? format(date.from, "d MMM.", { locale: es }) : "Agregar fecha"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Salida</div>
                    <div className="text-sm text-muted-foreground">
                      {date?.to ? format(date.to, "d MMM.", { locale: es }) : "Agregar fecha"}
                    </div>
                  </div>
                </div>
                {date && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                    onClick={resetDates}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Viajeros */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <div className="cursor-pointer rounded-full hover:bg-gray-100 px-6 py-3">
                  <div className="text-sm font-semibold">Quién</div>
                  <div className="text-sm text-muted-foreground">
                    {travelers} {travelers === 1 ? "paciente" : "pacientes"}
                  </div>
                  {travelers > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                      onClick={resetTravelers}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Pacientes</div>
                  <div className="text-sm text-muted-foreground">Cantidad de personas</div>
                </div>
                <NumberCounter value={travelers} onChange={setTravelers} min={1} max={16} />
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            size="icon"
            className="rounded-full w-12 h-12 bg-[#1B2B3A] hover:bg-[#1B2B3A]/90"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </>
  )
}

