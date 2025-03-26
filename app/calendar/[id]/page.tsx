'use client'

import { useParams } from "next/navigation"
import axios from "axios"
import { useState, useEffect } from "react"
import CalendarView from "./calendar"

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
      console.error("Error parsing unavailableDates from localStorage:", error)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      {loading && <p>Cargando reservas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <CalendarView roomId={String(id)} bookedDays={bookedDays} unavailableDates={unavailableDates} />}
    </main>
  )
}
