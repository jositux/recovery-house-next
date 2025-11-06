"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
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
} from "lucide-react";
import { InfoItem } from "./info-item";
import { useState, useEffect } from "react";
import { ReviewModal } from "./ReviewModal";
import { ReviewCard } from "./ReviewCard";
import { useRouter } from "next/navigation";

interface Photo {
  directus_files_id: {
    id: string;
  };
}

interface Property {
  id: string;
  name: string;
  country: string;
  state: string;
  city: string;
  address: string;
  fullAddress: string;
  hostName: string;
  description: string;
  mainImage: string;
  type: string;
}

interface Room {
  id: string;
  name: string;
  roomNumber: string;
  beds: number;
  capacity: number;
  description: string;
  cleaningFee: string;
  pricePerNight: string;
  descriptionService: string;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  privateRoomPrice: string;
  privateRoomCleaning: string;
  sharedRoomPrice: string;
  sharedRoomCleaning: string;
  bedType: string;
  bedName: string;
  photos: Photo[];
  propertyId: Property;
}

interface Booking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  checkInHour: string;
  checkOutHour: string;
  patient: string;
  ownerId: string;
  guests: number;
  price: string;
  finalPrice: string;
  cleaning: string;
  room: Room;
  roomName?: string | null;
  roomDescription?: string | null;
  propertyName?: string | null;
  paymentId?: string | null;
  ownerName?: string | null;
  patientName?: string | null;
  isPrivate?: boolean;
  singleBeds?: number | null;
  doubleBeds?: number | null;
  singleBedPrice?: string | null;
  doubleBedPrice?: string | null;
  singleBedCleaningPrice?: string | null;
  doubleBedCleaningPrice?: string | null;
  discountStayAmount: string | null;
  prepaymentPercentageApplied: number;
  prepaymentAmount: string | null;
  balanceAmount: string | null;
  balancePaymentDate: string | null;
  bookingDateUpdated: string | null;
  bookingDateCreated: string | null;
  discountStayType: string | null;
  discountPercentageStayApplied: number | null;
  numberOfNights: number | null;
  prepaymentDate: string | null;
  fullAmount: string | null;
  fullPaymentDate: string | null;
  cancelledById: string | null;
  cancelledByType: string | null;
  cancelledDate: string | null;
  cancelledMessage: string | null;
  bookingState: string | null;
  paymentState: string | null;
  modificationCount: number;
  prepaymentModificationAmount: number;
  refundAmount: string | null;
}

interface PaymentDisplayValues {
  shownAnticipo: number;
  shownPendiente: number;
  modificationDiff: number | null;
}

interface Ratings {
  cleanliness: number;
  attention: number;
  location: number;
  accuracy: number;
}

interface ReviewFromAPI {
  id: string;
  bookingId: string;
  roomId: string;
  name: string;
  comment: string;
  ranking: Ratings; // 👈 viene del backend
  status: string;
  dateCreated: string;
  //review_replies: any[]
}

interface Review {
  ratings: Ratings;
  comment: string;
}

interface PaymentDisplayValues {
  shownAnticipo: number;
  shownPendiente: number;
  modificationDiff: number | null;
}

interface BookingCardProps {
  booking: Booking;
  review?: ReviewFromAPI | null;
  isPast?: boolean;
  paymentDisplay: PaymentDisplayValues;
  onCancelBooking?: (bookingId: string) => void;
  onPayBalance?: (bookingId: string, balanceAmount: string) => void;
  onReviewSubmit?: (
    bookingId: string,
    roomId: string,
    name: string,
    ratings: Ratings,
    comment: string
  ) => Promise<void>;
  onReviewDelete?: (bookingId: string) => Promise<void>;
}

// ✅ función universal para obtener una fecha local correcta
/*const toLocalDateFromString = (isoOrDateString: string | undefined): Date => {
  if (!isoOrDateString) return new Date(0)
  const datePart = isoOrDateString.split("T")[0]
  const [y, m, d] = datePart.split("-").map(Number)
  return new Date(y, m - 1, d) // medianoche local sin UTC shift
}*/

const toLocalDateFromString = (isoOrDateString: string | undefined): Date => {
  if (!isoOrDateString) return new Date(0);
  const datePart = isoOrDateString.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d); // medianoche local sin UTC shift
};

const combineDateAndTime = (dateString: string, timeString: string): Date => {
  // Extraer la fecha del dateString
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);

  // Extraer hora, minutos y segundos del timeString (formato "16:00:00")
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // Crear fecha completa con hora exacta
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

