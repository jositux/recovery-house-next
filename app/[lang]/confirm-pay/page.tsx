"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
// Importamos 'enUS' para el formato de fecha en inglés
import { es, enUS } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

interface BookingData {
  checkIn: string;
  checkOut: string;
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

// -----------------------------------------------------------
//             OBJETO DE TRADUCCIONES (I18N)
// -----------------------------------------------------------

const translations = {
  es: {
    loadingData: "Cargando datos de reserva...",
    noData: "No se encontraron datos de reserva.",
    back: "Volver",
    confirmAndPay: "Confirmar y pagar",
    paymentOptions: "Opciones de Pago",
    fullPayment: "Pago Total",
    fullPaymentDesc: "Paga el monto completo ahora",
    prepayment: (percentage: number) => `Pago Anticipado (${percentage}%)`,
    prepaymentDesc: (percentage: number) =>
      `Paga solo el ${percentage}% ahora, el resto antes del check-in`,
    remainingBalance: (amount: string, deadline: string) =>
      `Saldo restante: ${amount} (debe pagarse antes del ${deadline})`,
    cancellationPolicyTitle: "Política de anulación de reserva:",
    cancellationPolicyAlert:
      "Anulación gratuita hasta 72 horas antes del check-in. Después de este período, no hay reembolso disponible.",
    acceptTerms: "Acepto la",
    refundPolicy: "Política de Reembolso para Huéspedes",
    paymentButton: (amount: string) => `Confirmar y pagar ${amount}`,
    summaryTitleFull: "Total",
    summaryTitlePre: "Pago Anticipado",
    summaryOwner: "Propietario",
    summaryGuest: (count: number) => `${count} huésped${count > 1 ? "es" : ""}`,
    summaryNight: (count: number) => `${count} noche${count > 1 ? "s" : ""}`,
    summaryDiscount: (percent: number) => `Descuento (${percent}%)`,
    summaryCleaning: "Limpieza",
    // ✅ CORRECCIÓN: El argumento 'percent' se elimina porque la función no lo usa.
    summaryAnticipo: () => `Anticipo:`,
    summaryAnticipoPercent: (percent: number) => `(${percent}% del total)`,
    summaryPending: "Saldo pendiente:",
    summaryTotalReservation: "Total de la reserva:",
  },
  en: {
    loadingData: "Loading booking data...",
    noData: "No booking data found.",
    back: "Go back",
    confirmAndPay: "Confirm & Pay",
    paymentOptions: "Payment Options",
    fullPayment: "Full Payment",
    fullPaymentDesc: "Pay the full amount now",
    prepayment: (percentage: number) => `Prepayment (${percentage}%)`,
    prepaymentDesc: (percentage: number) =>
      `Pay only ${percentage}% now, the rest before check-in`,
    remainingBalance: (amount: string, deadline: string) =>
      `Remaining balance: ${amount} (must be paid before ${deadline})`,
    cancellationPolicyTitle: "Cancellation Policy:",
    cancellationPolicyAlert:
      "Free cancellation up to 72 hours before check-in. After this period, no refund is available.",
    acceptTerms: "I accept the",
    refundPolicy: "Guest Refund Policy",
    paymentButton: (amount: string) => `Confirm & Pay ${amount}`,
    summaryTitleFull: "Total",
    summaryTitlePre: "Prepayment",
    summaryOwner: "Owner",
    summaryGuest: (count: number) => `${count} guest${count !== 1 ? "s" : ""}`,
    summaryNight: (count: number) => `${count} night${count !== 1 ? "s" : ""}`,
    summaryDiscount: (percent: number) => `Discount (${percent}%)`,
    summaryCleaning: "Cleaning Fee",
    // ✅ CORRECCIÓN: El argumento 'percent' se elimina porque la función no lo usa.
    summaryAnticipo: () => `Prepayment:`,
    summaryAnticipoPercent: (percent: number) => `(${percent}% of total)`,
    summaryPending: "Pending balance:",
    summaryTotalReservation: "Total reservation amount:",
  },
};

type Translations = typeof translations.es;

// -----------------------------------------------------------

export default function NewConfirmAndPay() {
  const [selectedDiscountOption, setSelectedDiscountOption] = useState<
    "no-discount" | "with-discount"
  >("no-discount");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const params = useParams();
  const lang = (params.lang as Locale) || "es"; // Default to 'es'
  const isSpanish = lang === "es";

  // Determinar el objeto de traducción y la locale de date-fns
  const { t, dateFnsLocale } = useMemo(() => {
    const currentLang = isSpanish ? "es" : "en";
    return {
      t: translations[currentLang] as Translations,
      dateFnsLocale: isSpanish ? es : enUS,
    };
  }, [isSpanish]);

  const formatCurrency = (value: number) =>
    value.toLocaleString(isSpanish ? "es-CO" : "en-US", {
      style: "currency",
      currency: isSpanish ? "COP" : "USD",
    });

  // Función de formato de moneda local pero sin símbolo (para usar en descripciones)
  /*const formatAmountNoSymbol = (value: number) =>
    value.toLocaleString(isSpanish ? "es-CO" : "en-US", { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });*/

  // 🔹 Formateo universal de fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = toZonedTime(dateString, timeZone);
    const hasTime = dateString.includes("T");
    return format(zonedDate, hasTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy", {
      locale: dateFnsLocale, // Usar locale dinámica
    });
  };

  const getCurrentIsoTime = () =>
    new Date().toISOString().split("T")[1].split(".")[0] + "Z";

  // 🔹 Montos (sin cambios)
  const getSubtotal = (b: BookingData) => b.nights * b.guests * b.price;
  const getBaseAmount = (b: BookingData) =>
    getSubtotal(b) - b.discountStayAmount + b.cleaning;
  const getPrepaymentAmount = (b: BookingData) =>
    getBaseAmount(b) * (b.prepayment_percentage / 100);

  // 🔹 Fecha límite pago (72h antes del check-in)
  const getPaymentDeadline = (b: BookingData) => {
    if (!b.checkIn) return "";

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 🔹 Combinar fecha y hora
    const dateTimeString = b.checkInHour
      ? `${b.checkIn}T${b.checkInHour}`
      : `${b.checkIn}T00:00:00`;

    // 🔹 Convertir a zona horaria local
    const checkInZoned = toZonedTime(dateTimeString, timeZone);

    // 🔹 Restar 72 horas (3 días)
    const deadline = new Date(checkInZoned);
    deadline.setHours(deadline.getHours() - 72);

    // 🔹 Formatear salida
    return format(
      deadline,
      isSpanish ? "d MMM yyyy, h:mm a" : "MMM d yyyy, h:mm a",
      { locale: dateFnsLocale }
    );
  };
  const getCurrentAmount = (b: BookingData) => {
    return selectedDiscountOption === "with-discount"
      ? getPrepaymentAmount(b)
      : getBaseAmount(b);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("bookingData");
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
            {t.loadingData}
          </h2>
          <p className="text-gray-600">{t.noData}</p>
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

  const paymentDeadlineText = getPaymentDeadline(bookingData);
  const remainingBalanceAmount = formatCurrency(baseAmount - prepaymentAmount);

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
          // Se recomienda usar el formato completo con la hora de check-in si está disponible
          checkInDateHour: bookingData.checkIn + "T" + bookingData.checkInHour,
          checkOutDateHour: bookingData.checkOut + "T" + getCurrentIsoTime(), // Hora actual, esto podría requerir revisión
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

        // Redirigir usando el idioma
        window.location.href = `/${lang}/checkout`;
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
              <Link href={`/${lang}/rooms/${bookingData.room}`}>{t.back}</Link>{" "}
              {/* TRADUCIDO */}
            </span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-800">
              {t.confirmAndPay} {/* TRADUCIDO */}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t.confirmAndPay}
          </h1>{" "}
          {/* TRADUCIDO */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.paymentOptions} {/* TRADUCIDO */}
            </h2>

            <PaymentOption
              selected={selectedDiscountOption === "no-discount"}
              onClick={() => setSelectedDiscountOption("no-discount")}
              label={t.fullPayment}
              description={t.fullPaymentDesc}
              amount={baseAmount}
              color="blue"
              formatCurrency={formatCurrency}
            />

            <PaymentOption
              selected={selectedDiscountOption === "with-discount"}
              onClick={() => setSelectedDiscountOption("with-discount")}
              label={t.prepayment(bookingData.prepayment_percentage)}
              description={t.prepaymentDesc(bookingData.prepayment_percentage)}
              extraInfo={t.remainingBalance(
                remainingBalanceAmount,
                paymentDeadlineText
              )}
              amount={prepaymentAmount}
              color="green"
              formatCurrency={formatCurrency}
            />
          </div>
          <CancellationPolicy t={t} /> {/* PASAR T */}
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
              {t.acceptTerms} {/* TRADUCIDO */}
              <Link
                href={`/${lang}/policy`}
                className="text-blue-600 hover:underline"
              >
                {" "}
                {t.refundPolicy}
              </Link>{" "}
              {/* TRADUCIDO + LANG */}
            </label>
          </div>
          <Button
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-500 text-white font-semibold py-6 px-6 rounded-lg text-lg"
            disabled={!agreedToTerms}
            onClick={handleConfirmAndPay}
          >
            {t.paymentButton(formatCurrency(currentAmount))} {/* TRADUCIDO */}
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
          t={t} // PASAR T
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
  formatCurrency, // Recibir formatCurrency como prop
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
          {formatCurrency(amount)} {/* USAR formatCurrency */}
        </span>
      </div>
    </div>
  );
}

