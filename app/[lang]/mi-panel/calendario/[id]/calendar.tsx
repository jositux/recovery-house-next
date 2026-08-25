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
// Importar ambas locales de date-fns
import { es, enUS, type Locale } from "date-fns/locale" 
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
  propertyId: string
  bookedDays?: {
    start: string
    end: string
  }[]
  unavailableDates?: string[] // Array de fechas no disponibles en formato "YYYY-MM-DD" o "YYYY-M-D"
  lang: string // Recibe el idioma ("es" o "en")
}

// -----------------------------------------------------------
//             SIMULACIÓN DE MÓDULO DE I18N
// -----------------------------------------------------------

const translations = {
    es: {
        pageTitle: "Calendario de Disponibilidad",
        pageDescription: "Visualiza y gestiona los días disponibles para reservas",
        available: "Disponible",
        unavailable: "No disponible",
        booked: "Reservado",
        loadingCalendar: "Cargando calendario...",
        saveButton: "Guardar Calendario",
        savingButton: "Guardando...",
        exitButton: "Salir",
        continueEditingButton: "Seguir editando",
        legendDesc1: "Haz clic para marcar o desmarcar días como no disponibles",
        legendDesc2: "Haz clic y arrastra para seleccionar múltiples días",
        legendDesc3: "Los días en gris ya están reservados y no se pueden modificar",
        dialogTitle: "Calendario guardado",
        dialogDescription: "Los cambios en el calendario de disponibilidad han sido guardados correctamente.",
        errorToken: "No se encontró el token de acceso",
        errorSave: "Error al guardar disponibilidad: No se pudieron guardar los cambios. Inténtalo de nuevo.",
    },
    en: {
        pageTitle: "Availability Calendar",
        pageDescription: "View and manage available days for bookings",
        available: "Available",
        unavailable: "Unavailable",
        booked: "Booked",
        loadingCalendar: "Loading calendar...",
        saveButton: "Save Calendar",
        savingButton: "Saving...",
        exitButton: "Exit",
        continueEditingButton: "Continue editing",
        legendDesc1: "Click to mark or unmark days as unavailable",
        legendDesc2: "Click and drag to select multiple days",
        legendDesc3: "Grey days are already booked and cannot be modified",
        dialogTitle: "Calendar Saved",
        dialogDescription: "The changes to the availability calendar have been saved correctly.",
        errorToken: "Access token not found",
        errorSave: "Error saving availability: Changes could not be saved. Please try again.",
    },
};

const dateFnsLocales: Record<string, Locale> = {
    es: es,
    en: enUS, // Locale de inglés US
};

type TranslationKey = keyof typeof translations.es;
type Translations = Record<TranslationKey, string>;

/**
 * Obtiene los textos traducidos y la Locale de date-fns según el idioma.
 */
function getI18nData(lang: string): { t: Translations; dateFnsLocale: Locale } {
    const currentLang = lang === "en" ? "en" : "es";
    
    // Asigna la locale de date-fns según el idioma recibido
    const pickerLocale = dateFnsLocales[currentLang] || es; 

    return {
        t: translations[currentLang] as Translations,
        dateFnsLocale: pickerLocale,
    };
}
// -----------------------------------------------------------


// Función para analizar una fecha en formato "2025-3-25"
function parseCustomDateFormat(dateString: string): Date {
  // Verificar si la fecha ya está en formato ISO (YYYY-MM-DD)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return parseISO(dateString)
  }

  const [year, month, day] = dateString.split("-").map((num) => Number.parseInt(num, 10))
  // Recuerda que los meses son base 0 en JavaScript Date objects
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
    const [visualStatus, setVisualStatus] = useState(status)

    useEffect(() => {
      setVisualStatus(status)
    }, [status])

    const handleMouseDown = () => {
      if (!isSelectable) return

      if (visualStatus === "available") {
        setVisualStatus("unavailable")
      } else {
        setVisualStatus("available")
      }

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
          transition: "none",
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
    return (
      isSameDay(prevProps.day, nextProps.day) &&
      prevProps.status === nextProps.status &&
      prevProps.isInSelection === nextProps.isInSelection &&
      prevProps.isPast === nextProps.isPast
    )
  },
)

