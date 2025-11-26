"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface MultiImageUploaderProps {
  maxImages?: number
  onImagesChange?: (images: File[]) => void
  defaultImages?: string[] // URLs of existing images
}

export function MultiImageUploader({ maxImages = 6, onImagesChange, defaultImages = [] }: MultiImageUploaderProps) {
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(defaultImages)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - images.length - defaultImages.length

    const filesToUpload = files.slice(0, remainingSlots)

    // Validate file types
    const validFiles = filesToUpload.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} no es una imagen válida`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

    const updatedImages = [...images, ...validFiles]
    const updatedPreviews = [...previewUrls, ...newPreviewUrls]

    setImages(updatedImages)
    setPreviewUrls(updatedPreviews)

    // Notify parent component
    onImagesChange?.(updatedImages)

    // Reset input
    e.target.value = ""
  }

  const handleRemoveImage = (index: number) => {
    // Check if it's a default image or newly uploaded
    const isDefaultImage = index < defaultImages.length

    if (isDefaultImage) {
      // Remove from default images
      const updatedPreviews = previewUrls.filter((_, i) => i !== index)
      setPreviewUrls(updatedPreviews)
    } else {
      // Remove from newly uploaded images
      const adjustedIndex = index - defaultImages.length
      const updatedImages = images.filter((_, i) => i !== adjustedIndex)
      const updatedPreviews = previewUrls.filter((_, i) => i !== index)

      // Revoke object URL to prevent memory leaks
      if (previewUrls[index].startsWith("blob:")) {
        URL.revokeObjectURL(previewUrls[index])
      }

      setImages(updatedImages)
      setPreviewUrls(updatedPreviews)

      // Notify parent component
      onImagesChange?.(updatedImages)
    }
  }

  const totalImages = previewUrls.length
  const canUploadMore = totalImages < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canUploadMore && (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="relative bg-transparent"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Fotos
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalImages} / {maxImages} fotos
          </span>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Image Previews */}
      {totalImages > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300">
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border border-border overflow-hidden group transition-all duration-300 ease-in-out animate-in fade-in zoom-in"
            >
              <Image src={url || "/placeholder.svg"} alt={`Imagen ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-white text-gray-700 rounded-full p-1.5 transition-colors hover:bg-gray-100 shadow-md"
                aria-label="Eliminar foto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">No hay fotos subidas</p>
          <p className="text-xs text-muted-foreground">Puedes subir hasta {maxImages} fotos</p>
        </div>
      )}
    </div>
  )
}
