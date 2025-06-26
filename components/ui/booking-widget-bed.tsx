"use client"

import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, parseISO /*, isWithinInterval*/ } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "./BookingWidget.module.css"

interface BookingData {
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  price: number
  cleaning: number
  totalPrice: number
}

interface Booking {
  checkIn: string
  checkOut: string
  patient: string
  price: number
  cleaning: number
}

interface BookingWidgetProps {
  price: number
  cleaning: number
  bookings: Booking[]
  disableDates: string
  onReservation?: (bookingData: BookingData) => void
}

export function BookingWidgetBed({
  price,
  cleaning,
  bookings: initialBookings,
  disableDates,
  onReservation,
}: BookingWidgetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [checkIn, setCheckIn] = useState<Date | undefined>(() => {
    const checkInParam = searchParams.get("checkIn")
    return checkInParam ? parseISO(checkInParam) : undefined
  })
  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    const checkOutParam = searchParams.get("checkOut")
    return checkOutParam ? parseISO(checkOutParam) : undefined
  })

  const [nights, setNights] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  //const [disabledDates, setDisabledDates] = useState<string[]>([])
  const bookings = initialBookings

  const today = useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    return todayDate
  }, [])

  useEffect(() => {
    if (checkIn && checkOut) {
      const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
      setNights(nightsCount)
    } else {
      setNights(0)
    }
  }, [checkIn, checkOut])

  useEffect(() => {
    const subtotal = price * nights
    const cleaningFee = cleaning
    setTotalPrice(subtotal + cleaningFee)
  }, [price, nights, cleaning])

  const isDateReserved = useMemo(() => {
    const reservedDates: string[] = []

    // Añadir todas las fechas reservadas
    bookings.forEach((booking) => {
      let currentDate = parseISO(booking.checkIn)
      const endDate = parseISO(booking.checkOut)

      while (currentDate <= endDate) {
        reservedDates.push(format(currentDate, "yyyy-MM-dd"))
        currentDate = addDays(currentDate, 1)
      }
    })

    // Añadir las fechas deshabilitadas
    if (disableDates) {
      JSON.parse(disableDates).forEach((disabledDate: string) => {
        reservedDates.push(disabledDate)
      })
    }

    return (date: Date) => {
      const formattedDate = format(date, "yyyy-MM-dd")
      return reservedDates.includes(formattedDate)
    }
  }, [bookings, disableDates])

  const handleCheckInSelect = (date: Date | undefined) => {
    if (date) {
      const nextAvailableDate = findNextAvailableDate(date)
      setCheckIn(nextAvailableDate)
      if (checkOut && nextAvailableDate >= checkOut) {
        //setCheckOut(addDays(nextAvailableDate, 1))
        setCheckOut(undefined)
      }
    } else {
      setCheckIn(undefined)
    }
  }

  const findNextAvailableDate = (startDate: Date): Date => {
    let currentDate = startDate
    while (isDateReserved(currentDate)) {
      currentDate = addDays(currentDate, 1)
    }
    return currentDate
  }

  const hasReservedDateBetween = (start: Date, end: Date): boolean => {
    let currentDate = addDays(start, 1)
    while (currentDate < end) {
      if (isDateReserved(currentDate)) {
        return true
      }
      currentDate = addDays(currentDate, 1)
    }
    return false
  }

  const isReservationEnabled = checkIn && checkOut && nights > 0

  const handleReservation = async () => {
    try {
      setLoading(true)

      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        router.push("/login")
        return
      }

      // Create booking data
      const formattedBooking: BookingData = {
        checkIn: checkIn?.toISOString().split("T")[0] || "",
        checkOut: checkOut?.toISOString().split("T")[0] || "",
        guests: 0,
        nights: nights,
        price: price,
        cleaning: cleaning,
        totalPrice: totalPrice,
      }

      // Call the onReservation callback if provided
      if (onReservation) {
        onReservation(formattedBooking)
      }
    } catch (error) {
      console.error("Error al realizar la reserva:", error)
      alert("Ocurrió un error al realizar la reserva.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 space-y-6 shadow-md bg-white">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-3xl font-bold text-[#39759E]">${price.toLocaleString("es-CO")} USD</span>
          <span className="text-[#162F40] ml-2">/noche</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${!checkIn && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-0 h-4 w-4" />
                {checkIn ? format(checkIn, "PP", { locale: es }) : "Llegada"}
              </Button>
              {checkIn && (
                <X
                  className="absolute right-1 top-3 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={() => setCheckIn(undefined)}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={handleCheckInSelect}
              disabled={(date) => {
                const isBeforeToday = date < today
                return isBeforeToday || isDateReserved(date)
              }}
              defaultMonth={checkIn || today}
              modifiers={{
                reserved: isDateReserved,
              }}
              modifiersClassNames={{
                reserved: styles.reservedDate,
              }}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${!checkOut && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-0 h-4 w-4" />
                {checkOut ? format(checkOut, "PP", { locale: es }) : "Salida"}
              </Button>
              {checkIn && (
                <X
                  className="absolute right-1 top-3 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={() => setCheckOut(undefined)}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => {
                const isBeforeOrEqualCheckIn = date <= (checkIn || today)
                const hasBetweenReservation = checkIn ? hasReservedDateBetween(checkIn, date) : false
                return isBeforeOrEqualCheckIn || isDateReserved(date) || hasBetweenReservation
              }}
              defaultMonth={checkOut || checkIn || today}
              modifiers={{
                reserved: isDateReserved,
              }}
              modifiersClassNames={{
                reserved: styles.reservedDate,
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        {nights > 0 && (
          <div className="space-y-2 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#162F40]">
                ${price.toLocaleString("es-CO")} x {nights} noche(s)
              </span>
              <span className="font-semibold">
                ${(price * nights).toLocaleString("es-CO")} <span className="font-semibold text-[#162F40]">USD</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#162F40]">Tarifa de limpieza</span>
              <span className="font-semibold">${cleaning.toLocaleString("es-CO")} USD</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-[#162F40] font-semibold">Total</span>
              <span className="font-bold text-lg">${totalPrice.toLocaleString("es-CO")} USD</span>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-[#39759E] hover:bg-[#2c5a7a] text-white font-semibold py-3 rounded-md transition-colors duration-300"
        disabled={!isReservationEnabled || loading}
        onClick={handleReservation}
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </div>
  )
}
