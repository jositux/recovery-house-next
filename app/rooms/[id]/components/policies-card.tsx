import { Clock, Percent, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PoliciesCardProps {
  checkInHour: string
  checkOutHour: string
  mediumStayDiscount: string
  longStayDiscount: string
  prepaymentPercentage: string
  mediumStayRange: { min: number; max: number | null }
  longStayRange: { min: number; max: number | null }
}

function formatTimeToAMPM(time: string): string {
  const [hourStr, minute] = time.split(":")
  let hour = Number.parseInt(hourStr, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12
  return `${hour}:${minute} ${ampm}`
}

function formatDiscount(discount: string): string {
  const num = Number.parseFloat(discount)
  if (isNaN(num) || num === 0) {
    return "Sin descuento"
  }
  return `${Math.round(num)}%`
}

export function PoliciesCard({
  checkInHour,
  checkOutHour,
  mediumStayDiscount,
  longStayDiscount,
  prepaymentPercentage,
  mediumStayRange,
  longStayRange,
}: PoliciesCardProps) {
  return (
    <Card className="w-full max-w-3xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800">Políticas del hospedaje</CardTitle>
        <p className="text-slate-600 mt-2">Información importante sobre horarios, descuentos y pagos</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Check-in/Check-out Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Horario de Entrada</h3>
              <p className="text-lg font-bold text-blue-600">{formatTimeToAMPM(checkInHour)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Horario de Salida</h3>
              <p className="text-lg font-bold text-orange-600">{formatTimeToAMPM(checkOutHour)}</p>
            </div>
          </div>
        </div>

        {/* Discounts Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <Percent className="h-5 w-5 mr-2 text-green-600" />
            Descuentos por Estadía
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Estadía Media</span>
                <span className="text-xl font-bold text-green-600">{formatDiscount(mediumStayDiscount)}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {mediumStayRange.min} - {mediumStayRange.max} noches
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Estadía Larga</span>
                <span className="text-xl font-bold text-emerald-600">{formatDiscount(longStayDiscount)}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{longStayRange.min}+ noches</p>
            </div>
          </div>
        </div>

        {/* Prepayment Section */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Adelanto de Pago</h3>
              <p className="text-slate-600">
                Puedes hacer un adelanto del{" "}
                <span className="font-bold text-purple-600">{formatDiscount(prepaymentPercentage)}</span> del total
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">Las políticas se aplican solamente a este hospedaje</p>
        </div>
      </CardContent>
    </Card>
  )
}
