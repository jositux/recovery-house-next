"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "./components/ReviewCard"
import { ReviewModal } from "./components/ReviewModal"
import { ReviewDebugPanel } from "./components/ReviewDebugPanel"

interface ReviewData {
  cleanliness: number
  atention: number
  location: number
  accuracy: number
  comment: string
}

export default function ReviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasReview, setHasReview] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewData>({
    cleanliness: 0,
    atention: 0,
    location: 0,
    accuracy: 0,
    comment: "",
  })

  const calculateAverage = () => {
    const scores = [reviewData.cleanliness, reviewData.atention, reviewData.location, reviewData.accuracy].filter(
      (score) => score > 0,
    )

    if (scores.length === 0) return 0
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  const handleSave = () => {
    setHasReview(true)
    setIsModalOpen(false)

    const average = calculateAverage()
    console.log("[v0] Review guardada:", {
      individual: {
        cleanliness: reviewData.cleanliness,
        atention: reviewData.atention,
        location: reviewData.location,
        accuracy: reviewData.accuracy,
      },
      average,
      comment: reviewData.comment,
    })
  }

  const handleDelete = () => {
    setHasReview(false)
    setReviewData({
      cleanliness: 0,
      atention: 0,
      location: 0,
      accuracy: 0,
      comment: "",
    })
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Sistema de Reviews</h1>

        {!hasReview ? (
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            Review
          </Button>
        ) : (
          <ReviewCard average={calculateAverage()} comment={reviewData.comment} onDelete={handleDelete} />
        )}

        <ReviewModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          reviewData={reviewData}
          onReviewChange={setReviewData}
          onSave={handleSave}
        />

        {hasReview && <ReviewDebugPanel reviewData={reviewData} average={calculateAverage()} />}
      </div>
    </div>
  )
}
