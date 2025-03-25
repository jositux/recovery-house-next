"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay, addMonths, isWithinInterval, addDays, isBefore, startOfDay, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, Save, CheckCircle } from "lucide-react"
//import { toast } from "@/components/ui/use-toast"
import styles from "./calendar.module.css"
import { serviceRoomEnabled } from "@/services/serviceRoomEnabled"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Tipos para los estados de los días
type DayStatus = "available" | "unavailable" | "booked"

interface CalendarDay {
  date: Date
  status: DayStatus
}

interface CalendarViewProps {
  roomId: string
}

// Función para analizar una fecha en formato "2025-3-25"
function parseCustomDateFormat(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map((num) => Number.parseInt(num, 10))
  // Remember that months are 0-indexed in JavaScript Date objects
  return new Date(year, month - 1, day)
}

// Componente memoizado para el día del calendario con actualización verdaderamente instantánea
const CalendarDayComponent = memo(
  ({
    day,
    status,
    isInSelection,
    isPast,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  }: {
    day: Date
    status: DayStatus
    isInSelection: boolean
    isPast: boolean
    onMouseDown: () => void
    onMouseEnter: () => void
    onMouseUp: () => void
  }) => {
    const isSelectable = !isPast && status !== "booked"
    const dayRef = useRef<HTMLDivElement>(null)
    // Estado local para cambio visual instantáneo
    const [visualStatus, setVisualStatus] = useState(status)

    // Actualizar el estado visual cuando cambia el status real
    useEffect(() => {
      setVisualStatus(status)
    }, [status])

    // Función para aplicar cambio visual verdaderamente instantáneo
    const handleMouseDown = () => {
      if (!isSelectable) return

      // Cambiar el estado visual inmediatamente
      if (visualStatus === "available") {
        setVisualStatus("unavailable")
      } else {
        setVisualStatus("available")
      }

      // Llamar al manejador original
      onMouseDown()
    }

    return (
      <div
        ref={dayRef}
        className={cn(`w-full h-full flex items-center justify-center relative ${styles.numerito} cursor-pointer`, {
          "bg-white text-gray-300 cursor-not-allowed": isPast,
          "bg-white": visualStatus === "available" && !isInSelection && !isPast,
          "hover:bg-gray-50": visualStatus === "available" && !isInSelection && !isPast,
          "bg-pink-50": visualStatus === "unavailable" && !isInSelection && !isPast,
          "hover:bg-pink-100": visualStatus === "unavailable" && !isInSelection && !isPast,
          "bg-gray-200 cursor-not-allowed": status === "booked" && !isPast,
          "bg-red-500 text-white": isInSelection,
          "cursor-not-allowed": !isSelectable,
        })}
        onMouseDown={handleMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        style={{
          transition: "none", // Eliminar cualquier transición para cambio instantáneo
        }}
      >
        <span
          className={cn("text-sm", {
            "text-red-600": visualStatus === "unavailable" && !isPast && !isInSelection,
            "text-green-600": visualStatus === "available" && !isPast && !isInSelection,
          })}
        >
          {format(day, "d")}
        </span>

        {/* Punto rojo para días no disponibles */}
        {visualStatus === "unavailable" && !isPast && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <span className="bg-red-600 h-1 w-1 rounded-full"></span>
          </div>
        )}

        {/* Punto gris para días reservados */}
        {status === "booked" && !isPast && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <span className="bg-gray-500 h-1 w-1 rounded-full"></span>
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Optimización de rendimiento: solo re-renderizar si cambian estas propiedades
    return (
      isSameDay(prevProps.day, nextProps.day) &&
      prevProps.status === nextProps.status &&
      prevProps.isInSelection === nextProps.isInSelection &&
      prevProps.isPast === nextProps.isPast
    )
  },
)

CalendarDayComponent.displayName = "CalendarDayComponent"

// Componente memoizado para el encabezado del mes
const CustomMonthHeader = memo(({ month }: { month: Date }) => {
  return <div className="flex justify-center py-2 font-medium">{format(month, "MMMM yyyy", { locale: es })}</div>
})

CustomMonthHeader.displayName = "CustomMonthHeader"

// Componente memoizado para el calendario de un mes
const MonthCalendar = memo(
  ({
    month,
    renderDay,
  }: {
    month: Date
    renderDay: (date: Date) => React.ReactElement | null
  }) => {
    return (
      <div className="border overflow-hidden rounded-sm">
        <CustomMonthHeader month={month} />
        <Calendar
          mode="multiple"
          selected={[]}
          onSelect={() => {}}
          disabled={() => false}
          locale={es}
          className="p-0"
          month={month}
          numberOfMonths={1}
          showOutsideDays={true}
          fixedWeeks={true}
          components={{
            Day: (props) => {
              // Verificar si el día pertenece al mes actual
              const isCurrentMonth = isSameMonth(props.date, month)

              // Si no es del mes actual, renderizar un div vacío con la misma estructura
              if (!isCurrentMonth) {
                return <div className={`w-full h-full ${styles.invisible}`}></div>
              }

              // Asegurarnos de que renderDay devuelve un ReactElement
              return renderDay(props.date)
            },
            Caption: () => null,
          }}
        />
      </div>
    )
  },
)

MonthCalendar.displayName = "MonthCalendar"

// Crear un mapa para acceso rápido a los días
type DayMap = Map<string, { index: number; status: DayStatus }>

export default function CalendarView({ roomId = "1" }: CalendarViewProps) {
  const router = useRouter()

  // Estado para almacenar el estado de cada día
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // Mapa para acceso rápido a los días (optimización)
  const dayMapRef = useRef<DayMap>(new Map())

  // Estado para el rango de fechas que se está seleccionando actualmente
  const [currentSelection, setCurrentSelection] = useState<Date[]>([])

  // Estado para controlar si estamos en modo de selección
  const [isSelecting, setIsSelecting] = useState(false)

  // Estado para controlar si está cargando
  const [isLoading, setIsLoading] = useState(false)

  // Estado para controlar la visibilidad del modal de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Fechas para mostrar en el calendario (hoy + 12 meses)
  const today = useMemo(() => startOfDay(new Date()), [])
  const oneYearLater = useMemo(() => addMonths(today, 12), [today])

  // Inicializar el calendario con datos de ejemplo
  useEffect(() => {
    // Generar días para un año completo
    const days: CalendarDay[] = []
    const dayMap: DayMap = new Map()
    let currentDate = new Date(today)

    // Crear algunos días reservados de ejemplo
    const bookedDays = [
      {
        start: parseCustomDateFormat("2025-3-25"),
        end: parseCustomDateFormat("2025-3-28"),
      },
      {
        start: parseCustomDateFormat("2025-4-5"),
        end: parseCustomDateFormat("2025-4-8"),
      },
      // Other booked days...
    ]

    // Generar todos los días hasta un año después
    let index = 0
    while (isBefore(currentDate, oneYearLater)) {
      // Verificar si el día está en alguno de los rangos reservados
      const isBooked = bookedDays.some((range) => isWithinInterval(currentDate, { start: range.start, end: range.end }))
      const status = isBooked ? "booked" : "available"

      days.push({
        date: new Date(currentDate),
        status,
      })

      // Agregar al mapa para acceso rápido
      const dateKey = format(currentDate, "yyyy-MM-dd")
      dayMap.set(dateKey, { index, status })

      currentDate = addDays(currentDate, 1)
      index++
    }

    setCalendarDays(days)
    dayMapRef.current = dayMap
  }, [today, oneYearLater])

  // Función para verificar si un día está reservado - optimizada con mapa
  const isDayBooked = useCallback((date: Date): boolean => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayInfo = dayMapRef.current.get(dateKey)
    return dayInfo ? dayInfo.status === "booked" : false
  }, [])

  // Función para verificar si un día está en el pasado
  const isPastDay = useCallback(
    (date: Date): boolean => {
      return isBefore(date, today)
    },
    [today],
  )

  // Función para verificar si un día está en la selección actual
  const isDayInSelection = useCallback(
    (date: Date): boolean => {
      return currentSelection.some((day) => isSameDay(day, date))
    },
    [currentSelection],
  )

  // Función para obtener el estado de un día - optimizada con mapa
  const getDayStatus = useCallback((date: Date): DayStatus => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayInfo = dayMapRef.current.get(dateKey)
    return dayInfo ? dayInfo.status : "available"
  }, [])

  // Función para alternar el estado de un día específico - optimizada
  const toggleDayStatus = useCallback(
    (date: Date) => {
      if (isDayBooked(date) || isPastDay(date)) return

      const dateKey = format(date, "yyyy-MM-dd")
      const dayInfo = dayMapRef.current.get(dateKey)

      if (dayInfo) {
        // Actualizar el estado en el mapa
        const newStatus = dayInfo.status === "available" ? "unavailable" : "available"
        dayMapRef.current.set(dateKey, { ...dayInfo, status: newStatus })

        // Actualizar el estado en el array
        setCalendarDays((prevDays) => {
          const newDays = [...prevDays]
          newDays[dayInfo.index] = { ...newDays[dayInfo.index], status: newStatus }
          return newDays
        })
      }
    },
    [isDayBooked, isPastDay],
  )

  // Función para manejar el inicio de la selección
  const handleDayMouseDown = useCallback(
    (day: Date) => {
      // No permitir seleccionar días reservados o días pasados
      if (isDayBooked(day) || isPastDay(day)) return

      // Alternar el estado del día al hacer clic
      toggleDayStatus(day)

      // Iniciar selección para arrastre
      setIsSelecting(true)
      setCurrentSelection([day])
    },
    [isDayBooked, isPastDay, toggleDayStatus],
  )

  // Función para manejar el movimiento durante la selección
  const handleDayMouseEnter = useCallback(
    (day: Date) => {
      // Solo procesar si estamos en modo de selección
      if (!isSelecting || isDayBooked(day) || isPastDay(day)) return

      if (currentSelection.length > 0) {
        const startDate = currentSelection[0]

        // Optimización: Crear el rango de fechas de manera más eficiente
        const startTime = startDate.getTime()
        const currentTime = day.getTime()
        const isForward = startTime <= currentTime

        let current = new Date(startDate)
        const dates = [new Date(current)]

        // Crear el rango en la dirección correcta
        while (!isSameDay(current, day)) {
          current = addDays(current, isForward ? 1 : -1)
          dates.push(new Date(current))
        }

        // Filtrar días reservados y días pasados del rango
        const validDates = dates.filter((date) => !isDayBooked(date) && !isPastDay(date))

        // Actualizar la selección actual
        setCurrentSelection(validDates)
      }
    },
    [isSelecting, currentSelection, isDayBooked, isPastDay],
  )

  // Función para finalizar la selección
  const handleDayMouseUp = useCallback(() => {
    if (!isSelecting) return

    // Aplicar el cambio de estado a los días seleccionados (excepto el primero que ya se cambió)
    if (currentSelection.length > 1) {
      // Obtener el estado del primer día seleccionado para aplicar el mismo a todos
      const firstDayKey = format(currentSelection[0], "yyyy-MM-dd")
      const firstDayInfo = dayMapRef.current.get(firstDayKey)
      const targetStatus = firstDayInfo?.status || "unavailable"

      // Actualizar el estado de los días seleccionados
      setCalendarDays((prevDays) => {
        const newDays = [...prevDays]

        // Actualizar solo los días restantes (el primero ya se actualizó)
        for (let i = 1; i < currentSelection.length; i++) {
          const dateKey = format(currentSelection[i], "yyyy-MM-dd")
          const dayInfo = dayMapRef.current.get(dateKey)

          if (dayInfo && dayInfo.status !== "booked" && !isPastDay(currentSelection[i])) {
            // Actualizar el estado en el mapa
            dayMapRef.current.set(dateKey, { ...dayInfo, status: targetStatus })

            // Actualizar el estado en el array
            newDays[dayInfo.index] = { ...newDays[dayInfo.index], status: targetStatus }
          }
        }

        return newDays
      })

      // Mostrar notificación solo si se seleccionaron múltiples días
     /* toast({
        title: `Días actualizados`,
        description: `Se han actualizado ${currentSelection.length} días en el calendario.`,
      })*/
    }

    // Limpiar la selección
    setIsSelecting(false)
    setCurrentSelection([])
  }, [isSelecting, currentSelection, isPastDay])

  // Función para manejar la acción de "Salir"
  const handleExit = useCallback(() => {
    // Cerrar el diálogo
    setShowConfirmDialog(false)

    // Redirigir a la página principal o a donde sea necesario
    router.push("/rooms")
  }, [router])

  // Modificar la función handleSaveChanges para enviar los datos al endpoint
  const handleSaveChanges = useCallback(async () => {
    // Recopilar todas las fechas marcadas como no disponibles
    const unavailableDates = calendarDays
      .filter((day) => day.status === "unavailable")
      .map((day) => format(day.date, "yyyy-MM-dd"))

    // Mostrar el array de fechas no disponibles en la consola
    console.log("Fechas no disponibles:", unavailableDates)

    try {
      setIsLoading(true)

      // Llamar al servicio para actualizar la disponibilidad
      await serviceRoomEnabled.updateRoomAvailability(roomId, unavailableDates)

      // Mostrar notificación de éxito
     /* toast({
        title: "Cambios guardados",
        description: `Se han guardado ${unavailableDates.length} fechas como no disponibles.`,
      })*/

      // Mostrar el diálogo de confirmación
      setShowConfirmDialog(true)
    } catch (error) {

      console.log(error)
      // Mostrar notificación de error
     /* toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      })*/
    } finally {
      setIsLoading(false)
    }
  }, [calendarDays, roomId])

  // Renderizar el día personalizado - optimizado con useCallback
  const renderDay = useCallback(
    (date: Date): React.ReactElement => {
      const status = getDayStatus(date)
      const isInSelection = isDayInSelection(date)
      const isPast = isPastDay(date)

      return (
        <CalendarDayComponent
          day={date}
          status={status}
          isInSelection={isInSelection}
          isPast={isPast}
          onMouseDown={() => handleDayMouseDown(date)}
          onMouseEnter={() => handleDayMouseEnter(date)}
          onMouseUp={handleDayMouseUp} // Corregido: no pasamos ningún argumento
        />
      )
    },
    [getDayStatus, isDayInSelection, isPastDay, handleDayMouseDown, handleDayMouseEnter, handleDayMouseUp],
  )

  // Memoizar los meses para evitar recálculos
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => addMonths(today, i))
  }, [today])

  // Estadísticas de disponibilidad - memoizadas para evitar recálculos
  const stats = useMemo(() => {
    const availableDays = calendarDays.filter((day) => day.status === "available" && !isPastDay(day.date)).length
    const unavailableDays = calendarDays.filter((day) => day.status === "unavailable" && !isPastDay(day.date)).length
    const bookedDays = calendarDays.filter((day) => day.status === "booked" && !isPastDay(day.date)).length

    return { availableDays, unavailableDays, bookedDays }
  }, [calendarDays, isPastDay])

  return (
    <>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <Card className="mx-auto rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Calendario de Disponibilidad
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Visualiza los días disponibles y no disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="ml-auto flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs bg-green-100 text-green-600 border-green-200">
                  Disponible: {stats.availableDays}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1 border-red-200">
                  <span className="bg-red-600 h-1.5 w-1.5 rounded-full"></span>
                  <span>No disponible: {stats.unavailableDays}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1 bg-gray-100 text-gray-800 border-gray-200"
                >
                  <span className="bg-gray-500 h-1.5 w-1.5 rounded-full"></span>
                  <span>Reservado: {stats.bookedDays}</span>
                </Badge>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground mb-2 space-y-1">
              <p>• Haz clic para marcar o desmarcar días como no disponibles</p>
              <p>• Haz clic y arrastra para seleccionar múltiples días</p>
              <p>• Los días en gris ya están reservados y no se pueden modificar</p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 w-fit">
                {months.map((month, i) => (
                  <MonthCalendar key={i} month={month} renderDay={renderDay} />
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveChanges} className="flex items-center gap-2" disabled={isLoading}>
                <Save className="h-4 w-4" />
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Calendario guardado
            </DialogTitle>
            <DialogDescription>
              Los cambios en el calendario de disponibilidad han sido guardados correctamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Seguir editando
            </Button>
            <Button onClick={handleExit}>Salir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

