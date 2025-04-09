
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/userService"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import ReviewModal from "@/components/ReviewModal"
import { Calendar, Users, DollarSign, Home, Star, Loader2, Search } from "lucide-react"
import Link from "next/link"

// Tipos basados en el JSON proporcionado
interface Photo {
  directus_files_id: {
    id: string
  }
}

interface Room {
  id: string
  name: string
  roomNumber: string
  beds: number
  capacity: number
  description: string
  cleaningFee: string
  pricePerNight: string
  photos: Photo[]
  propertyId: Property
}

interface Property {
  id: string
  name: string
  country: string
  state: string
  city: string
  address: string
  fullAddress: string
  hostName: string
  description: string
  mainImage: string
  type: string
}

interface Booking {
  id: string
  status: string
  checkOut: string
  checkIn: string
  patient: string
  guests: number
  price: string
  cleaning: string
  room: Room
}

interface BookingListProps {
  initialData?: {
    data: Booking[]
  }
}

const BookingList: React.FC<BookingListProps> = ({ initialData }) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  let name = ""

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("No access token found")
        }

        const user = await getCurrentUser(token)

        name = user.first_name

        const bookingsResponse = await fetch(
          `/webapi/items/Booking?filter[patient][_eq]=${user.id}&fields=*, +room.*, +room.photos.directus_files_id.id, +room.propertyId.*`,
        )
        const bookingsData = await bookingsResponse.json()

        setBookings(bookingsData.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar las reservas. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleReviewClick = (bookingId: string, roomId: string) => {
    setSelectedBookingId(bookingId)
    setSelectedRoomId(roomId)
    setIsReviewModalOpen(true)
  }

  function calculateTotal(booking: Booking): string {
    const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
    const total = nights * Number.parseFloat(booking.price) + Number.parseFloat(booking.cleaning)
    return total.toFixed(2)
  }

  const handleReviewSubmit = async (ranking: number, comment: string) => {
    if (selectedBookingId) {
      try {
        const response = await fetch("/webapi/items/Reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: selectedBookingId,
            room_id: selectedRoomId,
            ranking,
            comment,
            name: name,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to submit review")
        }

        console.log("Review submitted successfully")
      } catch (error) {
        console.error("Error submitting review:", error)
      } finally {
        setIsReviewModalOpen(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-gray-700">Cargando mis reservas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4 sm:px-4 lg:px-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Mis Reservas</h1>
      {bookings.length === 0 ? (
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Encuentra tu espacio ideal para una recuperación tranquila!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Aún no tienes reservas, pero estamos aquí para ayudarte a encontrar la casa de recuperación perfecta para
              tu proceso de sanación y bienestar.
            </p>
            <Button
              className="inline-flex items-center px-6 py-3 text-white bg-[#4A90E2] hover:bg-[#3A7BC8] transition-colors duration-300"
              asChild
            >
              <Link href="/rooms">
                <Search className="mr-2 h-5 w-5" />
                Buscar casa de recuperación
              </Link>
            </Button>
          </div>
        </main>
      ) : (
        <ul className="space-y-8">
          {bookings.map((booking) => {
            const roomDetails = booking.room
            const property = booking.room.propertyId
            const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
            return (
              <li key={booking.id}>
                <Card className="overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-1/3 h-64 md:h-auto">
                      <Image
                        src={
                          roomDetails?.photos[0]?.directus_files_id.id
                            ? `/webapi/assets/${roomDetails.photos[0]?.directus_files_id.id}?key=medium`
                            : "/placeholder.svg?height=400&width=600"
                        }
                        alt={roomDetails?.name || "Room image"}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                    <CardContent className="flex-1 p-6 md:w-2/3">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {roomDetails?.name || "Habitación"} - {property?.name || "Propiedad desconocida"}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Ingreso</p>
                            <p className="font-medium">{format(parseISO(booking.checkIn), "PPP", { locale: es })}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Salida</p>
                            <p className="font-medium">{format(parseISO(booking.checkOut), "PPP", { locale: es })}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Huéspedes</p>
                            <p className="font-medium">{booking.guests}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Precio por noche</p>
                            <p className="font-medium">${booking.price} USD</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Home className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Limpieza</p>
                            <p className="font-medium">${booking.cleaning} USD</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Noches</p>
                            <p className="font-medium">{nights}</p>
                          </div>
                        </div>
                      </div>
                      {roomDetails && <p className="text-sm text-gray-600 mb-4">{roomDetails.description}</p>}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                        <p className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                          Total: ${calculateTotal(booking)} USD
                        </p>
                        <Button
                          onClick={() => handleReviewClick(booking.id, booking.room.id)}
                          className="bg-[#39759E] text-white invisible hover:[#39759E]-700 rounded-lg px-6 py-2 transition-colors duration-300 flex items-center"
                        >
                          <Star className="mr-2 h-5 w-5" />
                          Dejar Comentario
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
       <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        bookingId={selectedBookingId || ""}
      />
    </div>
  )
}

export default BookingList
