"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

interface BookingData {
  bookingId: string;
  checkInDateHour: string;
  checkOutDateHour: string;
  guests: number;
  nights: number;
  price: number;
  cleaning: number;
  prepayment_percentage: number;
  discountStayType: string;
  discountPercentageStayApplied: number;
  discountStayAmount: number;
  totalPrice: number;
  isPrivate: boolean;
  patientId: string;
  patienName: string;
  ownerId: string;
  ownerName: string;
  room: string;
  roomName: string;
  propertyName: string;
  description: string;
  photo: string;
  checkInHour: string;
}

type PaymentType = "fullpayment" | "prepayment";

export default function NewConfirmAndPay() {
  const [selectedDiscountOption, setSelectedDiscountOption] = useState<
    "no-discount" | "with-discount"
  >("no-discount");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CO", { style: "currency", currency: "COP" });

  // 🔹 Formateo universal de fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Tomamos solo la parte de la fecha YYYY-MM-DD
    const datePart = dateString.split("T")[0]; // "2025-12-10"
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(year, month - 1, day); // construimos fecha local
    return format(date, "d MMM yyyy", { locale: es });
  };
  

  // 🔹 Montos
  const getSubtotal = (b: BookingData) => b.nights * b.guests * b.price;
  const getBaseAmount = (b: BookingData) =>
    getSubtotal(b) - b.discountStayAmount + b.cleaning;
  const getPrepaymentAmount = (b: BookingData) =>
    getBaseAmount(b) * (b.prepayment_percentage / 100);


    
    const getPaymentDeadline = (b: BookingData) => {
      if (!b.checkInDateHour) return "";
    
      // 🔹 Combinar fecha y hora en local (sin conversión a UTC)
      const baseDate = b.checkInDateHour.split("T")[0];
      const fullDateTime = b.checkInHour
        ? `${baseDate}T${b.checkInHour}`
        : `${baseDate}T00:00:00`;
    
      // 🔹 Crear fecha local correctamente
      const checkIn = new Date(fullDateTime);
    
      // 🔹 Restar 72 horas (3 días)
      const deadline = new Date(checkIn.getTime() - 72 * 60 * 60 * 1000);
    
      // 🔹 Formatear en formato 12h con AM/PM
      return format(deadline, "d MMM yyyy, h:mm a", { locale: es }).toUpperCase();
    };
    

  const getCurrentAmount = (b: BookingData) => {
    return selectedDiscountOption === "with-discount"
      ? getPrepaymentAmount(b)
      : getBaseAmount(b);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("booking");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (!data.prepayment_percentage) data.prepayment_percentage = 10;
        setBookingData(data);
      } catch (error) {
        console.error("Error parsing booking data:", error);
      }
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Cargando datos de reserva...
          </h2>
          <p className="text-gray-600">
            No se encontraron datos de reserva en el localStorage.
          </p>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal(bookingData);
  const baseAmount = getBaseAmount(bookingData);
  const prepaymentAmount = getPrepaymentAmount(bookingData);
  const currentAmount = getCurrentAmount(bookingData);
  const paymentBalance =
    selectedDiscountOption === "with-discount"
      ? bookingData.totalPrice - prepaymentAmount
      : 0;

  const handleConfirmAndPay = () => {
    const storedData = localStorage.getItem("booking");
    const paymentType: PaymentType =
      selectedDiscountOption === "with-discount" ? "prepayment" : "fullpayment";

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const updatedData = {
          ...data,
          room: bookingData.room,
          patient: bookingData.patientId,
          ownerId: bookingData.ownerId,
          guests: bookingData.guests,
          checkInDateHour: bookingData.checkInDateHour,
          checkOutDateHour: bookingData.checkOutDateHour,
          price: bookingData.price,
          cleaning: bookingData.cleaning,
          discountStayType: bookingData.discountStayType,
          discountPercentageStayApplied:
            bookingData.discountPercentageStayApplied,
          discountStayAmount: bookingData.discountStayAmount,
          prepaymentPercentage: bookingData.prepayment_percentage,
          paymentAmount: currentAmount,
          paymentBalance,
          paymentType,
          unit_amount: bookingData.totalPrice,
          finalPrice: bookingData.totalPrice,
        };
        localStorage.setItem("booking", JSON.stringify(updatedData));
        window.location.href = "/checkout-modify";
      } catch (error) {
        console.error("Error updating booking data:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Opciones de pago */}
        <div className="lg:col-span-2 space-y-8">
          <div className="text-sm text-gray-500">
            <span className="font-medium">
              <a href={`/mi-panel/booking-modify/${bookingData.bookingId}`}>Volver</a>
            </span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-800">
              Confirmar y pagar
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Confirmar y pagar</h1>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Opciones de Pago
            </h2>

            <PaymentOption
              selected={selectedDiscountOption === "no-discount"}
              onClick={() => setSelectedDiscountOption("no-discount")}
              label="Pago Total"
              description="Paga el monto completo ahora"
              amount={baseAmount}
              color="blue"
            />

            <PaymentOption
              selected={selectedDiscountOption === "with-discount"}
              onClick={() => setSelectedDiscountOption("with-discount")}
              label={`Pago Anticipado (${bookingData.prepayment_percentage}%)`}
              description={`Paga solo el ${bookingData.prepayment_percentage}% ahora, el resto antes del check-in`}
              extraInfo={`Saldo restante: ${formatCurrency(
                baseAmount - prepaymentAmount
              )} (debe pagarse antes del ${getPaymentDeadline(bookingData)})`}
              amount={prepaymentAmount}
              color="green"
            />
          </div>

          <CancellationPolicy
            showPrepayment={selectedDiscountOption === "with-discount"}
          />

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer"
            >
              Acepto la{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Política de Reembolso para Huéspedes
              </a>
              .
            </label>
          </div>

          <Button
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-500 text-white font-semibold py-6 px-6 rounded-lg text-lg"
            disabled={!agreedToTerms}
            onClick={handleConfirmAndPay}
          >
            Confirmar y pagar {formatCurrency(currentAmount)}
          </Button>
        </div>

        <BookingSummary
          bookingData={bookingData}
          subtotal={subtotal}
          discount={bookingData.discountStayAmount}
          discountLabel={bookingData.discountPercentageStayApplied}
          baseAmount={baseAmount}
          prepaymentAmount={prepaymentAmount}
          currentAmount={currentAmount}
          selectedDiscountOption={selectedDiscountOption}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  label,
  description,
  extraInfo,
  amount,
  color,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  extraInfo?: string;
  amount: number;
  color: "blue" | "green";
}) {
  const border = selected
    ? `border-${color}-500 bg-${color}-50`
    : "border-gray-200 hover:border-gray-300";
  const icon = selected ? (
    <CheckCircle2 className={`h-5 w-5 text-${color}-600`} />
  ) : (
    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
  );

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${border}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{label}</span>
            <p className="text-sm text-gray-600">{description}</p>
            {extraInfo && (
              <p className="text-xs text-blue-600 mt-1">{extraInfo}</p>
            )}
          </div>
        </div>
        <span className="font-semibold text-gray-900">
          {amount.toLocaleString("es-CO")}
        </span>
      </div>
    </div>
  );
}

