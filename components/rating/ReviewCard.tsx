"use client"

import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useState } from "react"

interface Ranking {
  limpieza: number
  atención: number
  comodidad: number
}

interface ReviewReply {
  id: string
  userCreated: string
  dateCreated: string
  userUpdated: string | null
  dateUpdated: string | null
  reviewId: string
  ownerId: string
  reply: string
}

interface Review {
  id: string
  bookingId: string
  roomId: string
  name: string
  comment: string
  ranking: Ranking
  status: string
  dateCreated: string
  review_replies: ReviewReply[]
}

interface ReviewCardProps {
  review: Review
}

const calculateAverage = (ranking: Ranking) => {
  const values = Object.values(ranking).filter((rating) => rating > 0)
  if (values.length === 0) return 0
  return values.reduce((sum, rating) => sum + rating, 0) / values.length
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [showReplies, setShowReplies] = useState(false)
  const averageRating = calculateAverage(review.ranking)

  return (
    <div className="border-b border-border pb-6 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold">
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground">{review.name}</h4>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <StarRating rating={averageRating} />
            <span className="text-sm text-muted-foreground">
              {new Date(review.dateCreated).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>

          <p className="text-foreground leading-relaxed mb-3">{review.comment}</p>

          {review.review_replies && review.review_replies.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showReplies ? "Ocultar" : "Ver"} {review.review_replies.length}{" "}
                {review.review_replies.length === 1 ? "respuesta" : "respuestas"}
              </Button>

              {showReplies && (
                <div className="mt-3 ml-8 space-y-3">
                  {review.review_replies.map((reply) => (
                    <div key={reply.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          A
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Anfitrión</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reply.dateCreated).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{reply.reply}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
