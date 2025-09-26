import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StarRating } from "./StarRating"
import { ReviewCard } from "./ReviewCard"

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

interface ReviewsModalProps {
  isOpen: boolean
  onClose: (open: boolean) => void
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function ReviewsModal({ isOpen, onClose, reviews, averageRating, totalReviews }: ReviewsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Evaluaciones de huéspedes</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={averageRating} showValue />
            <span className="text-muted-foreground">• {totalReviews} evaluaciones</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
