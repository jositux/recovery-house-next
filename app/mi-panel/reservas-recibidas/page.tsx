"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/userService"
import { cancelBooking } from "@/services/BookingCancelService"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
//import ReviewModal from "@/components/booking-list/ReviewModal"
import {
  Calendar,
  Users,
  DollarSign,
  BedSingle,
  BedDouble,
  Loader2,
  Search,
  MapPin,
  User,
  X,
  Info,
} from "lucide-react"
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
  ownerId: string
  guests: number
  price: string
  finalPrice: string
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

  discountStayAmount: string | null
  prepaymentPercentageApplied: 10
  prepaymentAmount: string | null
  balanceAmount: string | null
  balancePaymentDate: string | null
  bookingDateUpdated: string | null
  bookingDateCreated: string | null
  discountStayType: string | null
  discountPercentageStayApplied: number | null
  numberOfNights: number | null
  prepaymentDate: string | null
  fullAmount: string | null
  fullPaymentDate: string | null
  cancelledById: string | null
  cancelledByType: string | null
  cancelledDate: string | null
  cancelledMessage: string | null
  bookingState: string | null
  paymentState: string | null
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  //const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  //const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  //const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  //let name = ""

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedCancelBookingId, setSelectedCancelBookingId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleCancelBooking = (bookingId: string) => {
    setSelectedCancelBookingId(bookingId)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (selectedCancelBookingId && cancelReason.trim()) {
      try {
        console.log("Cancelling booking:", selectedCancelBookingId, "Reason:", cancelReason)

        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
          console.error("No hay access_token")
          return
        }

        const bookingId = selectedCancelBookingId
        const selectedBooking = bookings.find((booking) => booking.id === selectedCancelBookingId)

        const payload = {
          cancelledById: selectedBooking?.ownerId || "", // Use ownerId from selected booking instead of hardcoded value
          cancelledDate: new Date().toISOString(),
          cancelledMessage: cancelReason,
        }

        const result = await cancelBooking(bookingId, payload, accessToken)
        console.log("Cancelación exitosa:", result)

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === selectedCancelBookingId
              ? {
                  ...booking,
                  cancelledById: selectedBooking?.ownerId || "",
                  bookingState: "cancelled_by_owner",
                  cancelledDate: new Date().toISOString(),
                  cancelledMessage: cancelReason,
                }
              : booking,
          ),
        )

        setIsCancelModalOpen(false)
        setShowSuccessModal(true)
        setCancelReason("")
        setSelectedCancelBookingId(null)
      } catch (error) {
        console.error("Error al cancelar la reserva:", error)
      }
    }
  }

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false)
    setCancelReason("")
    setSelectedCancelBookingId(null)
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
  }



  const separateBookingsByDate = (bookings: Booking[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas

    // Ordenar todas las reservas por bookingDateCreated (más recientes primero)
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.bookingDateCreated ? new Date(a.bookingDateCreated).getTime() : 0
      const dateB = b.bookingDateCreated ? new Date(b.bookingDateCreated).getTime() : 0
      return dateB - dateA // Orden descendente (más recientes primero)
    })

    const upcoming = sortedBookings.filter((booking) => {
      const checkoutDate = new Date(booking.checkOut)
      checkoutDate.setHours(0, 0, 0, 0)
      return checkoutDate >= today
    })

    const past = sortedBookings.filter((booking) => {
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
          console.log("No access token found, using mock data for demo")
          // Mock data for demonstration
          const mockBookings: Booking[] = [
            {
              id: "1",
              status: "active",
              checkIn: "2025-03-15",
              checkOut: "2025-03-20",
              patient: "patient1",
              ownerId: "owner1",
              guests: 2,
              price: "150",
              finalPrice: "780",
              cleaning: "30",
              patientName: "María González",
              room: {
                id: "room1",
                name: "Habitación Deluxe",
                roomNumber: "101",
                beds: 1,
                capacity: 2,
                description: "Habitación privada con vista al jardín",
                cleaningFee: "30",
                pricePerNight: "150",
                descriptionService: "Servicio completo de recuperación",
                isPrivate: true,
                singleBeds: 0,
                doubleBeds: 1,
                privateRoomPrice: "150",
                privateRoomCleaning: "30",
                sharedRoomPrice: "75",
                sharedRoomCleaning: "15",
                bedType: "double",
                bedName: "Cama King",
                photos: [
                  {
                    directus_files_id: {
                      id: "mock-photo-1",
                    },
                  },
                ],
                propertyId: {
                  id: "prop1",
                  name: "Casa de Recuperación Serenidad",
                  country: "México",
                  state: "Jalisco",
                  city: "Guadalajara",
                  address: "Av. Revolución 123",
                  fullAddress: "Av. Revolución 123, Guadalajara, Jalisco, México",
                  hostName: "Dr. Carlos Mendoza",
                  description: "Centro especializado en recuperación post-operatoria",
                  mainImage: "main1.jpg",
                  type: "recovery_center",
                },
              },
              discountStayAmount: "0",
              prepaymentPercentageApplied: 10,
              prepaymentAmount: "78",
              balanceAmount: "702",
              balancePaymentDate: "2025-03-10",
              bookingDateUpdated: "2025-01-15",
              bookingDateCreated: "2025-01-10",
              discountStayType: "short",
              discountPercentageStayApplied: 15,
              numberOfNights: 5,
              prepaymentDate: "2025-01-15",
              fullAmount: "780",
              fullPaymentDate: null,
              cancelledById: null,
              cancelledByType: null,
              cancelledDate: null,
              cancelledMessage: null,
              bookingState: "confirmed",
              paymentState: "partial",
            },
            {
              id: "2",
              status: "completed",
              checkIn: "2024-12-01",
              checkOut: "2024-12-10",
              patient: "patient2",
              ownerId: "owner2",
              guests: 1,
              price: "80",
              finalPrice: "735",
              cleaning: "15",
              patientName: "Juan Pérez",
              room: {
                id: "room2",
                name: "Cama Individual",
                roomNumber: "205",
                beds: 1,
                capacity: 1,
                description: "Cama en habitación compartida",
                cleaningFee: "15",
                pricePerNight: "80",
                descriptionService: "Servicio básico de recuperación",
                isPrivate: false,
                singleBeds: 1,
                doubleBeds: 0,
                privateRoomPrice: "150",
                privateRoomCleaning: "30",
                sharedRoomPrice: "80",
                sharedRoomCleaning: "15",
                bedType: "single",
                bedName: "Cama Individual",
                photos: [
                  {
                    directus_files_id: {
                      id: "mock-photo-2",
                    },
                  },
                ],
                propertyId: {
                  id: "prop2",
                  name: "Centro de Bienestar Esperanza",
                  country: "México",
                  state: "CDMX",
                  city: "Ciudad de México",
                  address: "Calle Reforma 456",
                  fullAddress: "Calle Reforma 456, Ciudad de México, CDMX, México",
                  hostName: "Dra. Ana López",
                  description: "Especialistas en cuidados post-quirúrgicos",
                  mainImage: "main2.jpg",
                  type: "medical_center",
                },
              },
              discountStayAmount: "65",
              prepaymentPercentageApplied: 10,
              prepaymentAmount: "73.5",
              balanceAmount: "661.5",
              balancePaymentDate: "2024-11-25",
              bookingDateUpdated: "2024-11-20",
              bookingDateCreated: "2024-11-15",
              discountStayType: "medium",
              discountPercentageStayApplied: 10,
              numberOfNights: 9,
              prepaymentDate: "2024-11-20",
              fullAmount: "735",
              fullPaymentDate: "2024-12-01",
              cancelledById: null,
              cancelledByType: null,
              cancelledDate: null,
              cancelledMessage: null,
              bookingState: "completed",
              paymentState: "prepayment",
            },
          ]

         // name = "Usuario Demo"
          setBookings(mockBookings)
          setIsLoading(false)
          return
        }

        const user = await getCurrentUser(token)
       // name = user.first_name

        const bookingsResponse = await fetch(
          `/webapi/items/Booking?filter[ownerId][_eq]=${user.id}&fields=*, +room.*, +room.photos.directus_files_id.id, +room.propertyId.*&sort=-bookingDateCreated`,
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

 /* const handleReviewClick = (bookingId: string, roomId: string) => {
    setSelectedBookingId(bookingId)
    setSelectedRoomId(roomId)
    setIsReviewModalOpen(true)
  }*/

  

  /*const handleReviewSubmit = async (ranking: number, comment: string) => {
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
  }*/

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
    <div className="container mx-auto py-4 px-4 sm:px-4 lg:px-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Reservas Recibidas</h1>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">¡Reserva Anulada Exitosamente!</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                La reserva ha sido anulada correctamente. La devolución del dinero se procesará conforme a las políticas
                de reembolso establecidas por la plataforma. Ante cualquier consulta o aclaración, por favor comuníquese
                directamente con el equipo de soporte de la plataforma.
              </p>
            </div>
            <Button onClick={handleSuccessModalClose} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Aceptar
            </Button>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">¿Está seguro que desea anular la reserva?</h3>
              <button onClick={handleCancelModalClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Ingrese el motivo de la cancelación..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancelModalClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Anular Reserva
              </Button>
            </div>
          </div>
        </div>
      )}

 

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
                              } ${isCurrentStay ? "ring-2 ring-emerald-400 ring-opacity-50" : ""} ${
                                booking.bookingState === "cancelled_by_patient" ||
                                booking.bookingState === "cancelled_by_owner"
                                  ? "opacity-60 border-l-4 border-red-500"
                                  : ""
                              }`}
                            >
                              {(booking.bookingState === "cancelled_by_patient" ||
                                booking.bookingState === "cancelled_by_owner") && (
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2">
                                  <p className="text-sm font-medium flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    Reserva Anulada -{" "}
                                    {booking.cancelledMessage && `Motivo: ${booking.cancelledMessage}`}
                                  </p>
                                </div>
                              )}
                              {isCurrentStay &&
                                booking.bookingState !== "cancelled_by_patient" &&
                                booking.bookingState !== "cancelled_by_owner" && (
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
                                  <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <User className="h-4 w-4 mr-1" />
                                    <span>Paciente: {`${booking.patientName}`}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>
                                      {`${property?.address} ${property?.city}. ${property?.state}. ${property?.country}`}
                                    </span>
                                  </div>
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
                                    <InfoItem
                                      icon={<Calendar />}
                                      label={`${nights} Noches`}
                                      value={
                                        booking.discountStayType &&
                                        booking.discountStayType !== "short" &&
                                        booking.discountPercentageStayApplied !== null
                                          ? `${booking.discountPercentageStayApplied}% de descuento`
                                          : nights
                                      }
                                    />

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
                                    {/* Detalles de pago */}
                                    <div>
                                      <div className="mb-4">
                                        {/* Total general */}
                                        <p className="text-xl font-semibold text-gray-900 mb-1">
                                          Total:{" "}
                                          {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          }).format(Number(booking.finalPrice))}
                                        </p>

                                        {/* Detalles de pago */}
                                        <div className="text-sm text-gray-500 space-y-1">
                                          {booking.paymentState === "prepayment" && (
                                            <>
                                              <p>
                                                Pagado 10%:{" "}
                                                {new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                                }).format(Number(booking.prepaymentAmount))}
                                                . Pendiente:{" "}
                                                {new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                                }).format(Number(booking.balanceAmount))}
                                              </p>
                                            </>
                                          )}

                                          {booking.paymentState === "fullpayment" && <p>Pagado 100%</p>}

                                          {booking.paymentState === "balancepayment" && (
                                            <>
                                              <p>
                                                Pagado anticipo:{" "}
                                                {new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                                }).format(Number(booking.prepaymentAmount))}
                                              </p>
                                              <p>
                                                Pagado pendiente:{" "}
                                                {new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                                }).format(Number(booking.balanceAmount))}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex gap-2">
                                     

                                      {booking.bookingState !== "cancelled_by_patient" &&
                                        booking.bookingState !== "cancelled_by_owner" && (
                                          <Button
                                            variant="outline"
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                          >
                                            Anular Reserva
                                          </Button>
                                        )}
                                      {(booking.bookingState === "cancelled_by_patient" ||
                                        booking.bookingState === "cancelled_by_owner") && (
                                        <div className="text-red-600 font-medium text-sm">
                                          {booking.bookingState === "cancelled_by_patient"
                                            ? "Anulado por el paciente"
                                            : "Anulado por el propietario"}
                                        </div>
                                      )}
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
                                  <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>
                                      {`${property?.address} ${property?.city}. ${property?.state}. ${property?.country}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <User className="h-4 w-4 mr-1" />
                                    <span>Paciente: {`${booking.patientName}`}</span>
                                  </div>

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
                                    <InfoItem
                                      icon={<Calendar />}
                                      label={`${nights} Noches`}
                                      value={
                                        booking.discountStayType &&
                                        booking.discountStayType !== "short" &&
                                        booking.discountPercentageStayApplied !== null
                                          ? `${booking.discountPercentageStayApplied}% de descuento`
                                          : nights
                                      }
                                    />

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

                                  {/*
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                                    <Button
                                      onClick={() => handleReviewClick(booking.id, booking.room.id)}
                                      className="bg-[#39759E] text-white hover:bg-[#2c5a7a] rounded-lg px-4 py-2 transition-colors duration-300 flex items-center text-sm"
                                    >
                                      <Star className="mr-1 h-4 w-4" />
                                      Comentar
                                    </Button>
                                  </div>
                                    */}
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
      {/*<ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        bookingId={selectedBookingId || ""}
        />*/}
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
