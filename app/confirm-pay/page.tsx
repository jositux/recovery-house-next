"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Users, CheckCircle2, AlertCircle } from "lucide-react"

export default function NewConfirmAndPay() {
  const [selectedDiscountOption, setSelectedDiscountOption] = useState("no-discount")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Montos de ejemplo
  const baseAmount = 1250.75
  const advancePaymentPercentage = 10
  const advancePaymentAmount = baseAmount * (advancePaymentPercentage / 100)

  const getCurrentAmount = () => {
    return selectedDiscountOption === "with-discount" ? advancePaymentAmount : baseAmount
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sección Izquierda: Opciones de Pago */}
        <div className="lg:col-span-2 space-y-8">
          {/* Migas de pan */}
          <div className="text-sm text-gray-500">
            <span className="font-medium">1. Revisar detalles del viaje</span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-800">2. Confirmar y pagar</span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900">Confirmar y pagar</h1>

          {/* Selección de Opciones de Pago */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Opciones de Pago</h2>

            {/* Opción Tarifa Estándar - Pago Total */}
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                selectedDiscountOption === "no-discount"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedDiscountOption("no-discount")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedDiscountOption === "no-discount" ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">Pago Total</span>
                    <p className="text-sm text-gray-600">Paga el monto completo ahora</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">${baseAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Opción Pago Anticipado */}
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                selectedDiscountOption === "with-discount"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedDiscountOption("with-discount")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedDiscountOption === "with-discount" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">Pago Anticipado ({advancePaymentPercentage}%)</span>
                    <p className="text-sm text-gray-600">
                      Paga solo el {advancePaymentPercentage}% ahora, el resto antes del check-in
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Saldo restante: ${(baseAmount - advancePaymentAmount).toFixed(2)} (debe pagarse antes del 25 de
                      julio de 2025)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${advancePaymentAmount.toFixed(2)}</span>
                  <div className="text-xs text-gray-500">ahora</div>
                </div>
              </div>
            </div>
          </div>

          {/* Política de Cancelación */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Política de anulación de reserva:</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                 
                  <p>
                    Anulación gratuita hasta 72 horas antes del check-in. Después de este período, no hay reembolso
                    disponible.
                  </p>
                  {selectedDiscountOption === "with-discount" && (
                    <p className="mt-2 text-blue-800">
                      <strong>Pago Anticipado:</strong> Si cancelas después de las 72 horas, se reembolsa el monto
                      pagado menos el anticipo. Si no completas el pago del saldo antes de las 72 horas del check-in,
                      pierdes el anticipo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Acuerdo de Términos */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              Acepto la{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Reembolso para Huéspedes
              </a>
              .
            </label>
          </div>

          {/* Botón Confirmar y Pagar */}
          <Button
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-500 text-white font-semibold py-6 px-6 rounded-lg text-lg"
            disabled={!agreedToTerms}
          >
            Confirmar y pagar ${getCurrentAmount().toFixed(2)}
          </Button>
        </div>

        {/* Sección Derecha: Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    Casa Moderna en <br />
                    Distrito de Haight
                  </h3>
                  <p className="text-sm text-gray-600">Ibagué Tolima Colombia</p>
                </div>
                <img
                  src="http://localhost:3000/_next/image?url=%2Fwebapi%2Fassets%2Fb20d1424-efea-4327-b21c-5a298d3eb890%3Fkey%3Dmedium&w=3840&q=75"
                  alt="Casa Moderna Soleada"
                  className="w-24 h-16 object-cover rounded-md"
                />
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span>23 de julio de 2025 → 28 de julio de 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>2 huéspedes</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    {selectedDiscountOption === "with-discount" ? "Pago Anticipado" : "Total"}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-lg">${getCurrentAmount().toFixed(2)}</span>
                  </div>
                </div>

                {selectedDiscountOption === "with-discount" && (
                  <>
                    <div className="text-sm text-blue-600">
                      Anticipo: ${advancePaymentAmount.toFixed(2)} ({advancePaymentPercentage}% del total)
                    </div>
                    <div className="text-sm text-gray-600">
                      Saldo pendiente: ${(baseAmount - advancePaymentAmount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Total de la reserva: ${baseAmount.toFixed(2)}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
