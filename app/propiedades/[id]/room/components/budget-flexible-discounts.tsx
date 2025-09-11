"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"

interface StayRange {
  min: number
  max: number | null
}

interface BudgetFlexibleDiscountsProps {
  shortStayDiscount: string
  setShortStayDiscount: (value: string) => void
  mediumStayDiscount: string
  setMediumStayDiscount: (value: string) => void
  longStayDiscount: string
  setLongStayDiscount: (value: string) => void
  // Nuevas props para configurar los descuentos
  shortStayDiscounts?: string[]
  mediumStayDiscounts?: string[]
  longStayDiscounts?: string[]
  defaultShortStayDiscount?: string
  defaultMediumStayDiscount?: string
  defaultLongStayDiscount?: string
  // Nuevas props para los rangos de noches
  shortStayRange?: StayRange
  mediumStayRange?: StayRange
  longStayRange?: StayRange
}

export function BudgetFlexibleDiscounts({
  shortStayDiscount,
  setShortStayDiscount,
  mediumStayDiscount,
  setMediumStayDiscount,
  longStayDiscount,
  setLongStayDiscount,
  shortStayDiscounts = ["0"],
  mediumStayDiscounts = ["0", "5", "10", "15"],
  longStayDiscounts = ["0", "15", "20"],
  defaultShortStayDiscount = "0",
  defaultMediumStayDiscount = "0",
  defaultLongStayDiscount = "0",
  // Valores por defecto para los rangos
  shortStayRange = { min: 1, max: 5 },
  mediumStayRange = { min: 6, max: 9 },
  longStayRange = { min: 10, max: null },
}: BudgetFlexibleDiscountsProps) {
  // Función para formatear el rango de noches
  const formatNightRange = (range: StayRange): string => {
    if (range.max === null) {
      return `+${range.min} noches`
    }
    if (range.min === range.max) {
      return `${range.min} noche${range.min > 1 ? "s" : ""}`
    }
    return `${range.min}-${range.max} noches`
  }

  return (
    <div className="p-4 bg-white rounded-xl">
      {/* Título principal */}
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          Descuentos por Duración de Estadía
        </h3>
      </div>

      {/* Estadía Corta - Ahora con rango dinámico */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <span className="font-medium text-gray-800 text-sm">Estadía Corta</span>
              <span className="text-xs text-gray-600 ml-2">({formatNightRange(shortStayRange)})</span>
            </div>
          </div>
          {shortStayDiscounts.length === 1 && shortStayDiscounts[0] === "0" ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Sin descuento
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {defaultShortStayDiscount === "0" ? "Sin descuento" : `${defaultShortStayDiscount}% descuento`}
            </span>
          )}
        </div>
      </div>

      {/* Estadías Media y Larga en 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Estadía Media - Con rango dinámico */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <span className="font-medium text-gray-800 text-sm">Estadía Media</span>
                <span className="text-xs text-gray-600 ml-1">({formatNightRange(mediumStayRange)})</span>
              </div>
            </div>

            <Select value={mediumStayDiscount} onValueChange={setMediumStayDiscount}>
              <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 h-8 text-sm">
                <SelectValue placeholder="Seleccionar descuento" />
              </SelectTrigger>
              <SelectContent>
                {mediumStayDiscounts.map((discount) => (
                  <SelectItem key={discount} value={discount}>
                    {discount === "0" ? "Sin descuento" : `${discount}% de descuento`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {mediumStayDiscount !== "0" && (
              <div className="bg-blue-100 p-2 rounded text-xs text-blue-800">
                <strong>Ahorro:</strong> {mediumStayDiscount}% sobre el total
              </div>
            )}
          </div>
        </div>

        {/* Estadía Larga - Con rango dinámico */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <span className="font-medium text-gray-800 text-sm">Estadía Larga</span>
                <span className="text-xs text-gray-600 ml-1">({formatNightRange(longStayRange)})</span>
              </div>
            </div>

            <Select value={longStayDiscount} onValueChange={setLongStayDiscount}>
              <SelectTrigger className="bg-white border-purple-200 focus:border-purple-400 h-8 text-sm">
                <SelectValue placeholder="Seleccionar descuento" />
              </SelectTrigger>
              <SelectContent>
                {longStayDiscounts.map((discount) => (
                  <SelectItem key={discount} value={discount}>
                    {discount === "0" ? "Sin descuento" : `${discount}% de descuento`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {longStayDiscount !== "0" && (
              <div className="bg-purple-100 p-2 rounded text-xs text-purple-800">
                <strong>Ahorro:</strong> {longStayDiscount}% + 1 modificación gratuita
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