function CancellationPolicy({ showPrepayment }: { showPrepayment: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Política de anulación de reserva:
      </h2>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p>
              Anulación gratuita hasta 72 horas antes del check-in. Después de
              este período, no hay reembolso disponible.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSummary({
  bookingData,
  subtotal,
  discount,
  discountLabel,
  baseAmount,
  prepaymentAmount,
  currentAmount,
  selectedDiscountOption,
  formatCurrency,
  formatDate,
}: {
  bookingData: BookingData;
  subtotal: number;
  discount: number;
  discountLabel: number;
  baseAmount: number;
  prepaymentAmount: number;
  currentAmount: number;
  selectedDiscountOption: string;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
}) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-6 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {bookingData.roomName}
              </h3>
              <p className="text-sm text-gray-600">{bookingData.propertyName}</p>
              <p className="text-xs text-gray-500 mt-1">
                Propietario: {bookingData.ownerName}
              </p>
            </div>
            <Image
              src={
                bookingData.photo
                  ? `/webapi/assets/${bookingData.photo}?key=full`
                  : "/placeholder.jpg"
              }
              alt={bookingData.roomName || "Foto de habitación"}
              width={96}
              height={64}
              className="object-cover rounded-md"
            />
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <span>
                {formatDate(bookingData.checkInDateHour)} → {formatDate(bookingData.checkOutDateHour)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>
                {bookingData.guests} huésped
                {bookingData.guests > 1 ? "es" : ""} x {bookingData.nights} noche
                {bookingData.nights > 1 ? "s" : ""} = {formatCurrency(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  Descuento ({discountLabel}%) = - {formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Limpieza = {formatCurrency(bookingData.cleaning)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">
                {selectedDiscountOption === "with-discount" ? "Pago Anticipado" : "Total"}
              </span>
              <div className="text-right">
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(currentAmount)}
                </span>
              </div>
            </div>

            {selectedDiscountOption === "with-discount" && (
              <>
                <div className="text-sm text-blue-600">
                  Anticipo: {formatCurrency(prepaymentAmount)} (
                  {bookingData.prepayment_percentage}% del total)
                </div>
                <div className="text-sm text-gray-600">
                  Saldo pendiente: {formatCurrency(baseAmount - prepaymentAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  Total de la reserva: {formatCurrency(baseAmount)}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
