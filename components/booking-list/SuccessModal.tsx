"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">¡Reserva Anulada Exitosamente!</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            La reserva ha sido anulada correctamente. La devolución del dinero se procesará conforme a las políticas de
            reembolso establecidas por la plataforma. Ante cualquier consulta o aclaración, por favor comuníquese
            directamente con el equipo de soporte de la plataforma.
          </p>
        </div>
        <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white">
          Aceptar
        </Button>
      </div>
    </div>
  )
}

export default SuccessModal
