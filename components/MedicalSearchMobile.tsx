"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
//import { Input } from "@/components/ui/input"
import { Search, ChevronDown, Check, X } from "lucide-react"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { NumberInput } from "@/components/number-input"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

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

interface MedicalSearchMobileProps {
  onSearch: () => void
}

let travelers = 1

const MedicalSearchMobile = ({ onSearch }: MedicalSearchMobileProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [patientCount, setPatientCount] = useState(1)

  useEffect(() => {
    // Initialize state from URL parameters
    const proceduresParam = searchParams.get("procedures")
    if (proceduresParam) {
      setSelectedProcedures(proceduresParam.split(","))
    }

    const locationParam = searchParams.get("location")
    if (locationParam) {
      setLocation(locationParam)
    }

    const checkInParam = searchParams.get("checkIn")
    if (checkInParam) {
      setStartDate(parse(checkInParam, "yyyy-MM-dd", new Date()))
    }

    const checkOutParam = searchParams.get("checkOut")
    if (checkOutParam) {
      setEndDate(parse(checkOutParam, "yyyy-MM-dd", new Date()))
    }

    const travelersParam = searchParams.get("travelers")
    if (travelersParam) {
      travelers = Number.parseInt(travelersParam, 10)
      setPatientCount(travelers > 0 ? travelers : 1)
      console.log(travelers, patientCount)
    }
  }, [searchParams])

  const toggleProcedure = (procedureName: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procedureName) ? prev.filter((name) => name !== procedureName) : [...prev, procedureName],
    )
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (selectedProcedures.length > 0) {
      params.append("procedures", selectedProcedures.join(","))
    }

    if (location) {
      params.append("location", location)
    }

    if (startDate) {
      params.append("checkIn", format(startDate, "yyyy-MM-dd"))
    }

    if (endDate) {
      params.append("checkOut", format(endDate, "yyyy-MM-dd"))
    }

    params.append("travelers", patientCount.toString())

    router.push(`/rooms?${params.toString()}`)
    onSearch()
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "d MMM", { locale: es })
  }

  const resetStartDate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStartDate(undefined)
  }

  const resetEndDate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEndDate(undefined)
  }

  return (
    <div className="md:hidden w-full max-w-[850px] mx-auto p-4 space-y-3 bg-[#39759E] rounded-b-xl">
      <div className="w-full">
        <label className="block text-sm mb-1 text-white">Motivo médico</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-white hover:bg-white">
              <span className="text-[#162F40]">
                {selectedProcedures.length > 0 ? `${selectedProcedures.length} seleccionados` : "Tipo de intervención"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-[#162F40] border-0">
            <div className="grid grid-cols-3 gap-2">
              {procedures.map((procedure) => (
                <Button
                  key={procedure.name}
                  variant="ghost"
                  className={`flex flex-col items-center h-auto py-4 bg-transparent hover:bg-transparent ${
                    selectedProcedures.includes(procedure.name)
                      ? "text-[#EAFFF4] hover:text-[#EAFFF4]"
                      : "text-[#EAFFF4] hover:text-[#EAFFF4]"
                  }`}
                  onClick={() => toggleProcedure(procedure.name)}
                  data-state={selectedProcedures.includes(procedure.name) ? "active" : "inactive"}
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
                  <span className="font-light text-sm mt-2 px-4">{procedure.name}</span>
                </Button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full">
        {/*<label className="block text-sm mb-1 text-white">Lugar</label>
        <Input
          type="text"
          placeholder="¿Dónde deseas recuperarte?"
          className="bg-white text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />*/}

<div className="py-1">
  <label className="block text-sm mb-1 text-white">Lugar</label>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-sm mb-1 text-white">Llegada</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start bg-white hover:bg-white", !startDate && "text-muted-foreground")}
              >
                {startDate ? formatDate(startDate) : "Elegir fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {startDate && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-6 p-4 text-gray hover:text-gray hover:bg-transparent"
              onClick={resetStartDate}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm mb-1 text-white">Salida</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start bg-white hover:bg-white", !endDate && "text-muted-foreground")}
              >
                {endDate ? formatDate(endDate) : "Elegir fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
                disabled={(date) => date <= (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
          {endDate && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-6 p-4 text-gray hover:text-gray hover:bg-transparent"
              onClick={resetEndDate}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="w-full mx-auto flex flex-col items-center text-center mt-2">
        <label className="block text-sm mb-1 text-white">Cantidad de personas</label>
        <div className="rounded-md px-3 py-2">
          <NumberInput
            min={1}
            max={50}
            defaultValue={travelers}
            onChange={(value) => setPatientCount(value)}
            className="text-white"
          />
        </div>
      </div>

      <Button
        className="w-full h-12 mt-4 bg-[#1B2B3A] hover:bg-[#2C3E50] text-white flex items-center justify-center gap-2"
        onClick={handleSearch}
      >
        <Search className="w-5 h-5" />
        Buscar
      </Button>
    </div>
  )
}

export default MedicalSearchMobile

