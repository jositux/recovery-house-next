"use client"

import { useState, useEffect } from "react"
import { ImageUpload } from "@/components/ui/image-upload"

interface GalleryProps {
  onChange: (photos: { id: string; filename: string; url: string }[]) => void
  value: { id: string; filename: string; url: string }[]
}

export function Gallery({ onChange, value }: GalleryProps) {
  const [photos, setPhotos] = useState<({ id: string; filename: string; url: string } | null)[]>(
    Array(6).fill(null)
  )

  useEffect(() => {
    const newPhotos = Array(6).fill(null)
    value.forEach((photo, index) => {
      if (index < 6) {
        newPhotos[index] = photo
      }
    })
    setPhotos(newPhotos)
  }, [value])

  const handleImageChange = (index: number, fileData: { id: string; filename: string; url: string } | undefined) => {
    const newPhotos = [...photos]
    newPhotos[index] = fileData || null
    setPhotos(newPhotos)
    onChange(newPhotos.filter((photo): photo is { id: string; filename: string; url: string } => photo !== null))
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <div key={index} className="relative">
          <ImageUpload
            onChange={(fileData) => handleImageChange(index, fileData)}
            onRemove={() => handleImageChange(index, undefined)}
            value={photo || undefined}
            className="w-full h-32 border-2 border-dashed rounded-lg"
          />
        </div>
      ))}
    </div>
  )
}

