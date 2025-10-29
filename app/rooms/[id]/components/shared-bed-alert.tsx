import { Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SharedBedAlert() {
  return (
    <Alert className="border-blue-200 bg-white/50 backdrop-blur-sm mb-6">
      <AlertDescription className="text-gray-700 font-medium">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              NOTA:
            </h3>
            <p className="text-sm leading-relaxed">
              Esta cama se alquila de manera individual, lo que significa que reservás un lugar dentro de una habitación
              compartida. Esta modalidad es ideal para quienes buscan una opción económica y están abiertos a compartir
              el espacio con otras personas.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
