"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, parseISO } from "date-fns"
import { es, enUS } from "date-fns/locale" // Importamos enUS
import { CalendarIcon, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import styles from "./BookingWidget.module.css"
import { type Locale } from "@/lib/i18n";

// --- Objeto de Traducción (Simulación de I18n) ---
const translations = {
  es: {
    perNight: "/noche",
    checkIn: "Llegada",
    checkOut: "Salida",
    longStay: "estadía larga",
    mediumStay: "estadía media",
    considerStaying: (minNights: number) =>
      `¡Considera quedarte ${minNights} noches o más para obtener descuentos especiales!`,
    youChose: (nights: number) => `Elegiste ${nights} noches que equivale a una`,
    withDiscount: (percentage: number) => `con un descuento del ${percentage}%`,
    nightsLabel: (nights: number) => `${nights} noche(s)`,
    cleaningFee: "Tarifa de limpieza",
    total: "Total",
    modifyReservation: "Modificar reserva",
  },
  en: {
    perNight: "/night",
    checkIn: "Check-in",
    checkOut: "Check-out",
    longStay: "long stay",
    mediumStay: "medium stay",
    considerStaying: (minNights: number) =>
      `Consider staying ${minNights} nights or more for special discounts!`,
    youChose: (nights: number) => `You chose ${nights} nights, which is considered a`,
    withDiscount: (percentage: number) => `with a ${percentage}% discount`,
    nightsLabel: (nights: number) => `${nights} night(s)`,
    cleaningFee: "Cleaning fee",
    total: "Total",
    modifyReservation: "Modify reservation",
  },
}

interface BookingData {
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  price: number
  cleaning: number
  discountStayType: string
  discountPercentageStayApplied: number
  discountStayAmount: number
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
  discount_percentage_medium_stay: number
  discount_percentage_long_stay: number
  prepayment_percentage: number
  minMediumStayRange: number
  maxMediumStayRange: number
  minLongStayRange: number
  maxLongStayRange: number
  bookings: Booking[]
  disableDates: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  lang: Locale // <-- Nuevo parámetro de idioma
  onSubmit?: (bookingData: BookingData) => void
}

export function BookingWidgetBed({
  price,
  cleaning,
  discount_percentage_medium_stay,
  discount_percentage_long_stay,
  minMediumStayRange,
  maxMediumStayRange,
  minLongStayRange,
  maxLongStayRange,
  bookings: initialBookings,
  disableDates,
  defaultCheckIn,
  defaultCheckOut,
  lang = 'es', // <-- Usamos 'es' como valor por defecto
  onSubmit,
}: BookingWidgetProps) {
  const searchParams = useSearchParams()

  // Hook para acceder a las traducciones
  const t = useMemo(() => translations[lang], [lang])
  
  // Hook para acceder al locale de date-fns
  const dateFnsLocale = useMemo(() => (lang === 'en' ? enUS : es), [lang])

  const [checkIn, setCheckIn] = useState<Date | undefined>(() => {
    if (defaultCheckIn) return parseISO(defaultCheckIn)
    const checkInParam = searchParams.get("checkIn")
    return checkInParam ? parseISO(checkInParam) : undefined
  })
  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    if (defaultCheckOut) return parseISO(defaultCheckOut)
    const checkOutParam = searchParams.get("checkOut")
    return checkOutParam ? parseISO(checkOutParam) : undefined
  })

  const [nights, setNights] = useState(0)
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

  const getDiscountStayType = useMemo(() => {
    if (nights < minMediumStayRange) {
      return "short"
    } else if (nights >= minLongStayRange && nights <= maxLongStayRange) {
      return "long"
    } else if (nights >= minMediumStayRange && nights <= maxMediumStayRange) {
      return "medium"
    }
    return "short"
  }, [nights, minMediumStayRange, maxMediumStayRange, minLongStayRange, maxLongStayRange])

  const calculateDiscount = useMemo(() => {
    if (nights >= minLongStayRange && nights <= maxLongStayRange) {
      return discount_percentage_long_stay
    } else if (nights >= minMediumStayRange && nights <= maxMediumStayRange) {
      return discount_percentage_medium_stay
    }
    return 0
  }, [
    nights,
    minMediumStayRange,
    maxMediumStayRange,
    minLongStayRange,
    maxLongStayRange,
    discount_percentage_medium_stay,
    discount_percentage_long_stay,
  ])

  const discountStayType = getDiscountStayType
  const discountPercentageStayApplied = calculateDiscount
  const discountAmount = (price * nights * calculateDiscount) / 100
  const totalPrice = price * nights - discountAmount + cleaning

  const isDateReserved = useMemo(() => {
    const reservedDates: string[] = []

    bookings.forEach((booking) => {
      let currentDate = parseISO(booking.checkIn)
      const endDate = parseISO(booking.checkOut)

      while (currentDate <= endDate) {
        reservedDates.push(format(currentDate, "yyyy-MM-dd"))
        currentDate = addDays(currentDate, 1)
      }
    })

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

  const handleSubmit = () => {
    if (!onSubmit || !checkIn || !checkOut) return

    const formattedBooking: BookingData = {
      checkIn: checkIn.toISOString().split("T")[0],
      checkOut: checkOut.toISOString().split("T")[0],
      guests: 1,
      nights: nights,
      price: price,
      cleaning: cleaning,
      discountStayType: discountStayType,
      discountPercentageStayApplied: discountPercentageStayApplied,
      discountStayAmount: discountAmount,
      totalPrice: totalPrice,
    }

    onSubmit(formattedBooking)
  }
  
  // Usamos el locale correcto para la moneda
  const currencyLocale = lang === 'en' ? 'en-US' : 'es-CO';

  return (
    <div className="border rounded-lg p-6 space-y-6 shadow-md bg-white">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-3xl font-bold text-[#39759E]">${price.toLocaleString(currencyLocale)} USD</span>
          <span className="text-[#162F40] ml-2">{t.perNight}</span> {/* <-- Traducido */}
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
                {/* Usamos dateFnsLocale para el formato de fecha */}
                {checkIn ? format(checkIn, "PP", { locale: dateFnsLocale }) : t.checkIn} {/* <-- Traducido */}
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
              locale={dateFnsLocale} // <-- Usamos dateFnsLocale
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
                {/* Usamos dateFnsLocale para el formato de fecha */}
                {checkOut ? format(checkOut, "PP", { locale: dateFnsLocale }) : t.checkOut} {/* <-- Traducido */}
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
              locale={dateFnsLocale} // <-- Usamos dateFnsLocale
            />
          </PopoverContent>
        </Popover>
      </div>

      {nights > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-blue-800 font-medium">
              {nights >= minLongStayRange && nights <= maxLongStayRange ? (
                <>
                  {/* Lógica de traducción para estadía larga */}
                  {t.youChose(nights)}{" "}
                  <span className="font-bold text-blue-900"> {t.longStay} </span>
                  {t.withDiscount(discount_percentage_long_stay)}
                </>
              ) : nights >= minMediumStayRange && nights <= maxMediumStayRange ? (
                <>
                  {/* Lógica de traducción para estadía media */}
                  {t.youChose(nights)}{" "}
                  <span className="font-bold text-blue-900"> {t.mediumStay} </span>
                  {t.withDiscount(discount_percentage_medium_stay)}
                </>
              ) : (
                <>
                  {/* Lógica de traducción para estadía corta */}
                  {nights < minMediumStayRange && (
                    <span className="text-blue-700">
                      {t.considerStaying(minMediumStayRange)}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {nights > 0 && (
          <div className="space-y-2 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#162F40]">
                ${price.toLocaleString(currencyLocale)} x {t.nightsLabel(nights)} {/* <-- Traducido */}
              </span>
              <span className="font-semibold">
                ${(price * nights).toLocaleString(currencyLocale)} <span className="font-semibold text-[#162F40]">USD</span>
              </span>
            </div>
            {calculateDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">
                  {/* Traducción dinámica del tipo de estadía */}
                  {lang === 'es' ? 'Estadía' : 'Stay'} {nights >= minLongStayRange ? t.longStay : t.mediumStay} (-{calculateDiscount}%)
                </span>
                <span className="font-semibold text-green-600">
                  -${((price * nights * calculateDiscount) / 100).toLocaleString(currencyLocale)} USD
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#162F40]">{t.cleaningFee}</span> {/* <-- Traducido */}
              <span className="font-semibold">${cleaning.toLocaleString(currencyLocale)} USD</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-[#162F40] font-semibold">{t.total}</span> {/* <-- Traducido */}
              <span className="font-bold text-lg">${totalPrice.toLocaleString(currencyLocale)} USD</span>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-[#39759E] hover:bg-[#2c5a7a] text-white font-semibold py-3 rounded-md transition-colors duration-300"
        disabled={!isReservationEnabled}
        onClick={handleSubmit}
      >
        {t.modifyReservation} {/* <-- Traducido */}
      </Button>
    </div>
  )
}