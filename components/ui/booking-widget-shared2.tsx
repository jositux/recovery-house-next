"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Minus, Plus, Bed, BedDouble, X } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface BookingCompartidaProps {
  singleBedPrice: number
  singleBedCleaningPrice: number
  doubleBedPrice: number
  doubleBedCleaningPrice: number
  bookings: Booking[]
  availableSingleBeds: number
  availableDoubleBeds: number
  onReservation?: (bookingData: BookingData) => void
}

interface Booking {
  id: string
  status: string
  checkIn: string
  checkOut: string
  patient: string
  guests: number
  price: number
  cleaning: number
  room: string
  singleBeds: number
  doubleBeds: number
}

interface BookingData {
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  singleBeds: number
  doubleBeds: number
  singleBedPrice: number
  doubleBedPrice: number
  singleBedCleaningPrice: number
  doubleBedCleaningPrice: number
  totalPrice: number
}

export default function BookingCompartidaAirbnb({
  singleBedPrice,
  singleBedCleaningPrice,
  doubleBedPrice,
  doubleBedCleaningPrice,
  bookings: initialBookings,
  availableSingleBeds,
  availableDoubleBeds,
  onReservation,
}: BookingCompartidaProps) {
  const searchParams = useSearchParams()

  // Inicializar estados con valores de URL si existen
  const [checkIn, setCheckIn] = useState<Date | undefined>(() => {
    const v = searchParams.get("checkIn")
    return v ? parseISO(v) : undefined
  })

  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    const v = searchParams.get("checkOut")
    return v ? parseISO(v) : undefined
  })

  const [singleBeds, setSingleBeds] = useState(0)
  const [doubleBeds, setDoubleBeds] = useState(0)
  const [nights, setNights] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  const bookings = initialBookings || []

  // Fecha actual para validaciones
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Calcular noches cuando cambian las fechas
  useEffect(() => {
    if (checkIn && checkOut) {
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
      setNights(days > 0 ? days : 0)
    } else setNights(0)
  }, [checkIn, checkOut])

  // Reset bed selection when dates change
  useEffect(() => {
    setSingleBeds(0)
    setDoubleBeds(0)
  }, [checkIn, checkOut])

  // Calcular precio total
  useEffect(() => {
    const singleNight = singleBedPrice * singleBeds * nights
    const doubleNight = doubleBedPrice * doubleBeds * nights
    const singleClean = singleBedCleaningPrice * singleBeds
    const doubleClean = doubleBedCleaningPrice * doubleBeds
    setTotalPrice(singleNight + doubleNight + singleClean + doubleClean)
  }, [singleBeds, doubleBeds, nights, singleBedPrice, doubleBedPrice, singleBedCleaningPrice, doubleBedCleaningPrice])

  // Calculate available beds within selected date range
  const getAvailableBedsInRange = useMemo(() => {
    if (!checkIn || !checkOut) return { singleBeds: 0, doubleBeds: 0 }

    const selectedStart = checkIn
    const selectedEnd = checkOut

    let occupiedSingleBeds = 0
    let occupiedDoubleBeds = 0

    bookings.forEach((booking) => {
      const bookingStart = parseISO(booking.checkIn)
      const bookingEnd = parseISO(booking.checkOut)

      // Check if booking overlaps with selected date range
      const hasOverlap = bookingStart < selectedEnd && bookingEnd > selectedStart

      if (hasOverlap) {
        occupiedSingleBeds += booking.singleBeds || 0
        occupiedDoubleBeds += booking.doubleBeds || 0
      }
    })

    return {
      singleBeds: Math.max(0, availableSingleBeds - occupiedSingleBeds),
      doubleBeds: Math.max(0, availableDoubleBeds - occupiedDoubleBeds),
    }
  }, [checkIn, checkOut, bookings, availableSingleBeds, availableDoubleBeds])

  // Manejadores para cambiar cantidad de camas
  const handleSingleBedsChange = (inc: number) =>
    setSingleBeds((prev) => Math.max(0, Math.min(prev + inc, getAvailableBedsInRange.singleBeds)))

  const handleDoubleBedsChange = (inc: number) =>
    setDoubleBeds((prev) => Math.max(0, Math.min(prev + inc, getAvailableBedsInRange.doubleBeds)))

  // Manejar selección de fecha de entrada
  const handleCheckInSelect = (d: Date | undefined) => {
    setCheckIn(d)
    if (checkOut && d && d >= checkOut) setCheckOut(undefined)
  }

  // Verificar si la reserva está habilitada
  const isReservationEnabled = !!checkIn && !!checkOut && nights > 0 && (singleBeds > 0 || doubleBeds > 0)

  // Manejar la reserva
  const handleReservation = async () => {
    setLoading(true)
    try {
      /*const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

     const user = await fetchCurrentUser(token)
      if (!user.first_name || !user.last_name) {
        router.push("/perfil")
        return
      }*/

      // const patient_id = user.id
      /*const singleTotal =
        singleBeds * (singleBedPrice * nights + singleBedCleaningPrice);
      const doubleTotal =
        doubleBeds * (doubleBedPrice * nights + doubleBedCleaningPrice);*/

      const bookingData: BookingData = {
        checkIn: checkIn?.toISOString().split("T")[0] || "",
        checkOut: checkOut?.toISOString().split("T")[0] || "",
        guests: singleBeds + doubleBeds * 2,
        nights: nights,
        totalPrice: totalPrice,
        singleBeds,
        doubleBeds,
        singleBedPrice,
        doubleBedPrice,
        singleBedCleaningPrice,
        doubleBedCleaningPrice,
      }

      // Llamar al callback si existe
      if (onReservation) {
        onReservation(bookingData)
        return
      }
    } catch (err) {
      console.error("Error al realizar la reserva:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-md bg-white max-w-md mx-auto">
      {/* Precio desde */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mb-2 sm:mb-0 text-center sm:text-left">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#39759E]">
            Desde $
            {Math.floor(
              Math.min(singleBedPrice || Number.POSITIVE_INFINITY, doubleBedPrice || Number.POSITIVE_INFINITY),
            ).toLocaleString("es-CO")}{" "}
            USD
          </span>
          <span className="text-[#162F40] text-xs sm:text-sm ml-1 sm:ml-2">/ noche</span>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full text-left justify-start text-sm sm:text-sm py-5 ${
                  !checkIn && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "d MMMM", { locale: es }) : "Llegada"}
              </Button>
              {checkIn && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCheckIn(undefined)
                  }}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={handleCheckInSelect}
              disabled={(d) => d < today}
              defaultMonth={checkIn || today}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full text-left justify-start text-sm sm:text-sm py-5 ${
                  !checkOut && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "d MMMM", { locale: es }) : "Salida"}
              </Button>
              {checkOut && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCheckOut(undefined)
                  }}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(d) => !checkIn || d <= checkIn}
              defaultMonth={checkOut || checkIn || today}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Selección de camas */}
      <div className="space-y-4 mt-6">
        <h3 className="font-medium text-[#162F40]">Selecciona tus camas para estas fechas:</h3>
        {(!checkIn || !checkOut) && (
          <span className="text-sm mt-0 text-amber-600 mb-2">Selecciona las fechas de llegada y salida</span>
        )}

