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

// --- Interfaces for Translations ---

interface Translation {
  title: string
  description: string
  button: string
}

// --- Translation Data ---

const translations = {
  es: {
    room: {
      title: "No se puede eliminar el alojamiento",
      description: "Este alojamiento tiene reservas activas o futuras. Para eliminarla, primero debes cancelar todas las reservas asociadas.",
    },
    property: {
      title: "No se puede eliminar la propiedad",
      description: "Esta propiedad tiene habitaciones con reservas activas o futuras. Para eliminarla, primero debes cancelar todas las reservas asociadas a sus habitaciones.",
    },
    button: "Aceptar",
  } as Record<"room" | "property", Omit<Translation, "button">> & { button: string },
  en: {
    room: {
      title: "Cannot Delete Room",
      description: "This room has active or future bookings. To delete it, you must first cancel all associated bookings.",
    },
    property: {
      title: "Cannot Delete Property",
      description: "This property has rooms with active or future bookings. To delete it, you must first cancel all associated bookings for its rooms.",
    },
    button: "Confirm",
  } as Record<"room" | "property", Omit<Translation, "button">> & { button: string },
  // Add more languages as needed
}

// --- Component Props Update ---

interface CannotDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "room" | "property"
  // Added 'lang' prop
  lang: string
}

export function CannotDeleteDialog({ isOpen, onClose, type, lang }: CannotDeleteDialogProps) {
  // Determine if the current language is Spanish based on the lang prop
  const isSpanish = lang.toLowerCase().startsWith("es")

  // Select the appropriate translation object based on the language
  const currentTranslations = isSpanish ? translations.es : translations.en
  
  // Get the specific messages based on 'type'
  const { title, description } = currentTranslations[type]
  const buttonText = currentTranslations.button
  
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
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Make sure the component is exported as default as well
export default CannotDeleteDialog