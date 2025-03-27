"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

import {
  format,
  isSameDay,
  addMonths,
  isWithinInterval,
  addDays,
  isBefore,
  startOfDay,
  isSameMonth,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, Save, CheckCircle } from "lucide-react"
//import { toast } from "@/components/ui/use-toast"
import styles from "./calendar.module.css"
import { serviceRoomDisabled } from "@/services/serviceRoomDisabled"
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
  bookedDays?: {
    start: string
    end: string
  }[]
  unavailableDates?: string[] // Array de fechas no disponibles en formato "YYYY-MM-DD" o "YYYY-M-D"
}

// Función para analizar una fecha en formato "2025-3-25"
function parseCustomDateFormat(dateString: string): Date {
  // Verificar si la fecha ya está en formato ISO (YYYY-MM-DD)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return parseISO(dateString)
  }

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
        className={cn(`w-full h-full flex items-center justify-center relative ${styles.calendarDay} cursor-pointer`, {
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
      <div className="border overflow-hidden rounded-sm w-full">
        <CustomMonthHeader month={month} />
        <Calendar
          mode="multiple"
          selected={[]}
          onSelect={() => {}}
          disabled={() => false}
          locale={es}
          className={`p-0 w-full ${styles.calendarContainer}`}
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

export default function CalendarView({
  roomId = "1",
  bookedDays = [
    {
      start: "2025-3-25",
      end: "2025-3-28",
    },
    {
      start: "2025-4-5",
      end: "2025-4-8",
    },
  ],
  unavailableDates = [],
}: CalendarViewProps) {
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

  const [showFixedHeader, setShowFixedHeader] = useState(false)


  // Fechas para mostrar en el calendario (hoy + 12 meses)
  const today = useMemo(() => startOfDay(new Date()), [])
  const oneYearLater = useMemo(() => addMonths(today, 12), [today])

  // Agregar un estado para controlar si los datos están listos
  const [dataReady, setDataReady] = useState(false)

  // Modificar el useEffect que inicializa los datos del calendario para marcar cuando los datos están listos
  // Buscar el useEffect que contiene "// Inicializar el calendario con datos de ejemplo" y modificarlo así:
  useEffect(() => {
    // Generar días para un año completo
    const days: CalendarDay[] = []
    const dayMap: DayMap = new Map()
    let currentDate = new Date(today)

    // Usar los bookedDays recibidos como prop
    const parsedBookedDays = bookedDays.map((day) => ({
      start: parseCustomDateFormat(day.start),
      end: parseCustomDateFormat(day.end),
    }))

    // Convertir las fechas no disponibles a objetos Date
    const parsedUnavailableDates = unavailableDates.map((dateStr) => parseCustomDateFormat(dateStr))

    // Generar todos los días hasta un año después
    let index = 0
    while (isBefore(currentDate, oneYearLater)) {
      // Verificar si el día está en alguno de los rangos reservados
      const isBooked = parsedBookedDays.some((range) =>
        isWithinInterval(currentDate, { start: range.start, end: range.end }),
      )

      // Verificar si el día está en las fechas no disponibles
      const isUnavailable = parsedUnavailableDates.some((date) => isSameDay(currentDate, date))

      // Determinar el estado del día
      let status: DayStatus = "available"
      if (isBooked) {
        status = "booked"
      } else if (isUnavailable) {
        status = "unavailable"
      }

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

    // Marcar los datos como listos después de un pequeño retraso para asegurar que el DOM se actualice
    setTimeout(() => {
      setDataReady(true)
    }, 50)
  }, [today, oneYearLater, bookedDays, unavailableDates])

  // Agregar un useEffect adicional para forzar una actualización cuando los datos estén listos
  useEffect(() => {
    if (dataReady) {
      // Forzar una actualización del componente
      const forceUpdate = () => {
        setCalendarDays((prev) => [...prev])
      }

      forceUpdate()

      // También podemos forzar una actualización después de que el componente esté montado
      const timer = setTimeout(forceUpdate, 100)
      return () => clearTimeout(timer)
    }
  }, [dataReady])


   // Add scroll event listener to track scroll position
   useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setShowFixedHeader(scrollPosition > 100)
    }

    // Add event listener
    window.addEventListener("scroll", handleScroll)

    // Initial check
    handleScroll()

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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
    router.push("/mis-propiedades")
  }, [router])

  const handleSaveChanges = useCallback(async () => {
    // Recopilar todas las fechas marcadas como no disponibles
    const disabledDates = calendarDays
      .filter((day) => day.status === "unavailable")
      .map((day) => format(day.date, "yyyy-MM-dd"))
  
    console.log("Fechas no disponibles:", disabledDates)
  
    try {
      setIsLoading(true)
  
      // Obtener el access_token del localStorage
      const accessToken = localStorage.getItem("access_token")
  
      if (!accessToken) {
        throw new Error("No se encontró el token de acceso")
      }
  
      // Llamar al servicio para actualizar la disponibilidad con el token
      await serviceRoomDisabled.updateRoomAvailability(roomId, JSON.stringify(disabledDates), accessToken)
  
      // Mostrar notificación de éxito
      /* toast({
        title: "Cambios guardados",
        description: `Se han guardado ${disabledDates.length} fechas como no disponibles.`,
      })*/
  
      setShowConfirmDialog(true)
    } catch (error) {
      console.error("Error al guardar disponibilidad:", error)
  
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

  // Modificar el return para mostrar un indicador de carga mientras los datos no estén listos
  // Justo antes del primer div del return, agregar:
  if (!dataReady) {
    return (
      <div className="container min-h-screen mx-auto py-6 px-4 sm:px-6">
       {/* <Card className="mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Cargando calendario...</p>
            </div>
    </CardContent>
        </Card>*/ }
      </div>
    )
  }


  

    // Add a fixed mobile header component at the top of the component, before the return statement
  // This will be a fixed header for mobile devices

  // Add this function inside the CalendarioDisponibilidad component, before the return statement
  const MobileFixedHeader = () => {
    return (
<div
        className={`fixed top-0 right-0 left-0 z-50 bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between md:hidden ${
          showFixedHeader ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-opacity duration-500 ease-in-out`}
      >        <div className="flex items-center space-x-1">
          <Badge variant="outline" className="text-xs bg-green-100 text-green-600 border-green-200 px-2 py-0.5">
            Disponible: {stats.availableDays}
          </Badge>
          <Badge variant="outline" className="text-xs bg-red-100 text-red-600 border-red-200 px-2 py-0.5">
            No disponible: {stats.unavailableDays}
          </Badge>
        </div>
        <Button
          onClick={handleSaveChanges}
          size="sm"
          className="bg-primary hover:bg-primary/90 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Guardar"}
        </Button>
      </div>
    )
  }

  return (
    <>

<MobileFixedHeader />
      <div className="container min-h-screen mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="mx-auto rounded-xl shadow-lg border-t-4 border-t-[#39759E] max-w-7xl">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-primary">
                  <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  Calendario de Disponibilidad
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Visualiza y gestiona los días disponibles para reservas
                </CardDescription>
              </div>
              <Button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 bg-[#39759E] hover:bg-primary/90 transition-all duration-300"
                disabled={isLoading}
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Guardando..." : "Guardar Calendario"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="space-y-1 text-xs sm:text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  Haz clic para marcar o desmarcar días como no disponibles
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  Haz clic y arrastra para seleccionar múltiples días
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                  Los días en gris ya están reservados y no se pueden modificar
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-green-100 text-green-600 border-green-200 px-3 py-1">
                  Disponible: {stats.availableDays}
                </Badge>
                <Badge variant="outline" className="text-xs bg-red-100 text-red-600 border-red-200 px-3 py-1">
                  No disponible: {stats.unavailableDays}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                  Reservado: {stats.bookedDays}
                </Badge>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 w-full">
                {months.map((month, i) => (
                  <MonthCalendar key={i} month={month} renderDay={renderDay} />
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-8">
            <Button
                onClick={handleExit}
                size="lg"
                className="flex items-center gap-2 bg-black hover:bg-primary/90 transition-all duration-300"
                disabled={isLoading}
              >
               Salir
              </Button>

              <Button
                onClick={handleSaveChanges}
                size="lg"
                className="flex items-center gap-2 bg-[#39759E] hover:bg-primary/90 transition-all duration-300"
                disabled={isLoading}
              >
                <Save className="h-5 w-5" />
                {isLoading ? "Guardando Calendario..." : "Guardar Calendario"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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

