"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Bed,
  Users,
  Clock,
  Percent,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingWidget } from "./booking-widget-room";
import { BookingWidgetBed } from "./booking-widget-bed";
import { Fraunces } from "next/font/google";

import { BedSingle, BedDouble } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchCurrentUser } from "@/services/BookingService";
import { useRouter } from "next/navigation";
import { fetchStayData, type Stay } from "@/services/stayService";
import {
  createBookingModify,
  type ModifyBookingPayload,
} from "@/services/BookingModifyNoPaymentService";
//import { createBookingModifyNoPayment, ModifyBookingPayloadNoPayment } from "@/services/BookingModifyNoPaymentService";
import { type Locale } from "@/lib/i18n";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const fraunces = Fraunces({ subsets: ["latin"] });

interface RoomTag {
  id: string;
  Room_id: string;
  ExtraTags_id: string;
}

type ImageRoom = {
  directus_files_id: {
    id: string;
    isModerated: boolean;
  };
};

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: string;
  cleaningFee: string;
  beds: number;
  capacity: number;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  privateRoomPrice: string;
  privateRoomCleaning: string;
  sharedRoomPrice: string;
  sharedRoomCleaning: string;
  bedType: string;
  bedName: string;
  check_in_hour: string;
  check_out_hour: string;
  discount_percentage_medium_stay: string;
  discount_percentage_long_stay: string;
  prepayment_percentage: string;
  photos: ImageRoom[];
  extraTags: RoomTag[];
  servicesTags: { serviceTags_id: string }[];
  descriptionService: string;
  Property_id: string;
  disableDates: string;
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
  paymentReceivedAmount: string | null;
}

interface BookingProp {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  patient: string;
  ownerId: string;
  guests: number;
  price: number;
  cleaning: number;
  room: string;
  singleBeds: number;
  doubleBeds: number;
  isPrivate: boolean;
  bookingState: string;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  price: number;
  cleaning: number;
  totalPrice: number;
  discountStayType: string;
  discountPercentageStayApplied: number;
  discountStayAmount: number;
}

interface DiscountData {
  shortStayDiscounts: string[];
  mediumStayDiscounts: string[];
  longStayDiscounts: string[];
  defaultShortStayDiscount: string;
  defaultMediumStayDiscount: string;
  defaultLongStayDiscount: string;
  shortStayRange: { min: number; max: number | null };
  mediumStayRange: { min: number; max: number | null };
  longStayRange: { min: number; max: number | null };
}

