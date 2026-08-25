"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toZonedTime, format } from "date-fns-tz";
import { es, enUS } from "date-fns/locale"; // Importamos 'enUS'
import Link from 'next/link'
import { useParams } from "next/navigation";
import { type Locale } from "@/lib/i18n"
import { getAssetUrl } from "@/lib/getAssetUrl";


interface BookingData {
  bookingId: string;
  checkInDateHour: string;
  checkOutDateHour: string;
  checkInHour: string;
  guests: number;
  nights: number;
  price: number;
  cleaning: number;
  prepayment_percentage: number;
  prepaymentAmount: string; // Monto pagado previamente
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
}

type PaymentType = "fullpayment" | "prepayment";


export default function NewConfirmAndPay() {
  const [selectedDiscountOption, setSelectedDiscountOption] = useState<"no-discount" | "with-discount">("no-discount");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es'
  const isSpanish = lang === "es";

  // Determinar la locale de date-fns
  const dateFnsLocale = useMemo(() => isSpanish ? es : enUS, [isSpanish]);
  

  const formatCurrency = (value: number) =>
    value.toLocaleString(isSpanish ? "es-CO" : "en-US", { 
        style: "currency", 
        currency: isSpanish ? "COP" : "USD" 
    });


  // 🔹 Helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate =toZonedTime(dateString, timeZone);
    return format(zonedDate, "d MMM yyyy, HH:mm", { locale: dateFnsLocale }); 
  };

  // 🔹 Calcular montos (sin cambios en la lógica matemática)
  const getSubtotal = (b: BookingData) => b.nights * b.guests * b.price;
  const getBaseAmount = (b: BookingData) => getSubtotal(b) - b.discountStayAmount + b.cleaning;
  const getPrepaymentAmount = (b: BookingData) => {
    const baseAmount = getBaseAmount(b);
    const prepaymentPercentage = baseAmount * (b.prepayment_percentage / 100);
    const previousBalance = Number(b.prepaymentAmount) || 0;
    return Math.max(0, prepaymentPercentage - previousBalance); 
  };

    
  const getPaymentDeadline = (b: BookingData) => {
    if (!b.checkInDateHour) return "";
  
    const baseDate = b.checkInDateHour.split("T")[0];
    const fullDateTime = b.checkInHour
      ? `${baseDate}T${b.checkInHour}`
      : `${baseDate}T00:00:00`;
  
    const checkIn = new Date(fullDateTime);
  
    const deadline = new Date(checkIn.getTime() - 72 * 60 * 60 * 1000);
  
    return format(deadline, isSpanish ? "d MMM yyyy, h:mm a" : "MMM d yyyy, h:mm a", { locale: dateFnsLocale });
  };
  
  const getCurrentAmount = (b: BookingData) => {
    const previousBalance = Number(b.prepaymentAmount) || 0;
    const amount =
      selectedDiscountOption === "with-discount"
        ? getPrepaymentAmount(b) 
        : Math.max(0, getBaseAmount(b) - previousBalance);
    return Math.max(0, amount);
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
            {isSpanish ? "Cargando datos de reserva..." : "Loading booking data..."}
          </h2>
          <p className="text-gray-600">
            {isSpanish ? "No se encontraron datos de reserva en el localStorage." : "No booking data found in localStorage."}
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Variables derivadas
  const subtotal = getSubtotal(bookingData);
  const baseAmount = getBaseAmount(bookingData);
  const prepaymentAmount = getPrepaymentAmount(bookingData);
  const currentAmount = getCurrentAmount(bookingData);
  const previousBalance = Number(bookingData.prepaymentAmount) || 0;
  
  const paymentBalanceDue = baseAmount - (previousBalance + (selectedDiscountOption === "with-discount" ? prepaymentAmount : 0));
  
  const paymentDeadlineText = getPaymentDeadline(bookingData);
  const remainingBalanceAmount = formatCurrency(paymentBalanceDue);

  const handleConfirmAndPay = () => {
    const storedData = localStorage.getItem("booking");
    const paymentType: PaymentType = selectedDiscountOption === "with-discount" ? "prepayment" : "fullpayment";

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
          checkInHour: bookingData.checkInHour,
          price: bookingData.price,
          cleaning: bookingData.cleaning,
          discountStayType: bookingData.discountStayType,
          discountPercentageStayApplied: bookingData.discountPercentageStayApplied,
          discountStayAmount: bookingData.discountStayAmount,
          prepaymentPercentage: bookingData.prepayment_percentage,
          paymentAmount: currentAmount,
          paymentBalance: paymentBalanceDue,
          paymentType,
          unit_amount: currentAmount,
          finalPrice: baseAmount,
        };
        localStorage.setItem("booking", JSON.stringify(updatedData));
        
        window.location.href = `/${lang}/checkout-modify`;
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
          {/* Migas */}
          <div className="text-sm text-gray-500">
            <span className="font-medium">
              <Link href={`/${lang}/mi-panel/booking-modify/${bookingData.bookingId}`}>
                {isSpanish ? "Volver" : "Go back"}
              </Link>
            </span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-800">
              {isSpanish ? "Confirmar y pagar" : "Confirm & Pay"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {isSpanish ? "Confirmar y pagar" : "Confirm & Pay"}
          </h1>

          {/* Opciones */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isSpanish ? "Opciones de Pago" : "Payment Options"}
            </h2>

            {/* Pago Total */}
            <PaymentOption
              selected={selectedDiscountOption === "no-discount"}
              onClick={() => setSelectedDiscountOption("no-discount")}
              label={isSpanish ? "Pago Total" : "Full Payment"}
              description={isSpanish ? "Paga el monto completo ahora" : "Pay the full amount now"}
              amount={baseAmount - previousBalance}
              color="blue"
              formatCurrency={formatCurrency}
            />

            {/* Anticipo */}
            <PaymentOption
              selected={selectedDiscountOption === "with-discount"}
              onClick={() => setSelectedDiscountOption("with-discount")}
              label={isSpanish ? `Pago Anticipado (${bookingData.prepayment_percentage}%)` : `Prepayment (${bookingData.prepayment_percentage}%)`}
              description={isSpanish ? `Paga el monto pendiente del ${bookingData.prepayment_percentage}% ahora` : `Pay the pending ${bookingData.prepayment_percentage}% amount now`}
              extraInfo={
                isSpanish 
                  ? `Saldo restante: ${remainingBalanceAmount} (debe pagarse antes del ${paymentDeadlineText})`
                  : `Remaining balance: ${remainingBalanceAmount} (must be paid before ${paymentDeadlineText})`
              }
              amount={prepaymentAmount}
              color="green"
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Política de cancelación */}
          <CancellationPolicy isSpanish={isSpanish} />

          {/* Aceptar términos */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              {isSpanish ? "Acepto la " : "I accept the "}
              <Link href={`/${lang}/policy`} className="text-blue-600 hover:underline"> 
                {isSpanish ? "Política de Reembolso para Huéspedes" : "Guest Refund Policy"}
              </Link>
             
              {isSpanish ? "." : "."}
            </label>
          </div>

          {/* Botón */}
          <Button
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-500 text-white font-semibold py-6 px-6 rounded-lg text-lg"
            disabled={!agreedToTerms}
            onClick={handleConfirmAndPay}
          >
            {isSpanish ? "Confirmar y pagar " : "Confirm & Pay "} {formatCurrency(currentAmount)}
          </Button>
        </div>

        {/* Resumen */}
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
          isSpanish={isSpanish}
        />
      </div>
    </div>
  );
}

