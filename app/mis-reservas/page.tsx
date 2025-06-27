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
import { Calendar, Users, DollarSign, BedSingle, BedDouble, Star, Loader2, Search } from "lucide-react"
import Link from "next/link"

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
  descriptionService: string
  isPrivate: boolean
  singleBeds: number
  doubleBeds: number
  // Precios para habitación privada o cama
  privateRoomPrice: string
  privateRoomCleaning: string

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: string
  sharedRoomCleaning: string

  bedType: string
  bedName: string
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

  // Nuevos campos
  roomName?: string | null
  roomDescription?: string | null
  propertyName?: string | null
  paymentId?: string | null
  ownerName?: string | null
  patientName?: string | null
  isPrivate?: boolean
  singleBeds?: number | null
  doubleBeds?: number | null
  singleBedPrice?: string | null
  doubleBedPrice?: string | null
  singleBedCleaningPrice?: string | null
  doubleBedCleaningPrice?: string | null
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  let name = ""

  // Función para separar reservas por fecha
  const separateBookingsByDate = (bookings: Booking[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas

    const upcoming = bookings.filter((booking) => {
      const checkoutDate = new Date(booking.checkOut)
      checkoutDate.setHours(0, 0, 0, 0)
      return checkoutDate >= today
    })

    const past = bookings.filter((booking) => {
      const checkoutDate = new Date(booking.checkOut)
      checkoutDate.setHours(0, 0, 0, 0)
      return checkoutDate < today
    })

    return { upcoming, past }
  }

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
        // Ordenar las reservas por fecha de check-in de mayor a menor (más recientes primero)
        const sortedBookings = [...bookingsData.data].sort((a, b) => {
          return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
        })
        setBookings(sortedBookings)
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
    let total: number

    // Si room.isPrivate es false (explícitamente), usar cálculo para habitaciones compartidas
    // Si room.isPrivate es null o true, considerar como habitación privada
    if (booking.isPrivate === false) {
      total = nights * Number.parseFloat(booking.price) + Number.parseFloat(booking.cleaning)
    } else {
      // For private rooms (room.isPrivate is true or null), use the original calculation
      total = nights * booking.guests * Number.parseFloat(booking.price) + Number.parseFloat(booking.cleaning)
    }

    return total.toFixed(2)
  }

  const handleReviewSubmit = async (ranking: number, comment: string) => {
    if (selectedBookingId) {
      try {
        const response = await fetch("/webapi/items/Reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: selectedBookingId,
            room_id: selectedRoomId,
            ranking,
            comment,
            name: name,
          }),
        })

        if (!response.ok) throw new Error("Failed to submit review")
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
        <div className="space-y-12">
          {(() => {
            const { upcoming, past } = separateBookingsByDate(bookings)

            return (
              <>
                {/* Próximas Reservas */}
                {upcoming.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-bold text-gray-900">Próximas Reservas</h2>
                        <p className="text-gray-600">Reservas activas y futuras ({upcoming.length})</p>
                      </div>
                    </div>
                    <ul className="space-y-6">
                      {upcoming.map((booking) => {
                        const roomDetails = booking.room
                        const property = booking.room.propertyId
                        const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
                        const isCurrentStay =
                          new Date() >= new Date(booking.checkIn) && new Date() <= new Date(booking.checkOut)

                        return (
                          <li key={booking.id}>
                            <Card
                              className={`overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 ${
                                roomDetails?.isPrivate === false
                                  ? "border-l-4 border-amber-500"
                                  : "border-l-4 border-emerald-500"
                              } ${isCurrentStay ? "ring-2 ring-emerald-400 ring-opacity-50" : ""}`}
                            >
                              {isCurrentStay && (
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2">
                                  <p className="text-sm font-medium flex items-center">
                                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                    Estadía actual - Disfruta tu recuperación
                                  </p>
                                </div>
                              )}
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
                                  <div
                                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                                      roomDetails?.isPrivate === false
                                        ? "bg-amber-500 text-white"
                                        : "bg-emerald-500 text-white"
                                    }`}
                                  >
                                    {roomDetails?.isPrivate === false ? (
                                      <div className="flex items-center space-x-1">
                                        {roomDetails?.bedType === "double" ? (
                                          <>
                                            <BedDouble size={16} color="white" />
                                            <span>1 cama doble</span>
                                          </>
                                        ) : (
                                          <>
                                            <BedSingle size={16} color="white" />
                                            <span>1 cama simple</span>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <span>Habitación Privada</span>
                                    )}
                                  </div>
                                </div>
                                <CardContent className="flex-1 p-4 md:w-2/3">
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {roomDetails?.name || "Habitación"} - {property?.name || "Propiedad desconocida"}
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-4">
                                    {property?.city}, {property?.state}, {property?.country}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                    <InfoItem
                                      icon={<Calendar />}
                                      label="Ingreso"
                                      value={format(parseISO(booking.checkIn), "PPP", { locale: es })}
                                    />
                                    <InfoItem
                                      icon={<Calendar />}
                                      label="Salida"
                                      value={format(parseISO(booking.checkOut), "PPP", { locale: es })}
                                    />
                                    <InfoItem icon={<Calendar />} label="Noches" value={nights} />

                                    {roomDetails?.isPrivate !== false && (
                                      <>
                                        <InfoItem icon={<Users />} label="Huéspedes" value={booking.guests} />
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Precio por noche"
                                          value={`$${booking.price} USD`}
                                        />
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Limpieza"
                                          value={`$${booking.cleaning} USD`}
                                        />
                                      </>
                                    )}

                                    {roomDetails?.isPrivate === false && (
                                      <>
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Precio por noche"
                                          value={`$${booking.price} USD`}
                                        />

                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Limpieza"
                                          value={`$${booking.cleaning} USD`}
                                        />
                                      </>
                                    )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                                    <div>
                                      <p className="text-xl font-semibold text-gray-900 mb-1">
                                        Total: ${calculateTotal(booking)} USD
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )}

                {/* Reservas Pasadas */}
                {past.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-bold text-gray-700">Reservas Pasadas</h2>
                        <p className="text-gray-500">Historial de estadías completadas ({past.length})</p>
                      </div>
                    </div>
                    <ul className="space-y-6">
                      {past.map((booking) => {
                        const roomDetails = booking.room
                        const property = booking.room.propertyId
                        const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))

                        return (
                          <li key={booking.id}>
                            <Card className="overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 border-l-4 border-gray-400 opacity-90">
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
                                    className="rounded-t-lg md:rounded-l-lg md:rounded-t-none grayscale-[20%]"
                                  />
                                  <div
                                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                                      roomDetails?.isPrivate === false
                                        ? "bg-amber-500 text-white"
                                        : "bg-emerald-500 text-white"
                                    }`}
                                  >
                                    {roomDetails?.isPrivate === false ? (
                                      <div className="flex items-center space-x-1">
                                        {roomDetails?.bedType === "double" ? (
                                          <>
                                            <BedDouble size={16} color="white" />
                                            <span>1 cama doble</span>
                                          </>
                                        ) : (
                                          <>
                                            <BedSingle size={16} color="white" />
                                            <span>1 cama simple</span>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <span>Habitación Privada</span>
                                    )}
                                  </div>
                                </div>
                                <CardContent className="flex-1 p-4 md:w-2/3">
                                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    {roomDetails?.name || "Habitación"} - {property?.name || "Propiedad desconocida"}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                    <InfoItem
                                      icon={<Calendar />}
                                      label="Ingreso"
                                      value={format(parseISO(booking.checkIn), "PPP", { locale: es })}
                                    />
                                    <InfoItem
                                      icon={<Calendar />}
                                      label="Salida"
                                      value={format(parseISO(booking.checkOut), "PPP", { locale: es })}
                                    />
                                    <InfoItem icon={<Calendar />} label="Noches" value={nights} />

                                    {roomDetails?.isPrivate !== false && (
                                      <>
                                        <InfoItem icon={<Users />} label="Huéspedes" value={booking.guests} />
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Precio por noche"
                                          value={`$${booking.price} USD`}
                                        />
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Limpieza"
                                          value={`$${booking.cleaning} USD`}
                                        />
                                      </>
                                    )}

                                    {roomDetails?.isPrivate === false && (
                                      <>
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Precio por noche"
                                          value={`$${booking.price} USD`}
                                        />
                                        <InfoItem
                                          icon={<DollarSign />}
                                          label="Limpieza"
                                          value={`$${booking.cleaning} USD`}
                                        />
                                      </>
                                    )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                                    <div>
                                      <p className="text-xl font-semibold text-gray-700 mb-1">
                                        Total: ${calculateTotal(booking)} USD
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => handleReviewClick(booking.id, booking.room.id)}
                                      className="bg-[#39759E] text-white hover:bg-[#2c5a7a] rounded-lg px-4 py-2 transition-colors duration-300 flex items-center text-sm"
                                    >
                                      <Star className="mr-1 h-4 w-4" />
                                      Comentar
                                    </Button>
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )}
              </>
            )
          })()}
        </div>
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

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-center">
    <div className="h-5 w-5 text-gray-500 mr-2">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
)

export default BookingList
