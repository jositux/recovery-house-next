"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays, parseISO, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Minus, Plus, Users } from "lucide-react";

import styles from "./BookingWidget.module.css";

interface Booking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  patient: string;
  room: string;
}

interface BookingWidgetProps {
  room: string;
  price: number;
  cleaning: number;
  bookings: Booking[];
}

export function BookingWidget({
  room,
  price,
  cleaning,
  bookings: initialBookings,
}: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  useEffect(() => {
    if (checkIn && checkOut) {
      const nightsCount = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
      );
      setNights(nightsCount);
    } else {
      setNights(0);
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    const subtotal = price * nights * guests;
    const cleaningFee = cleaning;
    setTotalPrice(subtotal + cleaningFee);
  }, [price, nights, guests]);

  const handleGuestsChange = (increment: number) => {
    setGuests((prevGuests) => Math.max(1, prevGuests + increment));
  };

  const isDateReserved = (date: Date) => {
    return bookings.some((booking) => {
      const startDate = parseISO(booking.checkIn);
      const endDate = parseISO(booking.checkOut);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    if (date && checkOut && date >= checkOut) {
      setCheckOut(addDays(date, 1));
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isReservationEnabled = checkIn && checkOut && nights > 0;

  const handleReservation = async () => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        alert("No se encontró el token de acceso.");
        return;
      }

      const response = await axios.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const patient_id = response.data.data.id;

      const reservationResponse = await axios.post(
        "/api/items/Booking/",
        {
          status: "pay-pending",
          checkIn: checkIn,
          checkOut: checkOut,
          patient: patient_id,
          room: room,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const newBooking: Booking = {
        id: reservationResponse.data.id,
        status: "pay-pending",
        checkIn: checkIn?.toISOString() || "",
        checkOut: checkOut?.toISOString() || "",
        patient: patient_id,
        room: room,
      };

      setBookings((prevBookings) => [...prevBookings, newBooking]);
      alert("Reservación creada con éxito.");
    } catch (error) {
      console.error("Error al realizar la reserva:", error);
      alert("Ocurrió un error al realizar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-3xl font-bold">
            ${price.toLocaleString("es-CO")} COP
          </span>
          <span className="text-gray-600">/noche</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !checkIn && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn
                ? format(checkIn, "PP", { locale: es })
                : "Check-in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={handleCheckInSelect}
              disabled={(date) => date < today || isDateReserved(date)}
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
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !checkOut && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut
                ? format(checkOut, "PP", { locale: es })
                : "Check-out"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date <= (checkIn || today) || isDateReserved(date)}
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

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Huéspedes
          </Label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              className="p-2"
              onClick={() => handleGuestsChange(-1)}
            >
              <Minus />
            </Button>
            <Input
              value={guests}
              readOnly
              className="w-12 text-center border-none"
            />
            <Button
              type="button"
              variant="outline"
              className="p-2"
              onClick={() => handleGuestsChange(1)}
            >
              <Plus />
            </Button>
          </div>
        </div>
        <div className="pt-4">
        <div className="space-y-2 flex justify-between">
            <span className="flex text-gray-700">
           {nights} noche(s) x {guests} huésped(es)
          </span>
          <span>${price * guests} COP</span>
          </div>
          
          
          <div className="flex justify-end">
            <p className="text-gray-700">+ Limpieza: {cleaning.toLocaleString("es-CO")} COP</p>
          </div>
          <div className="pt-4">
          <div className="pt-4 space-y-2 border-t text-2xl flex justify-between font-bold">
            <span>Total</span>
            <span>${totalPrice.toLocaleString("es-CO")} COP</span>
          </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-[#4A7598] hover:bg-[#3A5F7A]"
        disabled={!isReservationEnabled || loading}
        onClick={handleReservation}
      >
        {loading ? "Reservando..." : "Reservar"}
      </Button>
    </div>
  );
}
