"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Minus, Plus, Bed, BedDouble, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import styles from "./BookingWidget.module.css";

interface BookingCompartidaProps {
  singleBedPrice: number;
  singleBedCleaningPrice: number;
  doubleBedPrice: number;
  doubleBedCleaningPrice: number;
  bookings: Booking[];
  availableSingleBeds: number;
  availableDoubleBeds: number;
  disableDates: string;
  onReservation?: (bookingData: BookingData) => void;
}

interface Booking {
  checkIn: string;
  checkOut: string;
  patient: string;
  guests: number;
  price: number;
  cleaning: number;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  singleBeds: number;
  doubleBeds: number;
  singleBedPrice: number;
  doubleBedPrice: number;
  singleBedCleaningPrice: number;
  doubleBedCleaningPrice: number;
  totalPrice: number;
}

export default function BookingCompartidaAirbnb({
  singleBedPrice,
  singleBedCleaningPrice,
  doubleBedPrice,
  doubleBedCleaningPrice,
  bookings: initialBookings,
  availableSingleBeds,
  availableDoubleBeds,
  disableDates,
  onReservation,
}: BookingCompartidaProps) {
  const searchParams = useSearchParams();

  // Inicializar estados con valores de URL si existen
  const [checkIn, setCheckIn] = useState<Date | undefined>(() => {
    const v = searchParams.get("checkIn");
    return v ? parseISO(v) : undefined;
  });

  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    const v = searchParams.get("checkOut");
    return v ? parseISO(v) : undefined;
  });

  const [singleBeds, setSingleBeds] = useState(0);
  const [doubleBeds, setDoubleBeds] = useState(0);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const bookings = initialBookings || [];

  // Fecha actual para validaciones
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calcular noches cuando cambian las fechas
  useEffect(() => {
    if (checkIn && checkOut) {
      const days = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
      );
      setNights(days > 0 ? days : 0);
    } else setNights(0);
  }, [checkIn, checkOut]);

  // Calcular precio total
  useEffect(() => {
    const singleNight = singleBedPrice * singleBeds * nights;
    const doubleNight = doubleBedPrice * doubleBeds * nights;
    const singleClean = singleBedCleaningPrice * singleBeds;
    const doubleClean = doubleBedCleaningPrice * doubleBeds;
    setTotalPrice(singleNight + doubleNight + singleClean + doubleClean);
  }, [
    singleBeds,
    doubleBeds,
    nights,
    singleBedPrice,
    doubleBedPrice,
    singleBedCleaningPrice,
    doubleBedCleaningPrice,
  ]);

  // Manejadores para cambiar cantidad de camas
  const handleSingleBedsChange = (inc: number) =>
    setSingleBeds((prev) =>
      Math.max(0, Math.min(prev + inc, availableSingleBeds))
    );

  const handleDoubleBedsChange = (inc: number) =>
    setDoubleBeds((prev) =>
      Math.max(0, Math.min(prev + inc, availableDoubleBeds))
    );

  // Crear lookup eficiente para fechas reservadas
  const reservedLookup = useMemo(() => {
    const dates: Set<string> = new Set();

    // Añadir fechas de reservas existentes
    bookings.forEach((b) => {
      let cur = parseISO(b.checkIn);
      const end = parseISO(b.checkOut);
      while (cur <= end) {
        dates.add(format(cur, "yyyy-MM-dd"));
        cur = addDays(cur, 1);
      }
    });

    // Añadir fechas deshabilitadas
    if (disableDates) {
      try {
        JSON.parse(disableDates).forEach((d: string) => dates.add(d));
      } catch (e) {
        console.error("Error parsing disableDates:", e);
      }
    }

    // Función para verificar si una fecha está reservada
    return (d: Date) => dates.has(format(d, "yyyy-MM-dd"));
  }, [bookings, disableDates]);

  // Encontrar próxima fecha disponible
  const findNextAvailableDate = (start: Date): Date => {
    let d = start;
    while (reservedLookup(d)) d = addDays(d, 1);
    return d;
  };

  // Manejar selección de fecha de entrada
  const handleCheckInSelect = (d: Date | undefined) => {
    if (d) {
      const next = findNextAvailableDate(d);
      setCheckIn(next);
      if (checkOut && next >= checkOut) setCheckOut(undefined);
    } else setCheckIn(undefined);
  };

  // Verificar si hay fechas reservadas entre dos fechas
  const hasBetween = (start: Date, end: Date): boolean => {
    let cur = addDays(start, 1);
    while (cur < end) {
      if (reservedLookup(cur)) return true;
      cur = addDays(cur, 1);
    }
    return false;
  };

  // Verificar si la reserva está habilitada
  const isReservationEnabled =
    !!checkIn && !!checkOut && nights > 0 && (singleBeds > 0 || doubleBeds > 0);

  // Manejar la reserva
  const handleReservation = async () => {
    setLoading(true);
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
      };

      // Llamar al callback si existe
      if (onReservation) {
        onReservation(bookingData);
        return;
      }
    } catch (err) {
      console.error("Error al realizar la reserva:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-md bg-white">
      {/* Precio desde */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-[#39759E]">
            Desde $
            {Math.min(
              singleBedPrice || Number.POSITIVE_INFINITY,
              doubleBedPrice || Number.POSITIVE_INFINITY
            ).toLocaleString("es-CO")}{" "}
            USD
          </span>
          <span className="text-[#162F40] ml-2">/ noche</span>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full text-left ${
                  !checkIn && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PP", { locale: es }) : "Llegada"}
              </Button>
              {checkIn && (
                <X
                  className="absolute right-1 top-3 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCheckIn(undefined);
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
              disabled={(d) => d < today || reservedLookup(d)}
              defaultMonth={checkIn || today}
              modifiers={{ reserved: reservedLookup }}
              modifiersClassNames={{ reserved: styles.reservedDate }}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={`w-full text-left ${
                  !checkOut && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PP", { locale: es }) : "Salida"}
              </Button>
              {checkOut && (
                <X
                  className="absolute right-1 top-3 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCheckOut(undefined);
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
              disabled={(d) =>
                d <= (checkIn || today) ||
                reservedLookup(d) ||
                (checkIn ? hasBetween(checkIn, d) : false)
              }
              defaultMonth={checkOut || checkIn || today}
              modifiers={{ reserved: reservedLookup }}
              modifiersClassNames={{ reserved: styles.reservedDate }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Selección de camas */}
      <div className="space-y-4">
        {/* Camas individuales */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4">
          <Label className="flex items-center gap-2 text-[#162F40] mb-2 sm:mb-0">
            <Bed className="h-5 w-5" />
            <div>
              <span>Camas simples</span>
            </div>
            <span className="block text-xs text-muted-foreground">
              ${singleBedPrice}/noche + ${singleBedCleaningPrice} limpieza
            </span>
          </Label>
          <div className="flex items-center border rounded-md self-end sm:self-auto">
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => handleSingleBedsChange(-1)}
              disabled={singleBeds <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{singleBeds}</span>
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => handleSingleBedsChange(1)}
              disabled={singleBeds >= availableSingleBeds}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Camas dobles */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4">
          <Label className="flex items-center gap-2 text-[#162F40] mb-2 sm:mb-0">
            <BedDouble className="h-5 w-5" />
            <div>
              <span>Camas dobles</span>
            </div>
            <span className="block text-xs text-muted-foreground">
              ${doubleBedPrice}/noche + ${doubleBedCleaningPrice} limpieza
            </span>
          </Label>
          <div className="flex items-center border rounded-md self-end sm:self-auto">
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => handleDoubleBedsChange(-1)}
              disabled={doubleBeds <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{doubleBeds}</span>
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => handleDoubleBedsChange(1)}
              disabled={doubleBeds >= availableDoubleBeds}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen de precios */}
      {nights > 0 && (singleBeds > 0 || doubleBeds > 0) && (
        <div className="space-y-2 bg-gray-50 p-4 rounded-md mt-4">
          {singleBeds > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  {singleBeds} cama
                  {singleBeds > 1 ? "s" : ""} simple{singleBeds > 1 ? "s" : ""}{" "}
                  × {nights} noche
                  {nights > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  $
                  {(singleBedPrice * singleBeds * nights).toLocaleString(
                    "es-CO"
                  )}{" "}
                  USD
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  Limpieza {singleBeds} cama
                  {singleBeds > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  $
                  {(singleBedCleaningPrice * singleBeds).toLocaleString(
                    "es-CO"
                  )}{" "}
                  USD
                </span>
              </div>
            </>
          )}

          {doubleBeds > 0 && (
            <>
              <div className="flex justify-between items-center border-t pt-2 text-sm">
                <span className="text-[#162F40]">
                  {doubleBeds} cama
                  {doubleBeds > 1 ? "s" : ""} doble{doubleBeds > 1 ? "s" : ""} ×{" "}
                  {nights} noche{nights > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  $
                  {(doubleBedPrice * doubleBeds * nights).toLocaleString(
                    "es-CO"
                  )}{" "}
                  USD
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#162F40]">
                  Limpieza {doubleBeds} cama
                  {doubleBeds > 1 ? "s" : ""}
                </span>
                <span className="font-semibold">
                  $
                  {(doubleBedCleaningPrice * doubleBeds).toLocaleString(
                    "es-CO"
                  )}{" "}
                  USD
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
            <span className="text-[#162F40] font-semibold">Total</span>
            <span className="font-bold text-lg">
              ${totalPrice.toLocaleString("es-CO")} USD
            </span>
          </div>
        </div>
      )}

      <Button
        className="w-full bg-[#39759E] hover:bg-[#2c5a7a] text-white font-semibold py-3 rounded-md transition-colors duration-300"
        disabled={!isReservationEnabled || loading}
        onClick={handleReservation}
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </div>
  );
}