function CancellationPolicy({ t }: { t: Translations }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {t.cancellationPolicyTitle}
      </h2>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p>
              {t.cancellationPolicyAlert} {/* TRADUCIDO */}
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
  t, // Recibir t
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
  t: Translations;
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
              <p className="text-sm text-gray-600">
                {bookingData.propertyName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t.summaryOwner}: {bookingData.ownerName}
              </p>
            </div>
            <div className="w-[90px] aspect-[3/2] relative rounded-md overflow-hidden">
  <Image
    src={
      bookingData.photo
        ? `/webapi/assets/${bookingData.photo}?key=medium`
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
                {formatDate(bookingData.checkIn)} →{" "}
                {formatDate(bookingData.checkOut)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>
                {t.summaryGuest(bookingData.guests)} x{" "}
                {t.summaryNight(bookingData.nights)} ={" "}
                {formatCurrency(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {t.summaryDiscount(discountLabel)} = -{" "}
                  {formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>
                {t.summaryCleaning} = {formatCurrency(bookingData.cleaning)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">
                {selectedDiscountOption === "with-discount"
                  ? t.summaryTitlePre
                  : t.summaryTitleFull}
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
                  {t.summaryAnticipo()} {formatCurrency(prepaymentAmount)}{" "}
                  {t.summaryAnticipoPercent(bookingData.prepayment_percentage)}
                </div>
                <div className="text-sm text-gray-600">
                  {t.summaryPending}{" "}
                  {formatCurrency(baseAmount - prepaymentAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  {t.summaryTotalReservation} {formatCurrency(baseAmount)}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
