import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: "sm" | "lg"
  showValue?: boolean
}

export function StarRating({ rating, size = "sm", showValue = false }: StarRatingProps) {
  const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4"
  const fullStars = Math.floor(rating)
  const hasPartialStar = rating % 1 !== 0
  const partialStarPercentage = (rating % 1) * 100

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          {star <= fullStars ? (
            <Star className={`${starSize} fill-rating-gold text-rating-gold`} />
          ) : star === fullStars + 1 && hasPartialStar ? (
            <div className="relative">
              <Star className={`${starSize} text-gray-300`} />
              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStarPercentage}%` }}>
                <Star className={`${starSize} fill-rating-gold text-rating-gold`} />
              </div>
            </div>
          ) : (
            <Star className={`${starSize} text-gray-300`} />
          )}
        </div>
      ))}
      {showValue && <span className="ml-1 font-semibold">{rating}</span>}
    </div>
  )
}
