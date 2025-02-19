"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CalendarIcon, Check } from 'lucide-react'
import Image from 'next/image'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { es } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import { NumberInput } from "./number-input-desktop"
import styles from "./MedicalSearch.module.css"


interface Procedure {
  name: string;
  icon: string;
}

const procedures: Procedure[] = [
  { name: "Cirugía plástica", icon: "/assets/icons/00.svg" },
  { name: "Cirugía bariátrica", icon: "/assets/icons/01.svg" },
  { name: "Implante capilar", icon: "/assets/icons/02.svg" },
  { name: "Salud mental", icon: "/assets/icons/03.svg" },
  { name: "Rehabilitación", icon: "/assets/icons/04.svg" },
  { name: "Otro", icon: "/assets/icons/05.svg" },
]

const MedicalSearchDesktop = () => {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [patientCount, setPatientCount] = useState(1)


const generateQueryString = () => {
  const params = new URLSearchParams()

  if (location) params.append("location", location)
  if (selectedProcedures.length > 0) params.append("procedures", selectedProcedures.join(","))
  if (startDate) params.append("startDate", startDate.toISOString())
  if (endDate) params.append("endDate", endDate.toISOString())
  if (patientCount > 1) params.append("patients", patientCount.toString())

  return params.toString()
}


  const toggleProcedure = (procedureName: string) => {
    setSelectedProcedures(prev => 
      prev.includes(procedureName)
        ? prev.filter(name => name !== procedureName)
        : [...prev, procedureName]
    )
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    if (date && (!endDate || endDate <= date)) {
      setEndDate(addDays(date, 1))
    }
  }

  const handleSearch = () => {
    console.log("Datos de búsqueda:", {
      selectedProcedures,
      startDate,
      endDate,
      patientCount
    })

    const queryString = generateQueryString()
    router.push(`/search?${queryString}`)

    //console.log("de aca", queryString)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "d MMM, yyyy", { locale: es })
  }

  return (
    <div className={`${styles.Content} hidden relative z-100 lg:mt-[-50px] lg:block w-full max-w-[850px] mx-auto bg-[#1B2B3A] rounded-3xl`}>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <h2 className="text-white leading-[1.3rem] font-medium text-1xl whitespace-nowrap">
            Escoge el motivo<br /> médico de tu viaje
          </h2>
          <div className="grid grid-cols-6 md:grid-cols-6 gap-6 flex-1">
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

      <div className="bg-white p-4 rounded-3xl flex flex-wrap gap-4">
        <div className="w-full md:w-[calc(22%-0.5rem)]">
          <label className="block text-sm font-medium mb-1">Lugar</label>
          <Input 
            type="text" 
            placeholder="¿Dónde se hospeda?" 
            className="border-0 focus-visible:ring-0 px-0"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[calc(25%-0.5rem)]">
          <label className="block text-sm font-medium mb-1">Llegada</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? formatDate(startDate) : <span>Selecciona fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
                disabled={(date) => date < new Date() || (endDate ? date >= endDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full md:w-[calc(25%-0.5rem)]">
          <label className="block text-sm font-medium mb-1">Salida</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? formatDate(endDate) : <span>Selecciona fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date <= (startDate ? addDays(startDate, 1) : new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full md:w-[calc(25%-0.5rem)] flex items-center">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-1">Pacientes</label>
            <NumberInput
              min={1}
              max={50}
              defaultValue={1}
              onChange={(value) => setPatientCount(value)}
            />
          </div>
          <Button 
            size="sm" 
            className="w-14 h-14 rounded-full bg-[#1B2B3A] hover:bg-[#2C3E50] flex items-center justify-center"
            onClick={handleSearch}
          >
            <Search className="h-14 w-14" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MedicalSearchDesktop