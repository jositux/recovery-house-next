"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface PhotoGalleryProps {
  photos: string[]
  isOpen: boolean
  onClose: () => void
}

export function PhotoGallery({ photos, isOpen, onClose }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const nextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      nextPhoto()
    }

    if (touchStart - touchEnd < -150) {
      prevPhoto()
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextPhoto()
      } else if (event.key === "ArrowLeft") {
        prevPhoto()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, []) // Removed dependencies here

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="hidden">Imagen</DialogTitle>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div
          className="relative w-full h-[80vh] bg-transparent flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={photos[currentIndex] || "/placeholder.svg"}
            alt={`Room photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
            onClick={prevPhoto}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
            onClick={nextPhoto}
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

