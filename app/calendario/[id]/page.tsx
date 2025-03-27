'use client'

import { useParams } from "next/navigation"
import axios from "axios"
import { useState, useEffect } from "react"
import CalendarView from "./calendar"
import { Loader2 } from 'lucide-react' // Asegúrate de importar el ícono correcto
import { MagicBackButton } from "@/components/ui/magic-back-button"

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
}

interface BookedDay {
  start: string
  end: string
}

export default function CalendarPage() {
  const { id } = useParams()
  const [bookedDays, setBookedDays] = useState<BookedDay[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchBookings = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get<{ data: Booking[] }>("/webapi/items/Booking", {
          params: { "filter[room][_eq]": id },
          headers: { "Access-Control-Allow-Origin": "*" },
        })

        // Transformar los datos a la estructura deseada
        const transformedData: BookedDay[] = response.data.data.map((booking) => ({
          start: booking.checkIn,
          end: booking.checkOut,
        }))

        setBookedDays(transformedData)

      } catch (err) {
        setError("Error al obtener las reservas")
        console.error("Error fetching bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [id])

  useEffect(() => {
    // Obtener `selected_room` desde localStorage
    const selectedRoom = localStorage.getItem("selected_room")
    if (!selectedRoom) return

    try {
      // Parsear el JSON correctamente
      const parsedRoom = JSON.parse(selectedRoom)
      
      if (parsedRoom?.name) {
        setRoomName(parsedRoom.name) // Guardar el nombre de la habitación
      }

      const disableDatesString = parsedRoom?.disableDates
      if (!disableDatesString) return

      // Convertir el string a array
      const parsedDates: string[] = JSON.parse(disableDatesString)

      // Formatear las fechas al estilo requerido (YYYY-M-D)
      const formattedDates = parsedDates.map((date) => {
        const [year, month, day] = date.split("-").map(Number) // Convertir a número para quitar ceros innecesarios
        return `${year}-${month}-${day}`
      })

      setUnavailableDates(formattedDates)
    } catch (error) {
      console.error("Error parsing selected_room from localStorage:", error)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 flex flex-col items-center">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-gray-700">
            Cargando Calendario...
          </span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
        <div className="relative container px-4">
          <MagicBackButton />  {roomName && <h1 className="text-3xl absolute left-16 top-0 text font-medium text-gray-800 mb-4">{roomName}</h1>}
        </div>
         
          <CalendarView roomId={String(id)} bookedDays={bookedDays} unavailableDates={unavailableDates} />
        </>
      )}
    </main>
  )
}
