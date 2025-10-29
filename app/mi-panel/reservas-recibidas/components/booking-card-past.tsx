"use client"

import { Card, CardContent } from "@/components/ui/card"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import {
  Calendar,
  Users,
  DollarSign,
  BedSingle,
  BedDouble,
  MapPin,
  User,
  Info,
} from "lucide-react"
import { InfoItem } from "./info-item"
import { useRouter } from "next/navigation";

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
  modificationCount: number
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


interface PaymentDisplayValues {
  shownAnticipo: number;
  shownPendiente: number;
  modificationDiff: number | null;
}

interface BookingCardProps {
  booking: Booking
  review?: ReviewFromAPI | null
  paymentDisplay: PaymentDisplayValues
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
  paymentDisplay,
  isPast = false,
  //onCancelBooking,
  //onPayBalance,
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


  const router = useRouter();

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
        <div className="relative w-full md:w-1/3 h-48 md:h-auto">
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

  {/* Badge */}
  <div
    className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium ${
      roomDetails?.isPrivate === false ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
    }`}
  >
    {roomDetails?.isPrivate === false ? (
      <div className="flex items-center space-x-1">
        {roomDetails?.bedType === "double" ? (
          <>
            <BedDouble size={14} color="white" />
            <span>1 cama doble</span>
          </>
        ) : (
          <>
            <BedSingle size={14} color="white" />
            <span>1 cama sencilla</span>
          </>
        )}
      </div>
    ) : (
      <span>Habitación Privada</span>
    )}
  </div>

  {/* Overlay clickeable */}
  <div
    className="absolute inset-0 cursor-pointer"
    onClick={() => router.push(`/rooms/${booking.room.id}`)}
  />
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
              <span>Paciente: {booking.patientName}</span>
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
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900 mb-0.5">
                Total:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(booking.finalPrice))}
              </p>

              <div className="text-xs text-gray-500">
                {booking.paymentState === "balancepayment" ||
                  (booking.paymentState === "pendingRefund" && (
                    <p>Pagó anticipo: ${booking.prepaymentAmount}</p>
                  ))}

                {booking.paymentState === "fullpayment" &&
                  booking.modificationCount === 1 &&
                  paymentDisplay.modificationDiff !== null && (
                    <p>
                      {paymentDisplay.modificationDiff < 0
                        ? "Pagó por modificación: "
                        : "Crédito por modificación: "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Math.abs(paymentDisplay.modificationDiff))}
                    </p>
                  )}

                {booking.paymentState === "prepayment" &&
                  booking.modificationCount === 0 && (
                    <p>
                      Anticipo:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(paymentDisplay.shownAnticipo)}{" "}
                      | Pendiente:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(paymentDisplay.shownPendiente)}
                    </p>
                  )}

                {booking.paymentState === "prepayment" &&
                  booking.modificationCount === 1 && (
                    <p>
                      Anticipo:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(paymentDisplay.shownAnticipo)}{" "}
                      | Pendiente:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(paymentDisplay.shownPendiente)}
                    </p>
                  )}
              </div>
            </div>
            
          </CardContent>
        </div>
      </Card>

     
    </>
  )
}
