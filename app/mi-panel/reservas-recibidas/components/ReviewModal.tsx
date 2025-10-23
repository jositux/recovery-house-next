"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { StarRating } from "./StarRating"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (ranking: Ratings, comment: string) => void
  bookingId: string
}

interface Ratings {
  cleanliness: number
  attention: number
  location: number
  accuracy: number
}

export function ReviewModal({ isOpen, onClose, onSubmit, bookingId }: ReviewModalProps) {
 console.log(bookingId)
  const [ratings, setRatings] = useState<Ratings>({
    cleanliness: 0,
    attention: 0,
    location: 0,
    accuracy: 0,
  })
  const [comment, setComment] = useState("")

  const handleRatingChange = (category: keyof Ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const calculateAverage = () => {
    const values = Object.values(ratings).filter((rating) => rating > 0)
    if (values.length === 0) return 0
    return values.reduce((sum, rating) => sum + rating, 0) / values.length
  }

  const hasAtLeastOneRating = () => Object.values(ratings).some((rating) => rating > 0)

  const handleSubmit = () => {
    //const average = calculateAverage()
    onSubmit(ratings, comment)
    setRatings({ cleanliness: 0, attention: 0, location: 0, accuracy: 0 })
    setComment("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Califica tu experiencia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ⭐ Criterios en dos columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Limpieza</h3>
            <p className="text-sm text-gray-600 mb-2">¿Qué tan limpia estaba la habitación?</p>
            <StarRating
              rating={ratings.cleanliness}
              onRate={(value: number) => handleRatingChange("cleanliness", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Atención</h3>
            <p className="text-sm text-gray-600 mb-2">¿Cómo fue la atención del personal?</p>
            <StarRating
              rating={ratings.attention}
              onRate={(value: number) => handleRatingChange("attention", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Ubicación</h3>
            <p className="text-sm text-gray-600 mb-2">¿Qué tan conveniente fue la ubicación?</p>
            <StarRating
              rating={ratings.location}
              onRate={(value: number) => handleRatingChange("location", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Comodidad</h3>
            <p className="text-sm text-gray-600 mb-2">¿Qué tan cómoda fue tu estadía?</p>
            <StarRating
              rating={ratings.accuracy}
              onRate={(value: number) => handleRatingChange("accuracy", value)}
            />
          </div>
        </div>

        {/* Comentario */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Comentario</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Comparte tu experiencia..."
          />
        </div>

        {!hasAtLeastOneRating() && (
          <p className="text-sm text-amber-600">
            Debes seleccionar al menos una calificación para comentar
          </p>
        )}

        {/* Pie con promedio y botones */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Promedio:{" "}
            <span className="font-semibold text-lg">
              {calculateAverage().toFixed(1)}
            </span>{" "}
            ⭐
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasAtLeastOneRating()}
              className="bg-[#39759E] hover:bg-[#2c5a7a] text-white"
            >
              Enviar Reseña
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
