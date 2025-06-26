"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface CannotDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "room" | "property"
}

export function CannotDeleteDialog({ isOpen, onClose, type }: CannotDeleteDialogProps) {
  const title = type === "room" ? "No se puede eliminar el alojamiento" : "No se puede eliminar la propiedad"

  const description =
    type === "room"
      ? "Este alojamiento tiene reservas activas o futuras. Para eliminarla, primero debes cancelar todas las reservas asociadas."
      : "Esta propiedad tiene habitaciones con reservas activas o futuras. Para eliminarla, primero debes cancelar todas las reservas asociadas a sus habitaciones."

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600 gap-2">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-700">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="bg-[#39759E] hover:bg-[#2c5a7a] text-white font-medium">
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Make sure the component is exported as default as well
export default CannotDeleteDialog

