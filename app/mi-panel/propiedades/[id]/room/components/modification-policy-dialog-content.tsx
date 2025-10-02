"use client"

import { Edit, Info } from "lucide-react"

export function ModificationPolicyDialogContent() {
  return (
    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
      <h4 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
        <Edit className="h-4 w-4" />
        Políticas de Modificación de Reserva
      </h4>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">¿Qué es la Modificación de Reserva?</p>
            <p>
              La modificación de reserva permite cambiar aspectos de una reserva confirmada, como fechas o detalles de
              huéspedes. Las condiciones varían según el tipo de estadía y el plazo antes del check-in.
            </p>
          </div>
        </div>
      </div>
      <div className="text-sm text-blue-700 space-y-4">
        {/* Estadías Cortas y Medias */}
        <div>
          <p className="font-semibold text-red-800 mb-2">Estadías Cortas y Medias (1-9 noches):</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-red-600">•</span>
              <span>
                <strong>Modificaciones:</strong> No permitidas
              </span>
            </div>
          </div>
        </div>

        {/* Estadías Largas */}
        <div>
          <p className="font-semibold text-green-800 mb-2">Estadías Largas (+10 noches):</p>
          <div className="space-y-1 ml-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                <strong>Modificaciones:</strong> 1 modificación gratuita (cambio de fechas y otras variantes de la
                reserva).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">•</span>
              <span>
                Aplicable hasta 6 meses antes del check-in, o hasta 72 horas antes del check-in si la reserva es para
                menos de 6 meses.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">•</span>
              <span>
                <strong>Cambio de fechas:</strong> Al cambiar las fechas de la reserva, el monto puede variar. La
                diferencia de precio se sumará o restará al saldo pendiente de pago.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
