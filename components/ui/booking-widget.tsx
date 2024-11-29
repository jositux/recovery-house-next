"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, addDays } from "date-fns"
import { es } from 'date-fns/locale'
import { CalendarIcon, Minus, Plus, Users } from 'lucide-react'

interface BookingWidgetProps {
  price: number
}

export function BookingWidget({ price }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [nights, setNights] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    if (checkIn && checkOut) {
      const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
      setNights(nightsCount)
    } else {
      setNights(0)
    }
  }, [checkIn, checkOut])

  useEffect(() => {
    const subtotal = price * nights * guests
    const cleaningFee = price * 0.1
    setTotalPrice(subtotal + cleaningFee)
  }, [price, nights, guests])

  const handleGuestsChange = (increment: number) => {
    setGuests(prevGuests => Math.max(1, prevGuests + increment))
  }

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date)
    if (date && checkOut && date >= checkOut) {
      setCheckOut(addDays(date, 1))
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isReservationEnabled = checkIn && checkOut && nights > 0

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">${price.toLocaleString('es-CO')} COP</span>
          <span className="text-gray-600">/noche</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`w-full justify-start text-left font-normal ${!checkIn && "text-muted-foreground"}`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, "PP", { locale: es }) : <span>Check-in</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={handleCheckInSelect}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`w-full justify-start text-left font-normal ${!checkOut && "text-muted-foreground"}`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, "PP", { locale: es }) : <span>Check-out</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date <= (checkIn || today)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="guests" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Huéspedes
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleGuestsChange(-1)}
              disabled={guests <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              id="guests"
              className="w-16 text-center"
              value={guests}
              onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleGuestsChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isReservationEnabled && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>${price.toLocaleString('es-CO')} COP x {nights} noches x {guests} huéspedes</span>
                <span>${(price * nights * guests).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Tarifa de limpieza</span>
                <span>${(price * 0.1).toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice.toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Button className="w-full bg-[#4A7598] hover:bg-[#3A5F7A]" disabled={!isReservationEnabled}>
        Reservar
      </Button>
    </div>
  )
}