export default function BookingModifyPage() {
  const { id: bookingId } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [otherBookings, setOtherBookings] = useState<BookingProp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const lang = (params.lang as Locale) || "es"; // Default to 'es'
  const isSpanish = lang === "es";

  const router = useRouter();

  interface User {
    id: string;
    first_name: string;
    last_name: string;
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const filterCurrentBookings = (bookings: BookingProp[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const checkOutDate = new Date(booking.checkOut);
      return (
        booking.id !== bookingId && // Exclude the current booking being modified
        checkOutDate >= today &&
        booking.bookingState !== "cancelled_by_patient" &&
        booking.bookingState !== "cancelled_by_owner"
      );
    });
  };

  const [filteredBookings, setFilteredBookings] = useState<BookingProp[]>([]);

  useEffect(() => {
    setFilteredBookings(filterCurrentBookings(otherBookings));
  }, [otherBookings]);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        return;
      }

      const user = await fetchCurrentUser(accessToken);
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

  const [discountData, setDiscountData] = useState<DiscountData | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token") ?? "";
    if (!accessToken) return;

    const loadData = async () => {
      try {
        const stays: Stay[] = await fetchStayData(accessToken);

        const shortStay = stays.find((s) => s.type === "corta");
        const mediumStay = stays.find((s) => s.type === "media");
        const longStay = stays.find((s) => s.type === "larga");

        setDiscountData({
          shortStayDiscounts: shortStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          mediumStayDiscounts: mediumStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          longStayDiscounts: longStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          defaultShortStayDiscount:
            shortStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultMediumStayDiscount:
            mediumStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultLongStayDiscount:
            longStay?.discounts[0]?.percentage.toString() ?? "0",
          shortStayRange: {
            min: shortStay?.minNights ?? 1,
            max: shortStay?.maxNights ?? 5,
          },
          mediumStayRange: {
            min: mediumStay?.minNights ?? 6,
            max: mediumStay?.maxNights ?? 9,
          },
          longStayRange: {
            min: longStay?.minNights ?? 10,
            max: longStay?.maxNights ?? null,
          },
        });
      } catch (err) {
        console.error("Error cargando descuentos:", err);
      }
    };

    loadData();
  }, []);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showNoChangesDialog, setShowNoChangesDialog] = useState(false);
  const [showPaymentWarningDialog, setShowPaymentWarningDialog] =
    useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingBookingData, setPendingBookingData] =
    useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWidgetSubmit = (data: BookingData) => {
    const hasChanges =
      data.checkIn !== booking?.checkIn ||
      data.checkOut !== booking?.checkOut ||
      (booking?.isPrivate !== false && data.guests !== booking?.guests);

    if (!hasChanges) {
      setShowNoChangesDialog(true);
      return;
    }

    setPendingBookingData(data);

    const originalPrice = booking?.finalPrice
      ? Number.parseFloat(booking.finalPrice)
      : 0;
    const needsPayment = data.totalPrice > originalPrice;

    if (needsPayment) {
      setShowPaymentWarningDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmWithPayment = () => {
    if (!pendingBookingData || !currentUser || !booking || !room) {
      console.error("Missing data or user");
      router.push("/login");
      return;
    }

    try {
      setShowPaymentWarningDialog(false);

      const formattedBookingModify = {
        bookingId: booking.id,
        checkInDateHour:
          new Date(pendingBookingData.checkIn).toISOString().split(".")[0] +
          "Z",
        checkOutDateHour:
          new Date(pendingBookingData.checkOut).toISOString().split(".")[0] +
          "Z",
        guests: pendingBookingData.guests,
        nights: pendingBookingData.nights,
        price: pendingBookingData.price,
        cleaning: pendingBookingData.cleaning,
        finalPrice: pendingBookingData.totalPrice,
        discountStayType: pendingBookingData.discountStayType,
        discountPercentageStayApplied:
          pendingBookingData.discountPercentageStayApplied,
        discountStayAmount: pendingBookingData.discountStayAmount,
        isPrivate: room.isPrivate,
        patientId: currentUser.id,
        patientName: currentUser.first_name + " " + currentUser.last_name,
        ownerId: booking.ownerId,
        ownerName: booking.ownerName,
        room: room.id,
        roomName: room.name,
        propertyName: booking.propertyName,
        description: room.description,
        photo: room.photos[0]?.directus_files_id?.id,
        originalPrice: booking.finalPrice,
        paymentDifference: paymentDifference,
        paymentState: booking.paymentState,
        prepaymentPercentage: room.prepayment_percentage,
        prepaymentAmount: booking.prepaymentAmount,
        name: room.name,
        unit_amount: paymentDifference,
        paymentAmount: paymentDifference,
        checkInHour: room.check_in_hour,
      };

      localStorage.removeItem("booking");
      localStorage.setItem("booking", JSON.stringify(formattedBookingModify));

      if (booking?.paymentState === "prepayment") {
        router.push("/confirm-pay-modify");
      } else {
        router.push("/checkout-modify");
      }
    } catch (error) {
      console.error("Error guardando datos de modificación", error);
      setError("Error al guardar los datos de modificación");
    }
  };

  const handleConfirmNoPayment = async () => {
    if (!pendingBookingData || !currentUser) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setShowConfirmDialog(false);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Missing token");

      const payload: ModifyBookingPayload = {
        bookingId: booking?.id as string,
        guests: pendingBookingData.guests,
        checkInDateHour:
          new Date(pendingBookingData.checkIn).toISOString().split(".")[0] +
          "Z",
        checkOutDateHour:
          new Date(pendingBookingData.checkOut).toISOString().split(".")[0] +
          "Z",
        price: pendingBookingData.price,
        cleaning: pendingBookingData.cleaning,
        finalPrice: pendingBookingData.totalPrice,
        discountStayType: pendingBookingData.discountStayType,
        discountPercentageStayApplied:
          pendingBookingData.discountPercentageStayApplied,
        discountStayAmount: pendingBookingData.discountStayAmount,
        prepaymentPercentage: Number(room?.prepayment_percentage) || 0,
        paymentAmount: 0,
        paymentBalance:
          booking?.paymentState === "prepayment"
            ? pendingBookingData.totalPrice -
              Number(booking?.paymentReceivedAmount)
            : 0,
        paymentType:
          booking?.paymentState === "prepayment" ? "prepayment" : "fullpayment",
      };

      await createBookingModify(payload, accessToken);

      router.push("/mi-panel/reservas-realizadas?rel=modify");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error modificando reserva", error);
      setError("Error al modificar la reserva");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookingAndRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          setError("No se encontró token de acceso");
          return;
        }

        const bookingResponse = await axios.get("/webapi/items/Booking", {
          params: {
            fields: "*",
            "filter[id][_eq]": bookingId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Access-Control-Allow-Origin": "*",
          },
        });

        const bookingData = bookingResponse.data.data?.[0];

        if (!bookingData) {
          setError("Reserva no encontrada");
          return;
        }

        setBooking(bookingData);

        const roomId = bookingData.room;

        const roomResponse = await axios.get("/webapi/items/Room", {
          params: {
            fields:
              "*,photos.directus_files_id.id,photos.directus_files_id.isModerated,extraTags.*,servicesTags.*,propertyId",
            "filter[id][_eq]": roomId,
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });

        const roomData = roomResponse.data.data?.[0];

        if (!roomData) {
          setError("Habitación no encontrada");
          return;
        }

        const today = new Date().toISOString().split("T")[0];

        const bookingsResponse = await axios.get(`/webapi/items/Booking`, {
          params: {
            "filter[room][_eq]": roomId,
            "filter[checkOut][_gt]": today,
            "filter[id][_neq]": bookingId,
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });

        setRoom(roomData);
        setOtherBookings(bookingsResponse.data.data);
      } catch (error) {
        console.error("Error fetching booking/room data:", error);
        setError(
          "Error al cargar los datos. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingAndRoomData();
    }
  }, [bookingId]);

  type HtmlContentProps = {
    html?: string | null;
  };

  const HtmlContent = ({ html }: HtmlContentProps) => {
    if (!html || html.trim() === "") return null;

    return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {isSpanish ? "Cargando..." : "Loading..."}
      </div>
    );
  }

  if (error || !room || !booking) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Reserva no encontrada"}
      </div>
    );
  }

  function formatTimeToAMPM(time: string): string {
    const [hourStr, minute] = time.split(":");
    let hour = Number.parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  function formatDiscount(discount: string): string {
    const num = Number.parseFloat(discount);
  
    if (isNaN(num) || num === 0) {
      return isSpanish ? "Sin descuento" : "No discount";
    }
  
    return isSpanish ? `${Math.round(num)}%` : `${Math.round(num)}% off`;
  }

  const getBookingStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      confirmed: {
        label: isSpanish ? "Confirmada" : "Confirmed",
        variant: "default",
      },
      pending: {
        label: isSpanish ? "Pendiente" : "Pending",
        variant: "secondary",
      },
      cancelled_by_patient: {
        label: isSpanish
          ? "Cancelada por paciente"
          : "Cancelled by guest",
        variant: "destructive",
      },
      cancelled_by_owner: {
        label: isSpanish
          ? "Cancelada por anfitrión"
          : "Cancelled by host",
        variant: "destructive",
      },
      prepayment: {
        label: isSpanish ? "Anticipo Pagado" : "Prepayment Paid",
        variant: "default",
      },
      balancepayment: {
        label: isSpanish ? "Saldo Pagado" : "Balance Paid",
        variant: "default",
      },
      fullpayment: {
        label: isSpanish ? "Pago Completo" : "Fully Paid",
        variant: "default",
      },
    };
  
    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline",
    };
  
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };
  

  const originalPrice = booking?.finalPrice
    ? Number.parseFloat(booking.finalPrice)
    : 0;
  const paymentDifference = pendingBookingData
    ? Math.abs(pendingBookingData.totalPrice - originalPrice)
    : 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1
                  className={`${fraunces.className} text-3xl font-normal text-[#162F40]`}
                >
                  {isSpanish ? "Modificar Reserva" : "Modify Reservation"}
                </h1>
              </div>
              {booking.ownerName && (
                <p className="text-sm text-muted-foreground mb-2">
                  {isSpanish ? "Anfitrión" : "Host"} {booking.ownerName}
                </p>
              )}
              <h2
                className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}
              >
                {room.isPrivate === false && room.bedName?.trim()
                  ? `${room.bedName} - `
                  : ""}
                {room.name}
              </h2>

              <Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Calendar className="h-5 w-5" />
      {isSpanish ? "Detalles de la Reserva Actual" : "Current Booking Details"}
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Estado */}
    <div className="flex items-center gap-2 pb-2 border-b">
      <span className="text-sm text-muted-foreground">
        {isSpanish ? "Estado:" : "Status:"}
      </span>
      {getBookingStatusBadge(booking?.paymentState || "")}
    </div>

    {/* Datos principales */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Estadia */}
      <div>
        <p className="text-sm text-muted-foreground">
          {isSpanish ? "Estadía" : "Stay"}
        </p>
        <p className="font-semibold">
          {isSpanish
            ? `${format(parseISO(booking.checkIn), "dd MMM", { locale: es })} → 
               ${format(parseISO(booking.checkOut), "dd MMM", { locale: es })}`
            : `${format(parseISO(booking.checkIn), "MMM dd")} → 
               ${format(parseISO(booking.checkOut), "MMM dd")}`}
        </p>
      </div>

      {/* Noches */}
      <div>
        <p className="text-sm text-muted-foreground">
          {isSpanish ? "Cantidad de noches" : "Number of nights"}
        </p>
        <p className="font-semibold">
          {booking.numberOfNights || 0}{" "}
          {isSpanish
            ? booking.numberOfNights === 1
              ? "noche"
              : "noches"
            : booking.numberOfNights === 1
            ? "night"
            : "nights"}
        </p>
      </div>

      {/* Huéspedes solo si es private */}
      {booking.isPrivate !== false && (
        <div>
          <p className="text-sm text-muted-foreground">
            {isSpanish ? "Huéspedes" : "Guests"}
          </p>
          <p className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {booking.guests}
          </p>
        </div>
      )}

      {/* Precios */}
      <div>
        <p className="text-sm text-muted-foreground">
          {isSpanish ? "Precio por noche" : "Price per night"}
        </p>
        <p className="font-semibold">${booking.price}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          {isSpanish ? "Limpieza" : "Cleaning"}
        </p>
        <p className="font-semibold">${booking.cleaning}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          {isSpanish ? "Precio Total" : "Total Price"}
        </p>
        <p className="font-semibold text-lg">${booking.finalPrice}</p>
      </div>
    </div>

    {/* Información de Pago */}
    <div className="pt-4 border-t bg-muted/30 -mx-6 px-6 py-4 rounded-b-lg">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        {isSpanish ? "Información de Pago" : "Payment Information"}
      </h4>

      {/* --- ESTADOS DE PAGO --- */}

      {/* PREPAYMENT */}
      {booking.paymentState === "prepayment" && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isSpanish ? "Anticipo pagado:" : "Prepayment paid:"}
            </span>
            <span className="font-semibold text-green-600">
              ${booking.prepaymentAmount || "0"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isSpanish ? "Saldo pendiente:" : "Pending balance:"}
            </span>
            <span className="font-semibold text-orange-600">
              ${booking.balanceAmount || "0"}
            </span>
          </div>

          {booking.prepaymentDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {isSpanish ? "Anticipo pagado el " : "Prepayment paid on "}
              {isSpanish
                ? format(parseISO(booking.prepaymentDate), "dd/MM/yyyy")
                : format(parseISO(booking.prepaymentDate), "MM/dd/yyyy")}
            </p>
          )}
        </div>
      )}

      {/* BALANCE PAYMENT */}
      {booking.paymentState === "balancepayment" && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isSpanish ? "Anticipo pagado:" : "Prepayment paid:"}
            </span>
            <span className="font-semibold text-green-600">
              ${booking.prepaymentAmount || "0"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isSpanish ? "Saldo pagado:" : "Balance paid:"}
            </span>
            <span className="font-semibold text-green-600">
              ${booking.balanceAmount || "0"}
            </span>
          </div>

          {booking.balancePaymentDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {isSpanish ? "Saldo pagado el " : "Balance paid on "}
              {isSpanish
                ? format(parseISO(booking.balancePaymentDate), "dd/MM/yyyy")
                : format(parseISO(booking.balancePaymentDate), "MM/dd/yyyy")}
            </p>
          )}
        </div>
      )}

      {/* FULL PAYMENT */}
      {booking.paymentState === "fullpayment" && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isSpanish ? "Monto total pagado:" : "Total amount paid:"}
            </span>
            <span className="font-semibold text-green-600">
              ${Number(booking.fullAmount ?? booking.finalPrice ?? 0).toFixed(2)}
            </span>
          </div>

          {booking.fullPaymentDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {isSpanish ? "Pagado el " : "Paid on "}
              {isSpanish
                ? format(parseISO(booking.fullPaymentDate), "dd/MM/yyyy")
                : format(parseISO(booking.fullPaymentDate), "MM/dd/yyyy")}
            </p>
          )}
        </div>
      )}
    </div>
  </CardContent>
