import { StarRating } from "./StarRating"

interface Review {
  id: string
  userName: string
  userLocation: string
  rating: number
  date: string
  stayType: string
  comment: string
  avatar: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-border pb-6 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground">{review.userName}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{review.userLocation}</p>

          <div className="flex items-center gap-4 mb-3">
            <StarRating rating={review.rating} />
            <span className="text-sm text-muted-foreground">
              {review.date} • {review.stayType}
            </span>
          </div>

          <p className="text-foreground leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  )
}
