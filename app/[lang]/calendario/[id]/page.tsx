"use client";

import { useParams } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import CalendarView from "./calendar";
import { Loader2 } from "lucide-react";
import { Fraunces } from "next/font/google";
import { type Locale } from "@/lib/i18n"; // Importación de Locale

const fraunces = Fraunces({ subsets: ["latin"] });

// --- Translation Data & Helper ---

interface CalendarTranslation {
  loadingMessage: string;
  errorMessage: string;
  defaultRoomName: string;
}

const translations: Record<string, CalendarTranslation> = {
  es: {
    loadingMessage: "Cargando Calendario...",
    errorMessage: "Error al obtener las reservas",
    defaultRoomName: "Calendario de Habitación",
  },
  en: {
    loadingMessage: "Loading Calendar...",
    errorMessage: "Error fetching bookings",
    defaultRoomName: "Room Calendar",
  },
};

// --- Component Interfaces ---

interface Booking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  patient: string;
  guests: number;
  price: number;
  cleaning: number;
  room: string;
  bookingState: string;
}

interface BookedDay {
  start: string;
  end: string;
}

// --- Main Component ---

export default function CalendarPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Obtener 'lang' y 'isSpanish'
  const lang = (params.lang as Locale) || 'es'; // Default to 'es'
  const isSpanish = lang.toLowerCase().startsWith('es');
  const t = translations[isSpanish ? 'es' : 'en'];

  const [bookedDays, setBookedDays] = useState<BookedDay[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<{ data: Booking[] }>(
          "/webapi/items/Booking",
          {
            params: { "filter[room][_eq]": id },
            headers: { "Access-Control-Allow-Origin": "*" },
          }
        );

        // Transformar los datos a la estructura deseada, filtrando canceladas
        const transformedData: BookedDay[] = response.data.data
          .filter((booking: Booking) => {
            return (
              booking.bookingState !== "cancelled_by_patient" &&
              booking.bookingState !== "cancelled_by_owner"
            );
          })
          .map((booking: Booking) => ({
            start: booking.checkIn,
            end: booking.checkOut,
          }));

        setBookedDays(transformedData);
      } catch (err) {
        // Usar la traducción para el error
        setError(t.errorMessage);
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id, t]); // Dependencia 't' para el mensaje de error

  useEffect(() => {
    // Obtener `selected_room` desde localStorage
    const selectedRoom = localStorage.getItem("selected_room");
    if (!selectedRoom) return;

    try {
      // Parsear el JSON correctamente
      const parsedRoom = JSON.parse(selectedRoom);

      if (parsedRoom?.name) {
        setRoomName(parsedRoom.name); // Guardar el nombre de la habitación
      }

      // Extraer y guardar el propertyId
      if (parsedRoom?.propertyId) {
        setPropertyId(parsedRoom.propertyId);
        console.log("Property ID:", parsedRoom.propertyId); 
      }

      const disableDatesString = parsedRoom?.disableDates;
      if (!disableDatesString) return;

      // Convertir el string a array
      const parsedDates: string[] = JSON.parse(disableDatesString);

      // Formatear las fechas al estilo requerido (YYYY-M-D)
      const formattedDates = parsedDates.map((date) => {
        const [year, month, day] = date.split("-").map(Number); // Convertir a número para quitar ceros innecesarios
        return `${year}-${month}-${day}`;
      });

      setUnavailableDates(formattedDates);
    } catch (error) {
      console.error("Error parsing selected_room from localStorage:", error);
    }
  }, []);

  return (
    <main className="min-h-screen py-4 flex flex-col items-center">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-gray-700">
            {t.loadingMessage}
          </span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="relative container">
            <h1
              className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
            >
              {roomName || t.defaultRoomName}
            </h1>
          </div>

          <CalendarView
            roomId={String(id)}
            propertyId={propertyId || ""}
            bookedDays={bookedDays}
            unavailableDates={unavailableDates}
          />
        </>
      )}
    </main>
  );
}