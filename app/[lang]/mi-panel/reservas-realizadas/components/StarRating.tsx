"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRate: (rating: number) => void
  maxStars?: number
}

export function StarRating({ rating, onRate, maxStars = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button" onClick={() => onRate(star)} className="transition-transform hover:scale-110">
          <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )
}