{checkIn && checkOut && (
  <span className="text-sm text-blue-600 mb-2">
    Disponibles: {getAvailableBedsInRange.singleBeds} simple{getAvailableBedsInRange.singleBeds !== 1 ? 's' : ''},{" "}
    {getAvailableBedsInRange.doubleBeds} doble{getAvailableBedsInRange.doubleBeds !== 1 ? 's' : ''}
  </span>
)}



        {/* Contenedor único para ambos tipos de camas */}
        <div className={`border rounded-lg p-4 ${!checkIn || !checkOut ? "bg-gray-100 opacity-75" : "bg-gray-50"}`}>
          {/* Camas individuales */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Label className="flex items-center gap-2 text-[#162F40]">
                  <Bed className="h-4 w-4 text-[#39759E]" />
                  <span className="font-medium text-sm">Camas simples</span>
                </Label>
                <div className="text-xs text-muted-foreground pl-6">
                  ${Math.floor(singleBedPrice).toLocaleString("es-CO")}/noche + $
                  {Math.floor(singleBedCleaningPrice).toLocaleString("es-CO")} limpieza
                </div>
              </div>
              <div className="flex items-center border p-2 rounded-md bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleSingleBedsChange(-1)}
                  disabled={singleBeds <= 0 || !checkIn || !checkOut}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm">{singleBeds}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleSingleBedsChange(1)}
                  disabled={!checkIn || !checkOut || singleBeds >= getAvailableBedsInRange.singleBeds}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t my-3"></div>

          {/* Camas dobles */}
          <div>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Label className="flex items-center gap-2 text-[#162F40]">
                  <BedDouble className="h-4 w-4 text-[#39759E]" />
                  <span className="font-medium text-sm">Camas dobles</span>
                </Label>
                <div className="text-xs text-muted-foreground pl-6">
                  ${Math.floor(doubleBedPrice).toLocaleString("es-CO")}/noche + $
                  {Math.floor(doubleBedCleaningPrice).toLocaleString("es-CO")} limpieza
                </div>
              </div>
              <div className="flex items-center border p-2 rounded-md bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDoubleBedsChange(-1)}
                  disabled={doubleBeds <= 0 || !checkIn || !checkOut}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm">{doubleBeds}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDoubleBedsChange(1)}
                  disabled={!checkIn || !checkOut || doubleBeds >= getAvailableBedsInRange.doubleBeds}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de precios */}
      {nights > 0 && (singleBeds > 0 || doubleBeds > 0) && (
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg border mt-4">
          <h3 className="font-medium text-[#162F40] mb-2 text-center">Resumen de tu reserva</h3>

          {singleBeds > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  {singleBeds} cama
                  {singleBeds > 1 ? "s" : ""} simple{singleBeds > 1 ? "s" : ""} × {nights} noche
                  {nights > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  ${Math.floor(singleBedPrice * singleBeds * nights).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  Limpieza {singleBeds} cama
                  {singleBeds > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  ${Math.floor(singleBedCleaningPrice * singleBeds).toLocaleString("es-CO")}
                </span>
              </div>
            </>
          )}

          {doubleBeds > 0 && (
            <>
              <div className="flex justify-between items-center border-t pt-2 text-sm">
                <span className="text-[#162F40]">
                  {doubleBeds} cama
                  {doubleBeds > 1 ? "s" : ""} doble{doubleBeds > 1 ? "s" : ""} × {nights} noche{nights > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  ${Math.floor(doubleBedPrice * doubleBeds * nights).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  Limpieza {doubleBeds} cama
                  {doubleBeds > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  ${Math.floor(doubleBedCleaningPrice * doubleBeds).toLocaleString("es-CO")}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
            <span className="text-[#162F40] font-semibold">Total</span>
            <span className="font-bold text-lg">${Math.floor(totalPrice).toLocaleString("es-CO")} USD</span>
          </div>
        </div>
      )}

      <Button
        className="w-full bg-[#39759E] hover:bg-[#2c5a7a] text-white font-semibold py-6 rounded-md transition-colors duration-300 mt-4"
        disabled={!isReservationEnabled || loading}
        onClick={handleReservation}
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </div>
  )
}