CalendarDayComponent.displayName = "CalendarDayComponent"

// Componente memoizado para el encabezado del mes (AJUSTADO para usar Locale dinámica)
const CustomMonthHeader = memo(({ month, dateFnsLocale }: { month: Date, dateFnsLocale: Locale }) => {
  return <div className="flex justify-center py-2 font-medium">{format(month, "MMMM yyyy", { locale: dateFnsLocale })}</div>
})

CustomMonthHeader.displayName = "CustomMonthHeader"

// Componente memoizado para el calendario de un mes (AJUSTADO para usar Locale dinámica)
const MonthCalendar = memo(
  ({
    month,
    renderDay,
    dateFnsLocale,
  }: {
    month: Date
    renderDay: (date: Date) => React.ReactElement | null
    dateFnsLocale: Locale
  }) => {
    return (
      <div className="border overflow-hidden rounded-sm w-full">
        <CustomMonthHeader month={month} dateFnsLocale={dateFnsLocale} />
        <Calendar
          mode="multiple"
          selected={[]}
          onSelect={() => {}}
          disabled={() => false}
          locale={dateFnsLocale} // Usar la Locale dinámica
          className={`p-0 w-full ${styles.calendarContainer}`}
          month={month}
          numberOfMonths={1}
          showOutsideDays={true}
          fixedWeeks={true}
          components={{
            Day: (props) => {
              const isCurrentMonth = isSameMonth(props.date, month)

              if (!isCurrentMonth) {
                return <div className={`w-full h-full ${styles.invisible}`}></div>
              }

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
  propertyId = "", 
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
  lang, // Destructuración de la prop 'lang'
}: CalendarViewProps) {
  const router = useRouter()

  // --- Lógica de I18N dinámica ---
  const { t, dateFnsLocale } = useMemo(() => getI18nData(lang), [lang])
  // --- FIN Lógica de I18N ---


  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const dayMapRef = useRef<DayMap>(new Map())
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set())
  const dragStartRef = useRef<Date | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showFixedHeader, setShowFixedHeader] = useState(false)
  const today = useMemo(() => startOfDay(new Date()), [])
  const oneYearLater = useMemo(() => addMonths(today, 12), [today])
  const [dataReady, setDataReady] = useState(false)

  // --- useEffect de Inicialización ---
  useEffect(() => {
    const days: CalendarDay[] = []
    const dayMap: DayMap = new Map()
    let currentDate = new Date(today)

    const parsedBookedDays = bookedDays.map((day) => ({
      start: parseCustomDateFormat(day.start),
      end: parseCustomDateFormat(day.end),
    }))

    const parsedUnavailableDates = unavailableDates.map((dateStr) => parseCustomDateFormat(dateStr))

    let index = 0
    while (isBefore(currentDate, oneYearLater)) {
      const isBooked = parsedBookedDays.some((range) =>
        isWithinInterval(currentDate, { start: range.start, end: range.end }),
      )

      const isUnavailable = parsedUnavailableDates.some((date) => isSameDay(currentDate, date))

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

      const dateKey = format(currentDate, "yyyy-MM-dd")
      dayMap.set(dateKey, { index, status })

      currentDate = addDays(currentDate, 1)
      index++
    }

    setCalendarDays(days)
    dayMapRef.current = dayMap

    setTimeout(() => {
      setDataReady(true)
    }, 50)
  }, [today, oneYearLater, bookedDays, unavailableDates])
  
  // --- useEffect para forzar actualización ---
  useEffect(() => {
    if (dataReady) {
      const forceUpdate = () => {
        setCalendarDays((prev) => [...prev])
      }

      forceUpdate()

      const timer = setTimeout(forceUpdate, 100)
      return () => clearTimeout(timer)
    }
  }, [dataReady])

  // --- useEffect para el scroll ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setShowFixedHeader(scrollPosition > 100)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])


  // --- Funciones de manejo y callbacks ---
  const isDayBooked = useCallback((date: Date): boolean => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayInfo = dayMapRef.current.get(dateKey)
    return dayInfo ? dayInfo.status === "booked" : false
  }, [])

  const isPastDay = useCallback(
    (date: Date): boolean => {
      return isBefore(date, today)
    },
    [today],
  )

  const isDayInSelection = useCallback(
    (date: Date): boolean => {
      return currentSelection.has(format(date, "yyyy-MM-dd"))
    },
    [currentSelection],
  )

  const getDayStatus = useCallback((date: Date): DayStatus => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayInfo = dayMapRef.current.get(dateKey)
    return dayInfo ? dayInfo.status : "available"
  }, [])

  const toggleDayStatus = useCallback(
    (date: Date) => {
      if (isDayBooked(date) || isPastDay(date)) return

      const dateKey = format(date, "yyyy-MM-dd")
      const dayInfo = dayMapRef.current.get(dateKey)

      if (dayInfo) {
        const newStatus = dayInfo.status === "available" ? "unavailable" : "available"
        dayMapRef.current.set(dateKey, { ...dayInfo, status: newStatus })

        setCalendarDays((prevDays) => {
          const newDays = [...prevDays]
          newDays[dayInfo.index] = { ...newDays[dayInfo.index], status: newStatus }
          return newDays
        })
      }
    },
    [isDayBooked, isPastDay],
  )

  const handleDayMouseDown = useCallback(
    (day: Date) => {
      if (isDayBooked(day) || isPastDay(day)) return
      toggleDayStatus(day)
      setIsSelecting(true)
      dragStartRef.current = day
      setCurrentSelection(new Set([format(day, "yyyy-MM-dd")]))
    },
    [isDayBooked, isPastDay, toggleDayStatus],
  )

  const handleDayMouseEnter = useCallback(
    (day: Date) => {
      if (!isSelecting || isDayBooked(day) || isPastDay(day)) return

      const startDate = dragStartRef.current
      if (!startDate) return

      const isForward = startDate.getTime() <= day.getTime()

      let current = new Date(startDate)
      const keys = new Set<string>()
      if (!isDayBooked(current) && !isPastDay(current)) keys.add(format(current, "yyyy-MM-dd"))

      while (!isSameDay(current, day)) {
        current = addDays(current, isForward ? 1 : -1)
        if (!isDayBooked(current) && !isPastDay(current)) keys.add(format(current, "yyyy-MM-dd"))
      }

      setCurrentSelection(keys)
    },
    [isSelecting, isDayBooked, isPastDay],
  )

  const handleDayMouseUp = useCallback(() => {
    if (!isSelecting) return

    if (currentSelection.size > 1) {
      const startDate = dragStartRef.current
      const firstDayKey = startDate ? format(startDate, "yyyy-MM-dd") : undefined
      const firstDayInfo = firstDayKey ? dayMapRef.current.get(firstDayKey) : undefined
      const targetStatus = firstDayInfo?.status || "unavailable"

      setCalendarDays((prevDays) => {
        const newDays = [...prevDays]

        currentSelection.forEach((dateKey) => {
          if (dateKey === firstDayKey) return
          const dayInfo = dayMapRef.current.get(dateKey)

          if (dayInfo && dayInfo.status !== "booked") {
            dayMapRef.current.set(dateKey, { ...dayInfo, status: targetStatus })
            newDays[dayInfo.index] = { ...newDays[dayInfo.index], status: targetStatus }
          }
        })

        return newDays
      })
    }

    setIsSelecting(false)
    setCurrentSelection(new Set())
    dragStartRef.current = null
  }, [isSelecting, currentSelection])

  const handleExit = useCallback(() => {
    setShowConfirmDialog(false)
    router.push(`/mi-panel/propiedades/${propertyId}`)
  }, [router, propertyId])

  const handleSaveChanges = useCallback(async () => {
    const disabledDates = calendarDays
      .filter((day) => day.status === "unavailable")
      .map((day) => format(day.date, "yyyy-MM-dd"))

    try {
      setIsLoading(true)
      const accessToken = localStorage.getItem("access_token")

      if (!accessToken) {
        throw new Error(t.errorToken) // Usar traducción
      }

      await serviceRoomDisabled.updateRoomAvailability(roomId, JSON.stringify(disabledDates), accessToken)
      setShowConfirmDialog(true)
    } catch (error) {
      console.error(t.errorSave, error) // Usar traducción
    } finally {
      setIsLoading(false)
    }
  }, [calendarDays, roomId, t])

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
          onMouseUp={handleDayMouseUp}
        />
      )
    },
    [getDayStatus, isDayInSelection, isPastDay, handleDayMouseDown, handleDayMouseEnter, handleDayMouseUp],
  )

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => addMonths(today, i))
  }, [today])

  const stats = useMemo(() => {
    const availableDays = calendarDays.filter((day) => day.status === "available" && !isPastDay(day.date)).length
    const unavailableDays = calendarDays.filter((day) => day.status === "unavailable" && !isPastDay(day.date)).length
    const bookedDays = calendarDays.filter((day) => day.status === "booked" && !isPastDay(day.date)).length

    return { availableDays, unavailableDays, bookedDays }
  }, [calendarDays, isPastDay])
  // --- Fin de funciones de manejo y callbacks ---


  if (!dataReady) {
    return (
      <div className="container min-h-screen mx-auto py-6 px-4 sm:px-6">
        <Card className="mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">{t.loadingCalendar}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const MobileFixedHeader = () => {
    return (
      <div
        className={`fixed top-0 right-0 left-0 z-50 bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between md:hidden ${
          showFixedHeader ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-opacity duration-500 ease-in-out`}
      >
        {" "}
        <div className="flex items-center space-x-1">
          <Badge variant="outline" className="text-xs bg-green-100 text-green-600 border-green-200 px-2 py-0.5">
            {t.available}: {stats.availableDays}
          </Badge>
          <Badge variant="outline" className="text-xs bg-red-100 text-red-600 border-red-200 px-2 py-0.5">
            {t.unavailable}: {stats.unavailableDays}
          </Badge>
        </div>
        <Button
          onClick={handleSaveChanges}
          size="sm"
          className="bg-primary hover:bg-primary/90 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? "..." : t.saveButton.split(" ")[0]}
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
                    {t.pageTitle}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {t.pageDescription}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 bg-[#39759E] hover:bg-primary/90 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? t.savingButton : t.saveButton}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1 text-xs sm:text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    {t.legendDesc1}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                    {t.legendDesc2}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                    {t.legendDesc3}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-600 border-green-200 px-3 py-1">
                    {t.available}: {stats.availableDays}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-red-100 text-red-600 border-red-200 px-3 py-1">
                    {t.unavailable}: {stats.unavailableDays}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                    {t.booked}: {stats.bookedDays}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 w-full">
                  {months.map((month, i) => (
                    // Pasar la locale dinámica a MonthCalendar
                    <MonthCalendar key={i} month={month} renderDay={renderDay} dateFnsLocale={dateFnsLocale} />
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
                  {t.exitButton}
                </Button>

                <Button
                  onClick={handleSaveChanges}
                  size="lg"
                  className="flex items-center gap-2 bg-[#39759E] hover:bg-primary/90 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Save className="h-5 w-5" />
                  {isLoading ? t.savingButton : t.saveButton}
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
              {t.dialogTitle}
            </DialogTitle>
            <DialogDescription>
              {t.dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t.continueEditingButton}
            </Button>
            <Button onClick={handleExit}>{t.exitButton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}