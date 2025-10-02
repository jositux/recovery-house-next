"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { Calendar, Users, DollarSign, BedSingle, BedDouble, Star, MapPin, User, Info } from "lucide-react"
import InfoItem from "./InfoItem"

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
  patientName?: string | null
  ownerName?: string | null
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


interface Room {
  id: string
  name: string
  isPrivate: boolean
  bedType: "single" | "double"
  bedName?: string
  beds: number
  capacity: number
  description?: string
  doubleBeds?: number
  singleBeds?: number
  photos: Photo[]
  propertyId: Property
}

interface BookingCardProps {
  booking: Booking
  isPast?: boolean
  onCancelBooking?: (bookingId: string) => void
  onPayBalance?: (bookingId: string, balanceAmount: string) => void
  onReviewClick?: (bookingId: string, roomId: string) => void
}

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
}

interface Photo {
  directus_files_id: {
    id: string
  }
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  isPast = false,
  onCancelBooking,
  onPayBalance,
  onReviewClick,
}) => {
  const roomDetails = booking.room
  const property = booking.room.propertyId
  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
  const isCurrentStay = new Date() >= new Date(booking.checkIn) && new Date() <= new Date(booking.checkOut)
  const isCancelled = booking.bookingState === "cancelled_by_patient" || booking.bookingState === "cancelled_by_owner"

  return (
    <Card
      className={`overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 ${
        roomDetails?.isPrivate === false ? "border-l-4 border-amber-500" : "border-l-4 border-emerald-500"
      } ${isCurrentStay && !isPast ? "ring-2 ring-emerald-400 ring-opacity-50" : ""} ${
        isCancelled ? "opacity-60 border-l-4 border-red-500" : ""
      } ${isPast ? "border-l-4 border-gray-400 opacity-90" : ""}`}
    >
      {isCancelled && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2">
          <p className="text-sm font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Reserva Anulada - {booking.cancelledMessage && `Motivo: ${booking.cancelledMessage}`}
          </p>
        </div>
      )}
      {isCurrentStay && !isCancelled && !isPast && (
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
            className={`rounded-t-lg md:rounded-l-lg md:rounded-t-none ${isPast ? "grayscale-[20%]" : ""}`}
          />
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
              roomDetails?.isPrivate === false ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
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
          <h3 className={`text-xl font-semibold mb-2 ${isPast ? "text-gray-700" : "text-gray-900"}`}>
            {roomDetails?.name || "Habitación"} - {property?.name || "Propiedad desconocida"}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <User className="h-4 w-4 mr-1" />
            <span>Propietario: {`${booking.ownerName}`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{`${property?.address} ${property?.city}. ${property?.state}. ${property?.country}`}</span>
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
                <InfoItem icon={<DollarSign />} label="Precio por noche" value={`$${booking.price} USD`} />
                <InfoItem icon={<DollarSign />} label="Limpieza" value={`$${booking.cleaning} USD`} />
              </>
            )}

            {roomDetails?.isPrivate === false && (
              <>
                <InfoItem icon={<DollarSign />} label="Precio por noche" value={`$${booking.price} USD`} />
                <InfoItem icon={<DollarSign />} label="Limpieza" value={`$${booking.cleaning} USD`} />
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
            {/* Payment details */}
            {!isPast && (
              <div>
                <div className="mb-4">
                  <p className="text-xl font-semibold text-gray-900 mb-1">
                    Total:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Number(booking.finalPrice))}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1">
                    {booking.paymentState === "prepayment" && (
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
            )}
            <div className="mt-2 sm:mt-0 flex gap-2">
              {!isPast && booking.paymentState === "prepayment" && !isCancelled && onPayBalance && (
                <Button
                  onClick={() => onPayBalance(booking.id, booking.balanceAmount || "0")}
                  className="bg-blue-600 hover:bg-blue-700 text-white mr-2"
                >
                  Pagar Saldo Pendiente
                </Button>
              )}

              {!isPast && !isCancelled && onCancelBooking && (
                <Button
                  variant="outline"
                  onClick={() => onCancelBooking(booking.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Anular Reserva
                </Button>
              )}

              {!isPast && isCancelled && (
                <div className="text-red-600 font-medium text-sm">
                  {booking.bookingState === "cancelled_by_patient"
                    ? "Anulado por el paciente"
                    : "Anulado por el propietario"}
                </div>
              )}

              {isPast && onReviewClick && (
                <Button
                  onClick={() => onReviewClick(booking.id, booking.room.id)}
                  className="bg-[#39759E] text-white hover:bg-[#2c5a7a] rounded-lg px-4 py-2 transition-colors duration-300 flex items-center text-sm"
                >
                  <Star className="mr-1 h-4 w-4" />
                  Comentar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default BookingCard
