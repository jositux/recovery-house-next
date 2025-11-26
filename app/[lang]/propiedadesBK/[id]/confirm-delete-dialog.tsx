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
import { Trash } from "lucide-react"

interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "room" | "property"
  onConfirm: () => void
}

export function ConfirmDeleteDialog({ isOpen, onClose, type, onConfirm }: ConfirmDeleteDialogProps) {
  const title = type === "room" ? "¿Eliminar habitación?" : "¿Eliminar propiedad?"

  const description =
    type === "room"
      ? "Esta acción no se puede deshacer. La habitación será eliminada permanentemente del sistema."
      : "Esta acción no se puede deshacer. La propiedad y todas sus habitaciones serán eliminadas permanentemente del sistema."

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-gray-800 gap-2">
            <Trash className="h-5 w-5 text-red-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-700">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            En otro momento
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Also export as default
export default ConfirmDeleteDialog

