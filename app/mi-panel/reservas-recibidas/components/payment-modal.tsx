"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  balanceAmount: string
  onConfirm: () => void
  onClose: () => void
}

export const PaymentModal = ({ isOpen, balanceAmount, onConfirm, onClose }: PaymentModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Pago de Saldo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">¿Está seguro que desea pagar el saldo pendiente?</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-semibold text-lg">Monto a pagar: ${balanceAmount} USD</p>
          </div>
          <p className="text-sm text-gray-500">Con este pago tendrá toda la reserva completamente pagada.</p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white">
            Pagar
          </Button>
        </div>
      </div>
    </div>
  )
}
