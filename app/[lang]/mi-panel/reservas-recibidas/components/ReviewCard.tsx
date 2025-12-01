"use client"

import { Star } from "lucide-react"

interface Ratings {
  cleanliness: number
  attention: number
  location: number
  accuracy: number
}

interface ReviewCardProps {
  ratings: Ratings
  comment: string
}

const calculateAverage = (ratings: Ratings) => {
  const values = Object.values(ratings).filter((rating) => rating > 0)
  if (values.length === 0) return 0
  return values.reduce((sum, rating) => sum + rating, 0) / values.length
}

export function ReviewCard({ ratings, comment }: ReviewCardProps) {
  const average = calculateAverage(ratings)

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-lg font-semibold">{average.toFixed(1)}</span>
        </div>
        {comment && (
          <p className="mt-2 text-sm text-muted-foreground">{comment}</p>
        )}
      </div>
     
    </div>
  )
}
