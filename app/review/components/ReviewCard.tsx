"use client"

import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewCardProps {
  average: number
  comment: string
  onDelete: () => void
}

export function ReviewCard({ average, comment, onDelete }: ReviewCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-lg font-semibold">{average.toFixed(1)}</span>
        </div>
        {comment && <p className="mt-2 text-sm text-muted-foreground">{comment}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  )
}
