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
import { CancellationPolicyDialogContent } from "@/components/popups/cancellation-policy-dialog-content"
import { ModificationPolicyDialogContent } from "@/components/popups/modification-policy-dialog-content"

interface PolicyDialogButtonsProps {
  lang: string
}

export function PolicyDialogButtons({ lang }: PolicyDialogButtonsProps) {
  const isSpanish = lang === "es";

  const texts = {
    cancellationButton: isSpanish ? "Ver Políticas de Anulación" : "View Cancellation Policies",
    cancellationTitle: isSpanish ? "Políticas de Anulación de Reserva" : "Reservation Cancellation Policies",
    cancellationDescription: isSpanish ? "Detalles sobre las condiciones de cancelación para diferentes tipos de estadía." : "Details about cancellation conditions for different stay types.",

    modificationButton: isSpanish ? "Ver Políticas de Modificación" : "View Modification Policies",
    modificationTitle: isSpanish ? "Políticas de Modificación de Reserva" : "Reservation Modification Policies",
    modificationDescription: isSpanish ? "Detalles sobre las condiciones para modificar una reserva existente." : "Details about conditions for modifying an existing reservation.",
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-16 w-full">
      {/* Botón para Políticas de Anulación */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <AlertCircle className="h-4 w-4 mr-2" />
            {texts.cancellationButton}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{texts.cancellationTitle}</DialogTitle>
            <DialogDescription>
              {texts.cancellationDescription}
            </DialogDescription>
          </DialogHeader>
          <CancellationPolicyDialogContent lang={lang} />
        </DialogContent>
      </Dialog>

      {/* Botón para Políticas de Modificación */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            {texts.modificationButton}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{texts.modificationTitle}</DialogTitle>
            <DialogDescription>{texts.modificationDescription}</DialogDescription>
          </DialogHeader>
          <ModificationPolicyDialogContent lang={lang} />
        </DialogContent>
      </Dialog>
    </div>
  )
}