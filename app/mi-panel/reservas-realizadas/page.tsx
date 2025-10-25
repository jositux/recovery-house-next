"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/userService";
import { cancelBooking } from "@/services/BookingCancelService";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Home, Search, CheckCircle2 } from "lucide-react";
import { BookingCard } from "./components/booking-card";
import { BookingCardPast } from "./components/booking-card-past";
import { CancelBookingModal } from "./components/cancel-booking-modal";
import { SuccessModal } from "./components/success-modal";
import { PaymentModal } from "./components/payment-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

interface Photo {
  directus_files_id: {
    id: string;
  };
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

interface Booking {
  id: string;
  status: string;
  checkOut: string;
  checkIn: string;
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
  prepaymentPercentageApplied: 10;
  prepaymentAmount: string | null;
  balanceAmount: string | null;
  balancePaymentDate: string | null;
  bookingDateUpdated: string | null;
  bookingDateCreated: string | null;
  discountStayType: string | null;
  discountPercentageStayApplied: number | null;
  modificationCount: number;
  prepaymentModificationAmount: number;
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
  review?: Review | null;
  outstandingBalanceAmount: string | null;
  refundAmount: string | null;
  paymentReceivedAmount: string | null;
}

interface Ratings {
  cleanliness: number;
  attention: number;
  location: number;
  accuracy: number;
}

interface Review {
  id: string;
  bookingId: string;
  roomId: string;
  name: string;
  comment: string;
  ranking: Ratings; // 👈 así viene del backend
  status: string;
  dateCreated: string;
  //review_replies: any[]
}

interface PaymentDisplayValues {
  shownAnticipo: number;
  shownPendiente: number;
  modificationDiff: number | null;
}

const BookingList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedCancelBookingId, setSelectedCancelBookingId] = useState<
    string | null
  >(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentBookingId, setSelectedPaymentBookingId] = useState<
    string | null
  >(null);
  const [selectedBalanceAmount, setSelectedBalanceAmount] =
    useState<string>("");
  const [showModifySuccessDialog, setShowModifySuccessDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCancelBooking = (bookingId: string) => {
    setSelectedCancelBookingId(bookingId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedCancelBookingId && cancelReason.trim()) {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          console.error("No hay access_token");
          return;
        }

        const bookingId = selectedCancelBookingId;
        const selectedBooking = bookings.find(
          (booking) => booking.id === selectedCancelBookingId
        );

        const payload = {
          cancelledById: selectedBooking?.patient || "",
          cancelledDate: new Date().toISOString(),
          cancelledMessage: cancelReason,
        };

        const result = await cancelBooking(bookingId, payload, accessToken);
        console.log("Cancelación exitosa:", result);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === selectedCancelBookingId
              ? {
                  ...booking,
                  cancelledById: selectedBooking?.patient || "",
                  bookingState: "cancelled_by_patient",
                  cancelledDate: new Date().toISOString(),
                  cancelledMessage: cancelReason,
                }
              : booking
          )
        );

        setIsCancelModalOpen(false);
        setShowSuccessModal(true);
        setCancelReason("");
        setSelectedCancelBookingId(null);
      } catch (error) {
        console.error("Error al cancelar la reserva:", error);
      }
    }
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setCancelReason("");
    setSelectedCancelBookingId(null);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handlePayBalance = (bookingId: string, balanceAmount: string) => {
    setSelectedPaymentBookingId(bookingId);
    setSelectedBalanceAmount(balanceAmount);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (selectedPaymentBookingId) {
      try {
        const booking = bookings.find((b) => b.id === selectedPaymentBookingId);
        if (!booking) {
          console.error("Booking not found");
          return;
        }

        const paymentDisplay = calculatePaymentDisplay(booking);
        const correctPaymentAmount = paymentDisplay.shownPendiente;

        const newEntry = {
          bookingId: booking.id,
          description: booking.roomDescription,
          paymentAmount: correctPaymentAmount.toString(), // Use calculated amount instead of raw balanceAmount
          paymentDate: new Date().toISOString(),
          paymentType: "balancepayment",
        };

        localStorage.setItem("bookingBalanced", JSON.stringify(newEntry));

        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b.id === selectedPaymentBookingId
              ? {
                  ...b,
                  paymentState: "balancepayment",
                  paymentDate: new Date().toISOString(),
                  balanceAmount: b.balanceAmount,
                }
              : b
          )
        );

        setIsPaymentModalOpen(false);
        setSelectedPaymentBookingId(null);
        setSelectedBalanceAmount("");

        router.push("/checkout-balanced");
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    }
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentBookingId(null);
    setSelectedBalanceAmount("");
  };

  const handleReviewSubmit = async (
    bookingId: string,
    roomId: string,
    name: string,
    ratings: Ratings,
    comment: string
  ) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) throw new Error("No access token found");

      const response = await fetch("/webapi/items/Reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          roomId: roomId,
          name,
          ranking: ratings,
          comment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      console.log("[v0] Review submitted successfully for booking:", bookingId);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleReviewDelete = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(
        `/webapi/items/Reviews?filter[bookingId][_eq]=${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const reviewId = data.data[0].id;

        const deleteResponse = await fetch(
          `/webapi/items/Reviews/${reviewId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!deleteResponse.ok) throw new Error("Failed to delete review");

        console.log("[v0] Review deleted successfully for booking:", bookingId);
      } else {
        console.warn("No review found for booking:", bookingId);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const separateBookingsByDate = (bookings: Booking[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.bookingDateCreated
        ? new Date(a.bookingDateCreated).getTime()
        : 0;
      const dateB = b.bookingDateCreated
        ? new Date(b.bookingDateCreated).getTime()
        : 0;
      return dateB - dateA;
    });

    const upcoming = sortedBookings.filter((booking) => {
      const checkoutDate = new Date(booking.checkOut);
      checkoutDate.setHours(0, 0, 0, 0);
      return checkoutDate >= today;
    });

    const past = sortedBookings.filter((booking) => {
      const checkoutDate = new Date(booking.checkOut);
      checkoutDate.setHours(0, 0, 0, 0);
      return checkoutDate < today;
    });

    return { upcoming, past };
  };

  const calculatePaymentDisplay = (booking: Booking): PaymentDisplayValues => {
    const prepayment = Number(booking.prepaymentAmount);
    //const prepaymentMod = Number(booking.prepaymentModificationAmount)
    // const balance = Number(booking.balanceAmount)
    const fullAmount = Number(booking.fullAmount);
    const finalPrice = Number(booking.finalPrice);

    if (
      booking.paymentState === "fullpayment" &&
      booking.modificationCount === 1
    ) {
      const diff = fullAmount - finalPrice;
      return {
        shownAnticipo: 0,
        shownPendiente: 0,
        modificationDiff: diff !== 0 ? diff : null,
      };
    }

    if (
      booking.paymentState === "prepayment" &&
      booking.modificationCount === 1
    ) {
      const shownAnticipo = Number(booking.paymentReceivedAmount);
      const shownPendiente = Number(booking.outstandingBalanceAmount);

      return {
        shownAnticipo,
        shownPendiente,
        modificationDiff: null,
      };
    }

    if (
      booking.paymentState === "prepayment" &&
      booking.modificationCount === 0
    ) {
      return {
        shownAnticipo: prepayment,
        shownPendiente: Number(booking.outstandingBalanceAmount),
        modificationDiff: null,
      };
    }

    return {
      shownAnticipo: 0,
      shownPendiente: 0,
      modificationDiff: null,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.log("No access token found, using mock data for demo");
          setIsLoading(false);
          return;
        }

        const user = await getCurrentUser(token);

        const bookingsResponse = await fetch(
          `/webapi/items/Booking?filter[patient][_eq]=${user.id}&fields=*, +room.*, +room.photos.directus_files_id.id, +room.propertyId.*&sort=-bookingDateCreated`
        );
        const bookingsData = await bookingsResponse.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingsWithReviews = await Promise.all(
          bookingsData.data.map(async (booking: Booking) => {
            try {
              const checkOutDate = new Date(booking.checkOut);

              if (checkOutDate >= today) {
                return { ...booking, review: null };
              }

              const reviewResponse = await fetch(
                `/webapi/items/Reviews?filter[bookingId][_eq]=${booking.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!reviewResponse.ok) {
                console.warn(
                  `Failed to fetch review for booking ${booking.id}:`,
                  reviewResponse.status
                );
                return { ...booking, review: null };
              }

              const reviewData = await reviewResponse.json();

              console.log(
                "[v0] Review data for booking:",
                booking.id,
                reviewData
              );

              booking.review = reviewData;

              return {
                ...booking,
                review: reviewData?.data?.[0] ?? null,
              };
            } catch (error) {
              console.error(
                `Error fetching review for booking ${booking.id}:`,
                error
              );
              return { ...booking, review: null };
            }
          })
        );

        setBookings(bookingsWithReviews);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Error al cargar las reservas. Por favor, intente de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const rel = searchParams.get("rel");
    if (rel === "modify") {
      setShowModifySuccessDialog(true);
    }
  }, [searchParams]);

  const handleModifySuccessClose = () => {
    setShowModifySuccessDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-gray-700">
          Cargando mis reservas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-4 lg:px-0">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleConfirmCancel}
        onClose={handleCancelModalClose}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        balanceAmount={selectedBalanceAmount}
        onConfirm={handleConfirmPayment}
        onClose={handlePaymentModalClose}
      />

      <Dialog
        open={showModifySuccessDialog}
        onOpenChange={setShowModifySuccessDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              ¡Modificación Exitosa!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Se ha modificado la reserva exitosamente. Puedes ver todas las
              reservas que tienes hechas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleModifySuccessClose}
              className="w-full sm:w-auto px-8"
            >
              Ver Reservas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {bookings.length === 0 ? (
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="container min-h-screen mx-auto p-4 py-16">
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
                <div className="w-20 h-20 rounded-full bg-[#39759E]/10 flex items-center justify-center">
                  <Home className="w-10 h-10 text-[#39759E]" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    ¡Encuentra tu espacio ideal para una recuperación tranquila!
                  </h1>
                  <p className="text-base text-gray-600 max-w-md mx-auto">
                    Aún no tienes reservas, pero estamos aquí para ayudarte a
                    encontrar la casa de recuperación perfecta para tu proceso
                    de sanación y bienestar.{" "}
                  </p>{" "}
                </div>

                <Button
                  size="lg"
                  className="mt-4 px-8 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#39759E" }}
                  onClick={() => router.push("/rooms")}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Buscar casa de recuperación
                </Button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="space-y-12">
          <h1
            className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
          >
            Mis Reservas
          </h1>

          {(() => {
            const { upcoming, past } = separateBookingsByDate(bookings);

            return (
              <>
                {upcoming.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h2
                          className={`${fraunces.className} text-2xl font-normal text-[#162F40]`}
                        >
                          Próximas Reservas
                        </h2>

                        <p className="text-gray-600">
                          Reservas activas y futuras ({upcoming.length})
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-6">
                      {upcoming.map((booking) => {
                        const paymentDisplay = calculatePaymentDisplay(booking);

                        return (
                          <li key={booking.id}>
                            <BookingCard
                              booking={booking}
                              paymentDisplay={paymentDisplay}
                              onCancelBooking={handleCancelBooking}
                              onPayBalance={handlePayBalance}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {past.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h2
                          className={`${fraunces.className} text-2xl font-normal text-[#162F40]`}
                        >
                          Próximas Pasadas
                        </h2>
                        <p className="text-gray-500">
                          Historial de estadías completadas ({past.length})
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-6">
                      {past.map((booking) => (
                        <li key={booking.id}>
                          <BookingCardPast
                            booking={booking}
                            review={booking.review}
                            isPast
                            onReviewSubmit={handleReviewSubmit}
                            onReviewDelete={handleReviewDelete}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default BookingList;