</Card>


              <div className="flex flex-col lg:contents">
                {/* Widget section - appears first on mobile (order-1), in sidebar on desktop */}
                <div className="order-1 lg:hidden mb-6">
                  {room.isPrivate === false ? (
                    <BookingWidgetBed
                      price={Number.parseInt(room.sharedRoomPrice, 10)}
                      cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                      discount_percentage_medium_stay={Number.parseInt(
                        room.discount_percentage_medium_stay ?? "0"
                      )}
                      discount_percentage_long_stay={Number.parseInt(
                        room.discount_percentage_long_stay ?? "0"
                      )}
                      prepayment_percentage={Number.parseInt(
                        room.prepayment_percentage ?? "10"
                      )}
                      minMediumStayRange={
                        discountData?.mediumStayRange.min ?? 6
                      }
                      maxMediumStayRange={
                        discountData?.mediumStayRange.max ?? 9
                      }
                      minLongStayRange={discountData?.longStayRange.min ?? 10}
                      maxLongStayRange={
                        discountData?.longStayRange.max ?? 10000
                      }
                      disableDates={room.disableDates}
                      bookings={filteredBookings}
                      onSubmit={handleWidgetSubmit}
                      defaultCheckIn={booking.checkIn}
                      defaultCheckOut={booking.checkOut}
                      lang={lang}
                    />
                  ) : (
                    <BookingWidget
                      price={Number.parseInt(room.privateRoomPrice, 10)}
                      cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                      maxGuests={room.capacity}
                      discount_percentage_medium_stay={Number.parseInt(
                        room.discount_percentage_medium_stay ?? "0"
                      )}
                      discount_percentage_long_stay={Number.parseInt(
                        room.discount_percentage_long_stay ?? "0"
                      )}
                      prepayment_percentage={Number.parseInt(
                        room.prepayment_percentage ?? "10"
                      )}
                      minMediumStayRange={
                        discountData?.mediumStayRange.min ?? 6
                      }
                      maxMediumStayRange={
                        discountData?.mediumStayRange.max ?? 9
                      }
                      minLongStayRange={discountData?.longStayRange.min ?? 10}
                      maxLongStayRange={
                        discountData?.longStayRange.max ?? 10000
                      }
                      disableDates={room.disableDates}
                      bookings={filteredBookings}
                      onSubmit={handleWidgetSubmit}
                      defaultCheckIn={booking.checkIn}
                      defaultCheckOut={booking.checkOut}
                      defaultGuests={booking.guests}
                      lang={lang}
                    />
                  )}
                </div>

                {/* Alert - appears second on mobile (order-2) */}
  <Alert className="order-2 mb-6 border-blue-200 bg-blue-50">
    <AlertCircle className="h-4 w-4 text-blue-600" />
    <AlertDescription className="text-blue-900">
      <p className="font-semibold mb-1">
        {isSpanish ? "Importante:" : "Important:"}
      </p>

      {isSpanish ? (
        <>
          Solo podés modificar esta reserva una vez. Te mostraremos si hay una
          diferencia a pagar o un monto a tu favor antes de confirmar.
        </>
      ) : (
        <>
          You can only modify this booking once. We will show you if there is an
          additional amount to pay or a remaining balance in your favor before
          confirming.
        </>
      )}
    </AlertDescription>
  </Alert>
              </div>

              {room.isPrivate === true && (
                <div className="flex items-center space-x-4 text-[#162F40]">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    <span>
                      {room.beds}{" "}
                      {room.beds === 1 ? "cama en total" : "camas en total"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>
                      Capacidad: {room.capacity}{" "}
                      {room.capacity === 1 ? "persona" : "personas"}
                    </span>
                  </div>
                </div>
              )}

              {room.isPrivate === false && (
                <div className="flex items-center mt-4 space-x-4 text-[#162F40]">
                {room.bedType === "double" ? (
                  <div className="flex items-center">
                    <BedDouble className="w-5 h-5 mr-2" />
                    <span>
                      {isSpanish ? "1 cama doble" : "1 double bed"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <BedSingle className="w-5 h-5 mr-2" />
                    <span>
                      {isSpanish ? "1 cama sencilla" : "1 single bed"}
                    </span>
                  </div>
                )}
              </div>              
              )}
            </div>

            {room.isPrivate === false && (
              <Alert className="border-blue-200 bg-white/50 backdrop-blur-sm mb-6">
              <AlertDescription className="text-gray-700 font-medium">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      {isSpanish ? "NOTA:" : "NOTE:"}
                    </h3>
            
                    <p className="text-sm leading-relaxed">
                      {isSpanish ? (
                        <>
                          Esta cama se alquila de manera individual, lo que significa que
                          reservás un lugar dentro de una habitación compartida. Esta
                          modalidad es ideal para quienes buscan una opción económica y
                          están abiertos a compartir el espacio con otras personas.
                        </>
                      ) : (
                        <>
                          This bed is rented individually, which means you are reserving a
                          spot within a shared room. This option is ideal for those looking
                          for an affordable stay and are open to sharing the space with
                          other people.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
            )}

            <div className="mb-8">
              <p className="text-[#162F40]">
                <HtmlContent html={room.description} />
              </p>
            </div>

            <div className="grid gap-6 mt-6 mb-12">
  <Card className="w-full max-w-3xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
    <CardHeader className="pb-6">
      <CardTitle className="text-2xl font-bold text-slate-800">
        {isSpanish ? "Políticas del hospedaje" : "Accommodation Policies"}
      </CardTitle>

      <p className="text-slate-600 mt-2">
        {isSpanish
          ? "Información importante sobre horarios, descuentos y pagos"
          : "Important information about schedules, discounts and payments"}
      </p>
    </CardHeader>

    <CardContent className="space-y-6">

      {/* Horarios */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {isSpanish ? "Horario de Entrada" : "Check-in Time"}
            </h3>
            <p className="text-lg font-bold text-blue-600">
              {formatTimeToAMPM(room.check_in_hour ?? "00:00:00")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {isSpanish ? "Horario de Salida" : "Check-out Time"}
            </h3>
            <p className="text-lg font-bold text-orange-600">
              {formatTimeToAMPM(room.check_out_hour ?? "00:00:00")}
            </p>
          </div>
        </div>
      </div>

      {/* Descuentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <Percent className="h-5 w-5 mr-2 text-green-600" />
          {isSpanish ? "Descuentos por Estadía" : "Stay Discounts"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Estadía Media */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">
                {isSpanish ? "Estadía Media" : "Medium Stay"}
              </span>
              <span className="text-xl font-bold text-green-600">
                {formatDiscount(room.discount_percentage_medium_stay ?? "0")}
              </span>
            </div>

            <p className="text-sm text-slate-600 mt-1">
              {discountData?.mediumStayRange.min} – {discountData?.mediumStayRange.max}{" "}
              {isSpanish ? "noches" : "nights"}
            </p>
          </div>

          {/* Estadía Larga */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">
                {isSpanish ? "Estadía Larga" : "Long Stay"}
              </span>
              <span className="text-xl font-bold text-emerald-600">
                {formatDiscount(room.discount_percentage_long_stay ?? "0")}
              </span>
            </div>

            <p className="text-sm text-slate-600 mt-1">
              {discountData?.longStayRange.min}+{" "}
              {isSpanish ? "noches" : "nights"}
            </p>
          </div>
        </div>
      </div>

      {/* Adelanto */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-purple-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">
              {isSpanish ? "Adelanto de Pago" : "Prepayment"}
            </h3>

            <p className="text-slate-600">
              {isSpanish ? "Puedes hacer un adelanto del " : "You can make a prepayment of "}
              <span className="font-bold text-purple-600">
                {formatDiscount(room.prepayment_percentage ?? "10")}
              </span>{" "}
              {isSpanish ? "del total" : "of the total amount"}
            </p>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-center pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          {isSpanish
            ? "Las políticas se aplican solamente a este hospedaje"
            : "Policies apply only to this accommodation"}
        </p>
      </div>
    </CardContent>
  </Card>
</div>

          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              {room.isPrivate === false ? (
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onSubmit={handleWidgetSubmit}
                  defaultCheckIn={booking.checkIn}
                  defaultCheckOut={booking.checkOut}
                  lang={lang}
                />
              ) : (
                <BookingWidget
                  price={Number.parseInt(room.privateRoomPrice, 10)}
                  cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                  maxGuests={room.capacity}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onSubmit={handleWidgetSubmit}
                  defaultCheckIn={booking.checkIn}
                  defaultCheckOut={booking.checkOut}
                  defaultGuests={booking.guests}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showNoChangesDialog} onOpenChange={setShowNoChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isSpanish ? "Sin cambios detectados" : "No changes detected"}
            </DialogTitle>
            <DialogDescription>
              {isSpanish
                ? "No has realizado ningún cambio en la reserva. Las fechas y cantidad de huéspedes son las mismas."
                : "You haven't made any changes to the booking. The dates and number of guests remain the same."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowNoChangesDialog(false)}
              className="bg-[#39759E] hover:bg-[#2c5a7a]"
            >
              {isSpanish ? "Entendido" : "Understood"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPaymentWarningDialog}
        onOpenChange={setShowPaymentWarningDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSpanish
                ? "Modificar reserva - Pago adicional requerido"
                : "Modify booking - Additional payment required"}
            </DialogTitle>
            <DialogDescription>
              {isSpanish
                ? "¿Estás seguro de que deseas modificar esta reserva?"
                : "Are you sure you want to modify this booking?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {pendingBookingData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isSpanish ? "Estadía" : "Stay"}
                    </p>
                    <p className="text-base font-semibold">
                      {format(parseISO(pendingBookingData.checkIn), "dd MMM", {
                        locale: es,
                      })}{" "}
                      →{" "}
                      {format(parseISO(pendingBookingData.checkOut), "dd MMM", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isSpanish ? "Noches" : "Nights"}
                    </p>
                    <p className="text-base font-semibold">
                      {pendingBookingData.nights}
                    </p>
                  </div>
                  {booking?.isPrivate !== false && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        {isSpanish ? "Huéspedes" : "Guests"}
                      </p>
                      <p className="text-base font-semibold">
                        {pendingBookingData.guests}
                      </p>
                    </div>
                  )}
                  {pendingBookingData.discountPercentageStayApplied > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        {isSpanish ? "Descuento" : "Discount"}
                      </p>
                      <p className="text-base font-semibold text-green-600">
                        {pendingBookingData.discountPercentageStayApplied}%
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-lg font-bold text-[#39759E]">
                      ${pendingBookingData.totalPrice.toLocaleString("es-CO")}{" "}
                      USD
                    </p>
                  </div>
                </div>

                {booking?.paymentState !== "prepayment" && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium text-center">
                      {isSpanish
                        ? "El nuevo monto es mayor por la modificación de la reserva. Por favor, abona la diferencia de"
                        : "The new amount is higher due to the booking modification. Please pay the difference of"}{" "}
                      <span className="font-bold">
                        ${paymentDifference.toLocaleString("es-CO")} USD
                      </span>{" "}
                      {isSpanish
                        ? "para completar la actualización."
                        : "to complete the update."}
                    </p>
                  </div>
                )}

                {booking?.paymentState === "prepayment" && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium text-center">
                      {isSpanish
                        ? "El nuevo monto es mayor debido a la modificación. Se te abonará el valor del anticipo ya pagado"
                        : "The new amount is higher due to the modification. The amount of the deposit already paid will be credited to you"}{" "}
                      <span className="font-bold">
                        $
                        {(booking?.prepaymentAmount ?? 0).toLocaleString(
                          "es-CO"
                        )}{" "}
                        USD
                      </span>{" "}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentWarningDialog(false)}
              disabled={loading}
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmWithPayment}
              disabled={loading}
              className="bg-[#39759E] hover:bg-[#2c5a7a]"
            >
              {isSpanish
                ? loading
                  ? "Modificando..."
                  : "Aceptar"
                : loading
                ? "Modifying..."
                : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSpanish ? "Modificar reserva" : "Modify booking"}
            </DialogTitle>
            <DialogDescription>
              {isSpanish
                ? "¿Estás seguro de que deseas modificar esta reserva?"
                : "Are you sure you want to modify this booking?"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {pendingBookingData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isSpanish ? "Estadía" : "Stay"}
                    </p>
                    <p className="text-base font-semibold">
                      {format(parseISO(pendingBookingData.checkIn), "dd MMM", {
                        locale: es,
                      })}{" "}
                      →{" "}
                      {format(parseISO(pendingBookingData.checkOut), "dd MMM", {
                        locale: es,
                      })}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isSpanish ? "Noches" : "Nights"}
                    </p>
                    <p className="text-base font-semibold">
                      {pendingBookingData.nights}
                    </p>
                  </div>

                  {booking?.isPrivate !== false && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        {isSpanish ? "Huéspedes" : "Guests"}
                      </p>
                      <p className="text-base font-semibold">
                        {pendingBookingData.guests}
                      </p>
                    </div>
                  )}

                  {pendingBookingData.discountPercentageStayApplied >= 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        {isSpanish ? "Descuento" : "Discount"}
                      </p>
                      <p className="text-base font-semibold text-green-600">
                        {pendingBookingData.discountPercentageStayApplied}%
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isSpanish ? "Total" : "Total"}
                    </p>
                    <p className="text-lg font-bold text-[#39759E]">
                      ${pendingBookingData.totalPrice.toLocaleString("es-CO")}{" "}
                      USD
                    </p>
                  </div>
                </div>

                {/* Pago mayor */}
                {paymentDifference > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium text-center">
                      {isSpanish
                        ? "El nuevo monto es mayor debido a la modificación. Se te abonará el valor del anticipo ya pagado para completar la actualización."
                        : "The new amount is higher due to the modification. The deposit already paid will be credited to complete the update."}{" "}
                      <span className="font-bold">
                        ${paymentDifference.toLocaleString("es-CO")} USD
                      </span>
                    </p>
                  </div>
                )}

                {/* Pago menor */}
                {paymentDifference < 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium text-center">
                      {isSpanish
                        ? "El nuevo monto es menor por la modificación de la reserva. Tienes un saldo a favor de "
                        : "The new amount is lower due to the modification. You have a credit balance of "}
                      <span className="font-bold">
                        ${Math.abs(paymentDifference).toLocaleString("es-CO")}{" "}
                        USD
                      </span>{" "}
                      {isSpanish ? "para esta reserva." : "for this booking."}
                    </p>
                  </div>
                )}

                {/* Sin cambio */}
                {paymentDifference === 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium text-center">
                      {isSpanish
                        ? "Los cambios en la reserva no han afectado al monto."
                        : "The changes in the booking did not affect the amount."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </Button>

            <Button
              onClick={handleConfirmNoPayment}
              disabled={loading}
              className="bg-[#39759E] hover:bg-[#2c5a7a]"
            >
              {isSpanish
                ? loading
                  ? "Modificando..."
                  : "Aceptar"
                : loading
                ? "Modifying..."
                : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Éxito */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              {isSpanish
                ? "¡Reserva modificada exitosamente!"
                : "Booking successfully modified!"}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {isSpanish
                ? "Se ha modificado la reserva correctamente. Puedes ver todas las reservas que tienes hechas en tu panel."
                : "The booking has been modified successfully. You can view all your bookings in your dashboard."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() =>
                router.push(
                  `/${isSpanish ? "mi-panel" : "dashboard"}/reservas-realizadas`
                )
              }
              className="bg-[#39759E] hover:bg-[#2c5a7a]"
            >
              {isSpanish ? "Ver reservas" : "View bookings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
