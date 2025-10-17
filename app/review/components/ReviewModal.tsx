"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StarRating } from "./StarRating"

interface ReviewData {
  cleanliness: number
  atention: number
  location: number
  accuracy: number
  comment: string
}

const CRITERIA = [
  { key: "cleanliness", label: "Limpieza" },
  { key: "atention", label: "Atención" },
  { key: "location", label: "Ubicación" },
  { key: "accuracy", label: "Comodidad" },
] as const

interface ReviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  reviewData: ReviewData
  onReviewChange: (data: ReviewData) => void
  onSave: () => void
}

export function ReviewModal({ isOpen, onOpenChange, reviewData, onReviewChange, onSave }: ReviewModalProps) {
  const handleStarClick = (criterion: keyof Omit<ReviewData, "comment">, rating: number) => {
    onReviewChange({
      ...reviewData,
      [criterion]: reviewData[criterion] === rating ? 0 : rating,
    })
  }

  const hasAtLeastOneRating = Object.values(reviewData).some((value, index) => index < 4 && value > 0)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Califica tu experiencia en cada uno de los siguientes criterios</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {CRITERIA.map((criterion) => (
              <div key={criterion.key} className="space-y-1">
                <label className="text-sm font-medium">{criterion.label}</label>
                <StarRating
                  rating={reviewData[criterion.key]}
                  onRate={(rating) => handleStarClick(criterion.key, rating)}
                  maxStars={5}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              value={reviewData.comment}
              onChange={(e) =>
                onReviewChange({
                  ...reviewData,
                  comment: e.target.value,
                })
              }
              placeholder="Cuéntanos sobre tu experiencia..."
              rows={4}
            />
          </div>

          {!hasAtLeastOneRating && (
            <p className="text-sm text-muted-foreground">
              Por favor, selecciona al menos una calificación para poder comentar
            </p>
          )}

          <Button onClick={onSave} className="w-full" disabled={!hasAtLeastOneRating}>
            Comentar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
