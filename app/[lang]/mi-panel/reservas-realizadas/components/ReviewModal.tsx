"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { StarRating } from "./StarRating"
import { type Locale } from "@/lib/i18n" // Importación requerida

// --- Objeto de Traducción ---
const translations = {
  es: {
    title: "Califica tu experiencia",
    cleanlinessTitle: "Limpieza",
    cleanlinessDesc: "¿Qué tan limpia estaba la habitación?",
    attentionTitle: "Atención",
    attentionDesc: "¿Cómo fue la atención del personal?",
    locationTitle: "Ubicación",
    locationDesc: "¿Qué tan conveniente fue la ubicación?",
    accuracyTitle: "Comodidad",
    accuracyDesc: "¿Qué tan cómoda fue tu estadía?",
    commentTitle: "Comentario",
    commentPlaceholder: "Comparte tu experiencia...",
    warning: "Debes seleccionar al menos una calificación para comentar",
    average: "Promedio",
    cancelButton: "Cancelar",
    submitButton: "Enviar Reseña",
  },
  en: {
    title: "Rate your experience",
    cleanlinessTitle: "Cleanliness",
    cleanlinessDesc: "How clean was the room?",
    attentionTitle: "Attention",
    attentionDesc: "How was the staff attention?",
    locationTitle: "Location",
    locationDesc: "How convenient was the location?",
    accuracyTitle: "Comfort",
    accuracyDesc: "How comfortable was your stay?",
    commentTitle: "Comment",
    commentPlaceholder: "Share your experience...",
    warning: "You must select at least one rating to submit a review",
    average: "Average",
    cancelButton: "Dismiss",
    submitButton: "Submit Review",
  },
}

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (ranking: Ratings, comment: string) => void
  bookingId: string
  lang: Locale // ✅ Prop de idioma agregada
}

interface Ratings {
  cleanliness: number
  attention: number
  location: number
  accuracy: number
}

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  //bookingId,
  lang, // ✅ Recibir lang como prop
}: ReviewModalProps) {
  // console.log(bookingId)

  const t = translations[lang] || translations.es // Obtener traducciones

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
    // Resetear el estado después de enviar
    setRatings({ cleanliness: 0, attention: 0, location: 0, accuracy: 0 })
    setComment("")
    onClose() // Cerrar modal al enviar
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.title} {/* <-- TRADUCIDO */}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ⭐ Criterios en dos columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t.cleanlinessTitle} {/* <-- TRADUCIDO */}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {t.cleanlinessDesc} {/* <-- TRADUCIDO */}
            </p>
            <StarRating
              rating={ratings.cleanliness}
              onRate={(value: number) => handleRatingChange("cleanliness", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t.attentionTitle} {/* <-- TRADUCIDO */}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {t.attentionDesc} {/* <-- TRADUCIDO */}
            </p>
            <StarRating
              rating={ratings.attention}
              onRate={(value: number) => handleRatingChange("attention", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t.locationTitle} {/* <-- TRADUCIDO */}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {t.locationDesc} {/* <-- TRADUCIDO */}
            </p>
            <StarRating
              rating={ratings.location}
              onRate={(value: number) => handleRatingChange("location", value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t.accuracyTitle} {/* <-- TRADUCIDO */}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {t.accuracyDesc} {/* <-- TRADUCIDO */}
            </p>
            <StarRating
              rating={ratings.accuracy}
              onRate={(value: number) => handleRatingChange("accuracy", value)}
            />
          </div>
        </div>

        {/* Comentario */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {t.commentTitle} {/* <-- TRADUCIDO */}
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder={t.commentPlaceholder} 
          />
        </div>

        {!hasAtLeastOneRating() && (
          <p className="text-sm text-amber-600">
            {t.warning} {/* <-- TRADUCIDO */}
          </p>
        )}

        {/* Pie con promedio y botones */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {t.average}:{" "} {/* <-- TRADUCIDO */}
            <span className="font-semibold text-lg">
              {calculateAverage().toFixed(1)}
            </span>{" "}
            ⭐
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {t.cancelButton} {/* <-- TRADUCIDO */}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasAtLeastOneRating()}
              className="bg-[#39759E] hover:bg-[#2c5a7a] text-white"
            >
              {t.submitButton} {/* <-- TRADUCIDO */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal