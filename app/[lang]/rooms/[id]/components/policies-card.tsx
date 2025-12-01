import { Clock, Percent, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PoliciesCardProps {
  checkInHour: string;
  checkOutHour: string;
  mediumStayDiscount: string;
  longStayDiscount: string;
  prepaymentPercentage: string;
  mediumStayRange: { min: number; max: number | null };
  longStayRange: { min: number; max: number | null };
  lang: string;
}

function formatTimeToAMPM(time: string): string {
  if (!time || time === "00:00:00") return "N/A";
  const [hourStr, minute] = time.split(":");
  let hour = Number.parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatDiscount(discount: string, isSpanish: boolean): string {
  const num = Number.parseFloat(discount);
  if (isNaN(num) || num === 0) {
    return isSpanish ? "Sin descuento" : "No discount";
  }
  return `${Math.round(num)}%`;
}

export function PoliciesCard({
  checkInHour,
  checkOutHour,
  mediumStayDiscount,
  longStayDiscount,
  prepaymentPercentage,
  mediumStayRange,
  longStayRange,
  lang,
}: PoliciesCardProps) {
  const isSpanish = lang === "es";

  // --- Traducciones ---
  const texts = {
    title: isSpanish ? "Políticas del hospedaje" : "Accommodation Policies",
    subtitle: isSpanish ? "Información importante sobre horarios, descuentos y pagos" : "Important information about schedules, discounts, and payments",
    checkInTitle: isSpanish ? "Horario de Entrada" : "Check-in Time",
    checkOutTitle: isSpanish ? "Horario de Salida" : "Check-out Time",
    discountsTitle: isSpanish ? "Descuentos por Estadía" : "Stay Discounts",
    mediumStay: isSpanish ? "Estadía Media" : "Medium Stay",
    longStay: isSpanish ? "Estadía Larga" : "Long Stay",
    nights: isSpanish ? "noches" : "nights",
    prepaymentTitle: isSpanish ? "Adelanto de Pago" : "Prepayment",
    footer: isSpanish ? "Las políticas se aplican solamente a este hospedaje" : "Policies apply only to this accommodation",
  };

  const formattedMediumDiscount = formatDiscount(mediumStayDiscount, isSpanish);
  const formattedLongDiscount = formatDiscount(longStayDiscount, isSpanish);
  const formattedPrepayment = formatDiscount(prepaymentPercentage, isSpanish);

  const longStayRangeText = longStayRange.max === null || longStayRange.max === 10000 
    ? `${longStayRange.min}+ ${texts.nights}` 
    : `${longStayRange.min} - ${longStayRange.max} ${texts.nights}`;
    
  const mediumStayRangeText = mediumStayRange.max === null
    ? `${mediumStayRange.min}+ ${texts.nights}` 
    : `${mediumStayRange.min} - ${mediumStayRange.max} ${texts.nights}`;

  return (
    <Card className="w-full max-w-3xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800">
          {texts.title}
        </CardTitle>
        <p className="text-slate-600 mt-2">
          {texts.subtitle}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Check-in/Check-out Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {texts.checkInTitle}
              </h3>
              <p className="text-lg font-bold text-blue-600">
                {formatTimeToAMPM(checkInHour)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {texts.checkOutTitle}
              </h3>
              <p className="text-lg font-bold text-orange-600">
                {formatTimeToAMPM(checkOutHour)}
              </p>
            </div>
          </div>
        </div>

        {/* Discounts Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <Percent className="h-5 w-5 mr-2 text-green-600" />
            {texts.discountsTitle}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">
                  {texts.mediumStay}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {formattedMediumDiscount}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {mediumStayRangeText}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">
                  {texts.longStay}
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  {formattedLongDiscount}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {longStayRangeText}
              </p>
            </div>
          </div>
        </div>

        {/* Prepayment Section */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{texts.prepaymentTitle}</h3>
              <p className="text-slate-600">
                {/* Lógica de traducción segura y sin duplicados */}
                {isSpanish ? (
                  <>
                    Puedes reservar con un anticipo del{" "}
                    <span className="font-bold text-purple-600">
                      {formattedPrepayment}
                    </span>{" "}
                    del total. Solo aplican si faltan más de 72 horas para el
                    check-in. Para ingresos dentro de las próximas 72 horas, deberás
                    abonar el monto total.
                  </>
                ) : (
                  <>
                    You can reserve with a prepayment of{" "}
                    <span className="font-bold text-purple-600">
                      {formattedPrepayment}
                    </span>{" "}
                    of the total. Only applies if check-in is more than 72 hours away.
                    For check-ins within the next 72 hours, the full amount must be paid.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {texts.footer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}