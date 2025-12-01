"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { type Locale } from "@/lib/i18n" // Importación requerida

// --- Objeto de Traducción ---
const translations = {
  es: {
    title: "¿Está seguro que desea anular la reserva?",
    placeholder: "Ingrese el motivo de la cancelación...",
    cancelButton: "Cancelar",
    confirmButton: "Anular Reserva",
  },
  en: {
    title: "Are you sure you want to cancel the booking?",
    placeholder: "Enter the reason for cancellation...",
    cancelButton: "Dismiss",
    confirmButton: "Cancel Booking",
  },
}

interface CancelBookingModalProps {
  isOpen: boolean
  cancelReason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onClose: () => void
  lang: Locale // ✅ Prop de idioma agregada
}

export const CancelBookingModal = ({
  isOpen,
  cancelReason,
  onReasonChange,
  onConfirm,
  onClose,
  lang, // ✅ Recibir lang como prop
}: CancelBookingModalProps) => {
  if (!isOpen) return null

  const t = translations[lang] || translations.es // Obtener traducciones

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.title} 
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <textarea
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder={t.placeholder} 
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {t.cancelButton}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!cancelReason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t.confirmButton} 
          </Button>
        </div>
      </div>
    </div>
  )
}