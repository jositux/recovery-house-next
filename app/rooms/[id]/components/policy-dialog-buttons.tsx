import { AlertCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CancellationPolicyDialogContent } from "./cancellation-policy-dialog-content"
import { ModificationPolicyDialogContent } from "./modification-policy-dialog-content"

export function PolicyDialogButtons() {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-16 w-full">
      {/* Botón para Políticas de Anulación */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <AlertCircle className="h-4 w-4 mr-2" />
            Ver Políticas de Anulación
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Políticas de Anulación de Reserva</DialogTitle>
            <DialogDescription>
              Detalles sobre las condiciones de cancelación para diferentes tipos de estadía.
            </DialogDescription>
          </DialogHeader>
          <CancellationPolicyDialogContent />
        </DialogContent>
      </Dialog>

      {/* Botón para Políticas de Modificación */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Ver Políticas de Modificación
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Políticas de Modificación de Reserva</DialogTitle>
            <DialogDescription>Detalles sobre las condiciones para modificar una reserva existente.</DialogDescription>
          </DialogHeader>
          <ModificationPolicyDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  )
}
