"use client"

import { AlertCircle, Info } from "lucide-react"

interface CancellationPolicyDialogContentProps {
  lang: string
}

export function CancellationPolicyDialogContent({ lang }: CancellationPolicyDialogContentProps) {
  const isSpanish = lang === "es";

  const texts = {
    title: isSpanish ? "Políticas de Anulación por Tipo de Estadía" : "Cancellation Policies by Stay Type",
    whatIsTitle: isSpanish ? "¿Qué es la Anulación de Reserva?" : "What is Reservation Cancellation?",
    whatIsContent: isSpanish ? "La anulación de reserva se refiere al proceso de cancelar una reserva confirmada. Las políticas detallan las condiciones y posibles reembolsos según el momento de la anulación y el tipo de estadía." : "Reservation cancellation refers to the process of canceling a confirmed booking. Policies detail the conditions and possible refunds based on the timing of the cancellation and the type of stay.",
    
    // Stays
    shortStayTitle: isSpanish ? "Estadía Corta (1-5 noches):" : "Short Stay (1-5 nights):",
    mediumStayTitle: isSpanish ? "Estadía Media (6-9 noches):" : "Medium Stay (6-9 nights):",
    longStayTitle: isSpanish ? "Estadía Larga (+10 noches):" : "Long Stay (+10 nights):",
    
    // Common Policy Points
    first24h: isSpanish ? "Primeras 24 horas:" : "First 24 hours:",
    first24hPolicy: isSpanish ? "Anulación gratuita con devolución del 100%." : "Free cancellation with 100% refund.",
    
    // Short Stay Specific
    after24h: isSpanish ? "Después de 24hs:" : "After 24 hours:",
    shortAfter24hPolicy: isSpanish ? "No hay reembolso. Se retiene el anticipo y el saldo pagado." : "No refund. The prepayment and the paid balance are retained.",

    // Medium Stay Specific
    between24h72h: isSpanish ? "Entre 24 y 72 horas antes del check-in:" : "Between 24 and 72 hours before check-in:",
    medium24h72hPolicy: isSpanish ? "Se reintegra el monto total menos el anticipo, que se retiene como penalización." : "The total amount minus the prepayment is refunded; the prepayment is retained as a penalty.",
    lessThan72h: isSpanish ? "Con menos de 72 horas para el check-in:" : "Less than 72 hours before check-in:",
    mediumLessThan72hPolicy: isSpanish ? "No se realiza ningún reembolso. Se retiene el anticipo y cualquier saldo ya abonado." : "No refund is issued. The prepayment and any already paid balance are retained.",
    
    // Long Stay Specific
    between24h15d: isSpanish ? "Entre 24 horas y 15 días desde la reserva:" : "Between 24 hours and 15 days from booking:",
    longBetween24h15dPolicy: isSpanish ? "Se devuelve el 50% del monto pagado." : "50% of the paid amount is refunded.",
    lessThan15d: isSpanish ? "Con menos 15 días desde la reserva:" : "Less than 15 days from booking:",
    longLessThan15dPolicy: isSpanish ? "Se devuelve el monto total menos el anticipo, que se retiene como penalización." : "The total amount minus the prepayment is refunded; the prepayment is retained as a penalty.",
    paymentFailure: isSpanish ? "Si el pago del saldo no se completa 72 horas antes del check-in:" : "If the balance payment is not completed 72 hours before check-in:",
    paymentFailurePolicy: isSpanish ? "Se pierde el anticipo como penalización." : "The prepayment is forfeited as a penalty.",
  };

  return (
    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
      <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
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
      <div className="text-sm text-amber-700 space-y-4">
        {/* Estadía Corta */}
        <div>
          <p className="font-semibold text-blue-800 mb-2">{texts.shortStayTitle}</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>{texts.first24h}</strong> {texts.first24hPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>{texts.after24h}</strong> {texts.shortAfter24hPolicy}
              </span>
            </div>
          </div>
        </div>

        {/* Estadía Media */}
        <div>
          <p className="font-semibold text-purple-800 mb-2">{texts.mediumStayTitle}</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>{texts.first24h}</strong> {texts.first24hPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>{texts.between24h72h}</strong> {texts.medium24h72hPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>{texts.lessThan72h}</strong> {texts.mediumLessThan72hPolicy}
              </span>
            </div>
          </div>
        </div>

        {/* Estadía Larga */}
        <div>
          <p className="font-semibold text-green-800 mb-2">{texts.longStayTitle}</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>{texts.first24h}</strong> {texts.first24hPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-orange-600">•</span>
              <span>
                <strong>{texts.between24h15d}</strong> {texts.longBetween24h15dPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-orange-600">•</span>
              <span>
                <strong>{texts.lessThan15d}</strong> {texts.longLessThan15dPolicy}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>{texts.paymentFailure}</strong> {texts.paymentFailurePolicy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}