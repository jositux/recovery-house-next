"use client"

import { Edit, Info } from "lucide-react"

interface ModificationPolicyDialogContentProps {
  lang: string
}

export function ModificationPolicyDialogContent({ lang }: ModificationPolicyDialogContentProps) {
  const isSpanish = lang === "es";

  const texts = {
    title: isSpanish ? "Políticas de Modificación de Reserva" : "Reservation Modification Policies",
    whatIsTitle: isSpanish ? "¿Qué es la Modificación de Reserva?" : "What is Reservation Modification?",
    whatIsContent: isSpanish ? "La modificación de reserva permite cambiar aspectos de una reserva confirmada, como fechas o detalles de huéspedes. Las condiciones varían según el tipo de estadía y el plazo antes del check-in." : "Reservation modification allows changing aspects of a confirmed booking, such as dates or guest details. Conditions vary depending on the type of stay and the period before check-in.",
    
    // Short/Medium Stays
    shortMediumStayTitle: isSpanish ? "Estadías Cortas y Medias (1-9 noches):" : "Short and Medium Stays (1-9 nights):",
    modifications: isSpanish ? "Modificaciones:" : "Modifications:",
    notAllowed: isSpanish ? "No permitidas" : "Not allowed",
    
    // Long Stays
    longStayTitle: isSpanish ? "Estadías Largas (+10 noches):" : "Long Stays (+10 nights):",
    longModificationPolicy: isSpanish ? "1 modificación gratuita (cambio de fechas y otras variantes de la reserva)." : "1 free modification (change of dates and other booking variants).",
    longModificationTimeframe: isSpanish ? "Aplicable hasta 6 meses antes del check-in, o hasta 72 horas antes del check-in si la reserva es para menos de 6 meses." : "Applicable up to 6 months before check-in, or up to 72 hours before check-in if the booking is for less than 6 months.",
    dateChangeTitle: isSpanish ? "Cambio de fechas:" : "Date change:",
    dateChangePolicy: isSpanish ? "Al cambiar las fechas de la reserva, el monto puede variar. La diferencia de precio se sumará o restará al saldo pendiente de pago." : "When changing booking dates, the amount may vary. The price difference will be added to or subtracted from the pending balance.",
  };

  return (
    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
      <h4 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
        <Edit className="h-4 w-4" />
        {texts.title}
      </h4>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">{texts.whatIsTitle}</p>
            <p>{texts.whatIsContent}</p>
          </div>
        </div>
      </div>
      <div className="text-sm text-blue-700 space-y-4">
        {/* Estadías Cortas y Medias */}
        <div>
          <p className="font-semibold text-red-800 mb-2">{texts.shortMediumStayTitle}</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>{texts.modifications}</strong> {texts.notAllowed}
              </span>
            </div>
          </div>
        </div>

        {/* Estadías Largas */}
        <div>
          <p className="font-semibold text-green-800 mb-2">{texts.longStayTitle}</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>{texts.modifications}</strong> {texts.longModificationPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                {texts.longModificationTimeframe}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">•</span>
              <span>
                <strong>{texts.dateChangeTitle}</strong> {texts.dateChangePolicy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}