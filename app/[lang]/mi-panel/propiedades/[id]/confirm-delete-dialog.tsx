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

// --- Interfaces for Translations ---

interface Translation {
  title: string
  description: string
  cancelButton: string
  confirmButton: string
}

// --- Translation Data ---

const translations = {
  es: {
    room: {
      title: "¿Eliminar Alojamiento?",
      description: "Esta acción no se puede deshacer. El alojamiento será eliminado permanentemente del sistema.",
    },
    property: {
      title: "¿Eliminar propiedad?",
      description: "Esta acción no se puede deshacer. La propiedad y todas sus habitaciones / camas serán eliminadas permanentemente del sistema.",
    },
    cancelButton: "En otro momento",
    confirmButton: "Sí, eliminar",
  } as Record<"room" | "property", Omit<Translation, "cancelButton" | "confirmButton">> & { cancelButton: string, confirmButton: string },
  en: {
    room: {
      title: "Delete Room?",
      description: "This action cannot be undone. The room will be permanently deleted from the system.",
    },
    property: {
      title: "Delete Property?",
      description: "This action cannot be undone. The property and all its rooms / beds will be permanently deleted from the system.",
    },
    cancelButton: "Later",
    confirmButton: "Yes, delete",
  } as Record<"room" | "property", Omit<Translation, "cancelButton" | "confirmButton">> & { cancelButton: string, confirmButton: string },
  // Add more languages as needed
}

// --- Component Props Update ---

interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "room" | "property"
  onConfirm: () => void
  // Added 'lang' prop
  lang: string
}

export function ConfirmDeleteDialog({ isOpen, onClose, type, onConfirm, lang }: ConfirmDeleteDialogProps) {
  // Determine if the current language is Spanish based on the lang prop
  const isSpanish = lang.toLowerCase().startsWith("es")

  // Select the appropriate translation object based on the language
  // Default to English if the language is not explicitly supported
  const currentTranslations = isSpanish ? translations.es : translations.en
  
  // Get the specific messages based on 'type'
  const { title, description } = currentTranslations[type]
  const { cancelButton, confirmButton } = currentTranslations
  
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
            {cancelButton}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            {confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Also export as default
export default ConfirmDeleteDialog