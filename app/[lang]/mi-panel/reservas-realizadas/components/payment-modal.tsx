"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { type Locale } from "@/lib/i18n" // Importación requerida

// --- Objeto de Traducción ---
const translations = {
  es: {
    title: "Confirmar Pago de Saldo",
    prompt: "¿Está seguro que desea pagar el saldo pendiente?",
    amountToPay: (amount: string) => `Monto a pagar: $${amount} USD`,
    info: "Con este pago tendrá toda la reserva completamente pagada.",
    cancelButton: "Cancelar",
    confirmButton: "Pagar",
  },
  en: {
    title: "Confirm Balance Payment",
    prompt: "Are you sure you want to pay the outstanding balance?",
    amountToPay: (amount: string) => `Amount to pay: $${amount} USD`,
    info: "With this payment, the entire booking will be fully paid.",
    cancelButton: "Dismiss",
    confirmButton: "Pay",
  },
}

interface PaymentModalProps {
  isOpen: boolean
  balanceAmount: string
  onConfirm: () => void
  onClose: () => void
  lang: Locale // ✅ Prop de idioma agregada
}

export const PaymentModal = ({
  isOpen,
  balanceAmount,
  onConfirm,
  onClose,
  lang, // ✅ Recibir lang como prop
}: PaymentModalProps) => {
  if (!isOpen) return null

  const t = translations[lang] || translations.es // Obtener traducciones

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.title} {/* <-- TRADUCIDO */}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">{t.prompt}</p> {/* <-- TRADUCIDO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-semibold text-lg">
              {t.amountToPay(balanceAmount)} {/* <-- TRADUCIDO (con variable) */}
            </p>
          </div>
          <p className="text-sm text-gray-500">{t.info}</p> {/* <-- TRADUCIDO */}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {t.cancelButton} {/* <-- TRADUCIDO */}
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white">
            {t.confirmButton} {/* <-- TRADUCIDO */}
          </Button>
        </div>
      </div>
    </div>
  )
}