export const BookingCardPast = ({
  booking,
  review,
  isPast = false,
  //onCancelBooking,
  //onPayBalance,
  paymentDisplay,
  onReviewSubmit,
  onReviewDelete,
}: BookingCardProps) => {
  const roomDetails = booking.room;
  const property = booking.room.propertyId;

  const checkInDate = toLocalDateFromString(booking.checkIn);
  const checkOutDate = toLocalDateFromString(booking.checkOut);

  const nights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const checkInDateTime = combineDateAndTime(
    booking.checkIn,
    booking.checkInHour
  );
  const checkOutDateTime = combineDateAndTime(
    booking.checkOut,
    booking.checkOutHour
  );

  const now = new Date();
  const isCurrentStay = now >= checkInDateTime && now <= checkOutDateTime;

  const isCancelled =
    booking.bookingState === "cancelled_by_patient" ||
    booking.bookingState === "cancelled_by_owner" ||
    booking.bookingState === "cancelled_by_system";

  const cancelledByMap: Record<string, string> = {
    cancelled_by_patient: "Anulado por el paciente",
    cancelled_by_owner: "Anulado por el propietario",
    cancelled_by_system: "Anulado por la plataforma",
  };

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [reviewData, setReviewData] = useState<Review | null>(null);

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
      };

      setReviewData(formattedReview);
      setHasReview(true);
    } else {
      setReviewData(null);
      setHasReview(false);
    }
  }, [review]);

  const handleReviewSubmit = async (ratings: Ratings, comment: string) => {
    if (onReviewSubmit) {
      await onReviewSubmit(
        booking.id,
        booking.room.id,
        booking.patientName || "",
        ratings,
        comment
      );
      setHasReview(true);
      setReviewData({ ratings, comment });
      setIsReviewModalOpen(false);
    }
  };

  const handleDeleteReview = async () => {
    if (onReviewDelete) {
      await onReviewDelete(booking.id);
      setHasReview(false);
      setReviewData(null);
    }
  };

  const router = useRouter();

  const getPaymentBadge = () => {
    if (
      booking.paymentState === "fullpayment" ||
      booking.paymentState === "balancepayment"
    ) {
      return <Badge className="bg-green-500 text-white">Pagado 100%</Badge>;
    }
    if (
      booking.paymentState === "prepayment" &&
      booking.modificationCount === 0
    ) {
      return <Badge className="bg-yellow-500 text-white">Anticipo 10%</Badge>;
    }
    return null;
  };

  return (
    <>
      <Card
        className={`overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300 ${
          roomDetails?.isPrivate === false
            ? "border-l-4 gray-900"
            : "border-l-4 gray-900"
        } ${isCurrentStay ? "ring-2 ring-emerald-400 ring-opacity-50" : ""} ${
          isCancelled ? "opacity-60 border-l-4 border-red-500" : ""
        }`}
      >
        {isCancelled && (
          <div className="bg-gradient-to-r from-gray-500 to-red-600 text-white px-3 py-1.5">
            <p className="text-xs font-medium flex items-center">
              <Info className="w-3 h-3 mr-1.5" />
              Reserva Anulada{" "}
              {booking.cancelledMessage &&
                `- Motivo: ${booking.cancelledMessage}`}
            </p>
          </div>
        )}

        {isCurrentStay && !isCancelled && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5">
            <p className="text-xs font-medium flex items-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
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

            <div
              className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                roomDetails?.isPrivate === false
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500 text-white"
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

            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => router.push(`/rooms/${booking.room.id}`)}
            />
          </div>

          <CardContent className="flex-1 p-3 md:w-2/3">
            <div className="flex items-start justify-between mb-1.5">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">
                {roomDetails?.name || "Habitación"} -{" "}
                {property?.name || "Propiedad desconocida"}
              </h3>
              {getPaymentBadge()}
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-2">
              <User className="h-3 w-3 mr-1" />
              <span>Propietario: {`${booking.ownerName}`}</span>
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{`${property?.address} ${property?.city}. ${property?.state}. ${property?.country}`}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
              <InfoItem
                icon={<Calendar />}
                label="Estadía"
                value={`${format(checkInDate, "dd MMM", {
                  locale: es,
                })} → ${format(checkOutDate, "dd MMM", { locale: es })}`}
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
                  <InfoItem
                    icon={<Users />}
                    label="Huéspedes"
                    value={booking.guests}
                  />
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

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mt-3 pt-3 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 mb-0.5">
                  Total:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(booking.finalPrice))}
                </p>

                {/* Estado de pagos */}
                <div className="text-xs text-gray-500">
                  {booking.paymentState === "balancepayment" ||
                    (booking.paymentState === "pendingRefund" && (
                      <p>Pagó anticipo: ${booking.prepaymentAmount}</p>
                    ))}

                  {booking.paymentState === "prepayment" && (
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

              {/* BOTONES */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {booking.modificationCount === 1 && (
                  <span className="inline-block px-2 py-2 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">
                    Modificado
                  </span>
                )}

                {isCancelled && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-red-600 bg-gray-100 rounded-full">
                    {cancelledByMap[booking.bookingState ?? ""] || "Anulado"}
                  </span>
                )}
              </div>
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
  );
};
