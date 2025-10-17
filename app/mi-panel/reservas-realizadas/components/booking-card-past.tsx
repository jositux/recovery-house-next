"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import {
  Calendar,
  Users,
  DollarSign,
  BedSingle,
  BedDouble,
  Star,
  MapPin,
  User,
  Info,
} from "lucide-react"
import { InfoItem } from "./info-item"
import { useState, useEffect } from "react"
import { ReviewModal } from "./ReviewModal"
import { ReviewCard } from "./ReviewCard"

interface Photo {
  directus_files_id: {
    id: string
  }
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
  privateRoomPrice: string
  privateRoomCleaning: string
  sharedRoomPrice: string
  sharedRoomCleaning: string
  bedType: string
  bedName: string
  photos: Photo[]
  propertyId: Property
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

interface Ratings {
  cleanliness: number
  attention: number
  location: number
  accuracy: number
}

interface ReviewFromAPI {
  id: string
  bookingId: string
  roomId: string
  name: string
  comment: string
  ranking: Ratings // 👈 viene del backend
  status: string
  dateCreated: string
  //review_replies: any[]
}

interface Review {
  ratings: Ratings
  comment: string
}

interface BookingCardProps {
  booking: Booking
  review?: ReviewFromAPI | null
  isPast?: boolean
  onCancelBooking?: (bookingId: string) => void
  onPayBalance?: (bookingId: string, balanceAmount: string) => void
  onReviewSubmit?: (
    bookingId: string,
    roomId: string,
    name: string,
    ratings: Ratings,
    comment: string
  ) => Promise<void>
  onReviewDelete?: (bookingId: string) => Promise<void>
}

export const BookingCardPast = ({
  booking,
  review,
  isPast = false,
  //onCancelBooking,
  //onPayBalance,
  onReviewSubmit,
  onReviewDelete,
}: BookingCardProps) => {
  const roomDetails = booking.room
  const property = booking.room.propertyId
  const nights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  )
  const isCurrentStay =
    new Date() >= new Date(booking.checkIn) &&
    new Date() <= new Date(booking.checkOut)
  const isCancelled =
    booking.bookingState === "cancelled_by_patient" ||
    booking.bookingState === "cancelled_by_owner"

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [hasReview, setHasReview] = useState(false)
  const [reviewData, setReviewData] = useState<Review | null>(null)

  // ✅ Inicializa reviewData sin provocar re-render infinito
  useEffect(() => {
    if (review) {
      const formattedReview: Review = {
        ratings: {
          cleanliness: review?.ranking?.cleanliness ?? 0,
          attention: review?.ranking?.attention ?? 0,
          location: review?.ranking?.location ?? 0,
          accuracy: review?.ranking?.accuracy ?? 0,
        },
        comment: review?.comment ?? "",
      }

      setReviewData(formattedReview)
      setHasReview(true)
    } else {
      setReviewData(null)
      setHasReview(false)
    }
  }, [review])

  const handleReviewSubmit = async (ratings: Ratings, comment: string) => {
    if (onReviewSubmit) {
      await onReviewSubmit(
        booking.id,
        booking.room.id,
        booking.patientName || "",
        ratings,
        comment
      )
      setHasReview(true)
      setReviewData({ ratings, comment })
      setIsReviewModalOpen(false)
    }
  }

  const handleDeleteReview = async () => {
    if (onReviewDelete) {
      await onReviewDelete(booking.id)
      setHasReview(false)
      setReviewData(null)
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 ${
          roomDetails?.isPrivate === false
            ? "border-l-4 border-amber-500"
            : "border-l-4 border-emerald-500"
        } ${isCurrentStay && !isPast ? "ring-2 ring-emerald-400 ring-opacity-50" : ""} ${
          isCancelled ? "opacity-60 border-l-4 border-red-500" : ""
        } ${isPast ? "border-l-4 border-gray-400 opacity-90" : ""}`}
      >
        {isCancelled && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2">
            <p className="text-sm font-medium flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Reserva Anulada{" "}
              {booking.cancelledMessage && `- Motivo: ${booking.cancelledMessage}`}
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
              className={`rounded-t-lg md:rounded-l-lg md:rounded-t-none ${
                isPast ? "grayscale-[20%]" : ""
              }`}
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
            <h3
              className={`text-xl font-semibold mb-2 ${
                isPast ? "text-gray-700" : "text-gray-900"
              }`}
            >
              {roomDetails?.name || "Habitación"} -{" "}
              {property?.name || "Propiedad desconocida"}
            </h3>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <User className="h-4 w-4 mr-1" />
              <span>Propietario: {booking.ownerName}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {property?.address} {property?.city}. {property?.state}.{" "}
                {property?.country}
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
              <InfoItem icon={<Calendar />} label={`${nights} Noches`} value={nights} />

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
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
              {isPast && !hasReview && (
                <Button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-[#39759E] text-white hover:bg-[#2c5a7a] rounded-lg px-4 py-2 transition-colors duration-300 flex items-center text-sm"
                >
                  <Star className="mr-1 h-4 w-4" />
                  Comentar
                </Button>
              )}

              {isPast && hasReview && reviewData && (
                <ReviewCard
                  ratings={reviewData.ratings}
                  comment={reviewData.comment}
                  onDelete={handleDeleteReview}
                />
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {isPast && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          bookingId={booking.id}
        />
      )}
    </>
  )
}