/* 🔹 Componente Opción de Pago */
function PaymentOption({
  selected,
  onClick,
  label,
  description,
  extraInfo,
  amount,
  color,
  formatCurrency,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  extraInfo?: string;
  amount: number;
  color: "blue" | "green";
  formatCurrency: (value: number) => string;
}) {
  const border = selected ? `border-${color}-500 bg-${color}-50` : "border-gray-200 hover:border-gray-300";
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
          <div className="block md:block">
            <div className="md:h-auto md:w-auto h-4 w-4">{icon}</div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{label}</span>
            <p className="text-sm text-gray-600">{description}</p>
            {extraInfo && (
              <p className="text-xs text-blue-600 mt-1">{extraInfo}</p>
            )}
          </div>
        </div>
        <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
      </div>
    </div>
  );
}

/* 🔹 Componente Política de Cancelación */
function CancellationPolicy({ isSpanish }: { isSpanish: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {isSpanish ? "Política de anulación de reserva:" : "Cancellation Policy:"}
      </h2>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p>
              {isSpanish 
                ? "Anulación gratuita hasta 72 horas antes del check-in. Después de este período, no hay reembolso disponible." 
                : "Free cancellation up to 72 hours before check-in. After this period, no refund is available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Componente Resumen */
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
  isSpanish,
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
  isSpanish: boolean;
}) {
  const previousBalance = Number(bookingData.prepaymentAmount) || 0;
  const totalPendingBalance = baseAmount - (previousBalance + (selectedDiscountOption === "with-discount" ? prepaymentAmount : 0));

  const guestsLabel = isSpanish 
    ? `${bookingData.guests} huésped${bookingData.guests > 1 ? "es" : ""}` 
    : `${bookingData.guests} guest${bookingData.guests !== 1 ? "s" : ""}`;
  
  const nightsLabel = isSpanish 
    ? `${bookingData.nights} noche${bookingData.nights > 1 ? "s" : ""}`
    : `${bookingData.nights} night${bookingData.nights !== 1 ? "s" : ""}`;

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-6 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{bookingData.roomName}</h3>
              <p className="text-sm text-gray-600">{bookingData.propertyName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isSpanish ? "Propietario" : "Owner"}: {bookingData.ownerName}
              </p>
            </div>
            <div className="w-[90px] aspect-[3/2] relative rounded-md overflow-hidden">
  <Image
    src={
      bookingData.photo
        ? getAssetUrl(bookingData.photo, "medium")
        : "/assets/empty.jpg"
    }
    alt={bookingData.roomName || "Foto de habitación"}
    fill
    className="object-cover object-center"
  />
</div>
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
                {guestsLabel} x {nightsLabel} = {formatCurrency(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {isSpanish ? "Descuento" : "Discount"} ({discountLabel}%) = - {formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{isSpanish ? "Limpieza" : "Cleaning Fee"} = {formatCurrency(bookingData.cleaning)}</span>
            </div>
            {previousBalance > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSpanish ? "Anticipo anterior" : "Previous Prepayment"} = - {formatCurrency(previousBalance)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">
                {selectedDiscountOption === "with-discount" 
                  ? (isSpanish ? "Pago Anticipado" : "Prepayment") 
                  : (isSpanish ? "Total" : "Total")}
              </span>
              <div className="text-right">
                <span className="font-bold text-gray-900 text-lg">{formatCurrency(currentAmount)}</span>
              </div>
            </div>

            {selectedDiscountOption === "with-discount" && (
              <>
                <div className="text-sm text-blue-600">
                  {isSpanish ? "Anticipo" : "Prepayment"}: {formatCurrency(prepaymentAmount)} ({bookingData.prepayment_percentage}% {isSpanish ? "del total" : "of total"})
                </div>
                <div className="text-sm text-gray-600">
                  {isSpanish ? "Saldo pendiente" : "Pending balance"}: {formatCurrency(totalPendingBalance)}
                </div>
                <div className="text-xs text-gray-500">
                  {isSpanish ? "Total de la reserva" : "Total reservation amount"}: {formatCurrency(baseAmount)}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}