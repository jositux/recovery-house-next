"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay, addMonths, isWithinInterval, addDays, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Check, X, CalendarIcon, Save } from "lucide-react"
//import { toast } from "@/components/ui/use-toast"
import styles from "./calendar.module.css"

// Tipos para los estados de los días
type DayStatus = "available" | "unavailable" | "booked"

interface CalendarDay {
  date: Date
  status: DayStatus
}

export default function AvailabilityCalendar() {
  // Estado para almacenar el estado de cada día
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // Estado para el modo de selección
  const [selectionMode, setSelectionMode] = useState<"available" | "unavailable">("available")

  // Estado para el rango de fechas que se está seleccionando actualmente
  const [currentSelection, setCurrentSelection] = useState<Date[]>([])

  // Estado para controlar si estamos en modo de selección
  const [isSelecting, setIsSelecting] = useState(false)

  // Fechas para mostrar en el calendario (hoy + 12 meses)
  const today = startOfDay(new Date())
  const oneYearLater = addMonths(today, 12)

  // Inicializar el calendario con datos de ejemplo
  useEffect(() => {
    // Generar días para un año completo
    const days: CalendarDay[] = []
    let currentDate = new Date(today)

    // Crear algunos días reservados de ejemplo
    const bookedDays = [
      { start: addDays(today, 5), end: addDays(today, 7) },
      { start: addDays(today, 15), end: addDays(today, 17) },
      { start: addDays(today, 25), end: addDays(today, 28) },
      { start: addDays(today, 45), end: addDays(today, 48) },
      { start: addDays(today, 90), end: addDays(today, 95) },
      { start: addDays(today, 180), end: addDays(today, 185) },
      { start: addDays(today, 270), end: addDays(today, 275) },
    ]

    // Generar todos los días hasta un año después
    while (isBefore(currentDate, oneYearLater)) {
      // Verificar si el día está en alguno de los rangos reservados
      const isBooked = bookedDays.some((range) => isWithinInterval(currentDate, { start: range.start, end: range.end }))

      days.push({
        date: new Date(currentDate),
        status: isBooked ? "booked" : "available",
      })

      currentDate = addDays(currentDate, 1)
    }

    setCalendarDays(days)
  }, [])

  // Función para manejar el inicio de la selección
  const handleDayMouseDown = (day: Date) => {
    // No permitir seleccionar días reservados o días pasados
    if (isDayBooked(day) || isPastDay(day)) return

    setIsSelecting(true)
    setCurrentSelection([day])
  }

  // Función para manejar el movimiento durante la selección
  const handleDayMouseEnter = (day: Date) => {
    // Solo procesar si estamos en modo de selección
    if (!isSelecting || isDayBooked(day) || isPastDay(day)) return

    if (currentSelection.length > 0) {
      // Ordenar las fechas para asegurar que el rango sea correcto
      const startDate = currentSelection[0]
      const dates = []

      // Crear un rango de fechas desde la fecha inicial hasta la actual
      let currentDate = new Date(startDate)
      while (!isSameDay(currentDate, day)) {
        dates.push(new Date(currentDate))
        currentDate = addDays(currentDate, startDate < day ? 1 : -1)
      }
      dates.push(day)

      // Ordenar las fechas
      dates.sort((a, b) => a.getTime() - b.getTime())

      // Filtrar días reservados y días pasados del rango
      const validDates = dates.filter((date) => !isDayBooked(date) && !isPastDay(date))

      setCurrentSelection(validDates)
    }
  }

  // Función para finalizar la selección
  const handleDayMouseUp = () => {
    if (!isSelecting) return

    // Aplicar el cambio de estado a los días seleccionados
    setCalendarDays((prevDays) =>
      prevDays.map((day) => {
        // Si el día está en la selección actual, cambiar su estado
        if (
          currentSelection.some((date) => isSameDay(date, day.date)) &&
          day.status !== "booked" &&
          !isPastDay(day.date)
        ) {
          return { ...day, status: selectionMode }
        }
        return day
      }),
    )

    // Limpiar la selección
    setIsSelecting(false)
    setCurrentSelection([])

    // Mostrar notificación
    /*toast({
      title: `Días marcados como ${selectionMode === "available" ? "disponibles" : "no disponibles"}`,
      description: `Se han actualizado ${currentSelection.length} días en el calendario.`,
    })*/
  }

  // Función para verificar si un día está reservado
  const isDayBooked = (date: Date): boolean => {
    return calendarDays.some((day) => isSameDay(day.date, date) && day.status === "booked")
  }

  // Función para verificar si un día está en el pasado
  const isPastDay = (date: Date): boolean => {
    return isBefore(date, today)
  }

  // Función para verificar si un día está en la selección actual
  const isDayInSelection = (date: Date): boolean => {
    return currentSelection.some((day) => isSameDay(day, date))
  }

  // Función para obtener el estado de un día
  const getDayStatus = (date: Date): DayStatus => {
    const day = calendarDays.find((d) => isSameDay(d.date, date))
    return day ? day.status : "available"
  }

  // Función para guardar los cambios
  const handleSaveChanges = () => {
    // Aquí se implementaría la lógica para guardar en la base de datos
    /*toast({
      title: "Cambios guardados",
      description: "La disponibilidad ha sido actualizada correctamente.",
    })*/
  }

  // Renderizar el día personalizado
  const renderDay = (day: Date) => {
    const status = getDayStatus(day)
    const isInSelection = isDayInSelection(day)
    const isPast = isPastDay(day)

    return (
      <div
        className={cn(`w-full h-full flex items-center justify-center relative ${styles.numerito}`, {
          "bg-white text-gray-300 cursor-not-allowed": isPast,
          "bg-green-100": status === "available" && !isInSelection && !isPast,
          "hover:bg-green-200": status === "available" && !isInSelection && !isPast && selectionMode === "available",
          "hover:bg-pink-200": status === "available" && !isInSelection && !isPast && selectionMode === "unavailable",
          "bg-red-100": status === "unavailable" && !isInSelection && !isPast,
          "bg-gray-200 cursor-not-allowed": status === "booked" && !isPast,
          "bg-blue-500 text-white": isInSelection && selectionMode === "available",
          "bg-red-500 text-white": isInSelection && selectionMode === "unavailable",
        })}
        onMouseDown={() => handleDayMouseDown(day)}
        onMouseEnter={() => handleDayMouseEnter(day)}
        onMouseUp={handleDayMouseUp}
      >
        <span className="text-sm">{format(day, "d")}</span>
        {status === "booked" && !isPast && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <span className="bg-gray-500 h-1 w-1 rounded-full"></span>
          </div>
        )}
      </div>
    )
  }

  // Componente personalizado para el encabezado del mes
  const CustomMonthHeader = ({ month }: { month: Date }) => {
    return <div className="flex justify-center py-2 font-medium">{format(month, "MMMM yyyy", { locale: es })}</div>
  }

  // Estadísticas de disponibilidad
  const availableDays = calendarDays.filter((day) => day.status === "available" && !isPastDay(day.date)).length
  const unavailableDays = calendarDays.filter((day) => day.status === "unavailable" && !isPastDay(day.date)).length
  const bookedDays = calendarDays.filter((day) => day.status === "booked" && !isPastDay(day.date)).length

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <Card className="mx-auto rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Calendario de Disponibilidad
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Selecciona los días disponibles y no disponibles para tu alojamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button
              variant={selectionMode === "available" ? "default" : "outline"}
              onClick={() => setSelectionMode("available")}
              className="flex items-center gap-1 text-xs sm:text-sm py-1 h-8 sm:h-9"
              size="sm"
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:block">Marcar como Disponible</span>
            </Button>
            <Button
              variant={selectionMode === "unavailable" ? "destructive" : "outline"}
              onClick={() => setSelectionMode("unavailable")}
              className="flex items-center gap-1 text-xs sm:text-sm py-1 h-8 sm:h-9"
              size="sm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:block">Marcar como No Disponible</span>
            </Button>

            <div className="ml-auto flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                Disponible: {availableDays}
              </Badge>
              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                No disponible: {unavailableDays}
              </Badge>
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                Reservado: {bookedDays}
              </Badge>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground mb-2 space-y-1">
            <p>• Haz clic y arrastra para seleccionar múltiples días</p>
            <p>• Los días en gris ya están reservados y no se pueden modificar</p>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 w-fit">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="border overflow-hidden rounded-sm">
                  <CustomMonthHeader month={addMonths(today, i)} />
                  <Calendar
                    mode="multiple"
                    selected={[]}
                    onSelect={() => {}}
                    //disabled={(date) => false} // No usar el disabled nativo, lo manejamos con nuestro estilo
                    locale={es}
                    className="p-0"
                    month={addMonths(today, i)}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    fixedWeeks={true}
                    components={{
                      Day: ({ date }) => renderDay(date),
                      Caption: () => null, // Eliminar el subtítulo y las flechas
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveChanges} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

