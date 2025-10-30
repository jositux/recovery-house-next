"use client"

import { AlertCircle, Info } from "lucide-react"

export function CancellationPolicyDialogContent() {
  return (
    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
      <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Políticas de Anulación por Tipo de Estadía
      </h4>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">¿Qué es la Anulación de Reserva?</p>
            <p>
              La anulación de reserva se refiere al proceso de cancelar una reserva confirmada. Las políticas detallan
              las condiciones y posibles reembolsos según el momento de la anulación y el tipo de estadía.
            </p>
          </div>
        </div>
      </div>
      <div className="text-sm text-amber-700 space-y-4">
        {/* Estadía Corta */}
        <div>
          <p className="font-semibold text-blue-800 mb-2">Estadía Corta (1-5 noches):</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>Primeras 24 horas:</strong> Anulación gratuita con devolución del 100%.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>Después de 24hs:</strong> No hay reembolso. Se retiene el anticipo y el saldo pagado.
              </span>
            </div>
          </div>
        </div>

        {/* Estadía Media */}
        <div>
          <p className="font-semibold text-purple-800 mb-2">Estadía Media (6-9 noches):</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>Primeras 24 horas:</strong> Anulación gratuita con devolución del 100%.
              </span>
            </div>
            <div className="flex items-start gap-2">
  <span className="font-medium text-red-600">•</span>
  <span>
    <strong>Entre 24 y 72 horas antes del check-in:</strong> Se reintegra el monto total menos el anticipo, que se retiene como penalización.
  </span>
</div>
<div className="flex items-start gap-2">
  <span className="font-medium text-red-600">•</span>
  <span>
    <strong>Con menos de 72 horas para el check-in:</strong> No se realiza ningún reembolso. Se retiene el anticipo y cualquier saldo ya abonado.
  </span>
</div>

          </div>
        </div>

        {/* Estadía Larga */}
        <div>
          <p className="font-semibold text-green-800 mb-2">Estadía Larga (+10 noches):</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>Primeras 24 horas:</strong> Anulación gratuita con devolución del 100%.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-orange-600">•</span>
              <span>
                <strong>Entre 24 horas y 15 días desde la reserva:</strong> Se devuelve el 50% del monto pagado.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-orange-600">•</span>
              <span>
                <strong>Con menos 15 días desde la reserva:</strong> Se devuelve el monto total menos el anticipo, que
                se retiene como penalización.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>Si el pago del saldo no se completa 72 horas antes del check-in:</strong> Se pierde el anticipo como
                penalización.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
