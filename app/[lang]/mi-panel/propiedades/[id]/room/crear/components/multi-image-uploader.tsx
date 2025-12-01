"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload, ImageIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// --- Translation Interfaces and Data ---

interface ImageUploaderTranslation {
  uploadButton: string
  imageCountLabel: string
  removeAria: string
  noImagesTitle: string
  noImagesSubtitle: (max: number) => string
  invalidFileError: (filename: string) => string
  errorTitle: string
}

const translations: Record<string, ImageUploaderTranslation> = {
  es: {
    uploadButton: "Subir Fotos",
    imageCountLabel: "fotos",
    removeAria: "Eliminar foto",
    noImagesTitle: "No hay fotos subidas",
    noImagesSubtitle: (max: number) => `Puedes subir hasta ${max} fotos`,
    invalidFileError: (filename: string) => `${filename} no es una imagen válida.`,
    errorTitle: "Error de Subida",
  },
  en: {
    uploadButton: "Upload Photos",
    imageCountLabel: "photos",
    removeAria: "Remove photo",
    noImagesTitle: "No photos uploaded yet",
    noImagesSubtitle: (max: number) => `You can upload up to ${max} photos`,
    invalidFileError: (filename: string) => `${filename} is not a valid image.`,
    errorTitle: "Upload Error",
  },
}

// --- Component Props Update ---

interface MultiImageUploaderProps {
  maxImages?: number
  onImagesChange?: (images: File[]) => void
  defaultImages?: string[] // URLs of existing images
  // Added 'lang' prop
  lang: string
}

export function MultiImageUploader({
  maxImages = 6,
  onImagesChange,
  defaultImages = [],
  lang,
}: MultiImageUploaderProps) {
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(defaultImages)
  const [uploadError, setUploadError] = useState<string | null>(null) // State for internal error message

  // Select the current translation object
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en"
  const t = translations[currentLangKey]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear previous errors
    setUploadError(null)

    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - previewUrls.length

    const filesToProcess = files.slice(0, remainingSlots)

    // Validate and separate files
    const validFiles: File[] = []
    let hasInvalidFile = false
    let invalidFileName = ""

    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file)
      } else {
        // Capture the first invalid file name for the error message
        if (!hasInvalidFile) {
          invalidFileName = file.name
        }
        hasInvalidFile = true
      }
    })

    if (hasInvalidFile) {
      setUploadError(t.invalidFileError(invalidFileName))
    }

    if (validFiles.length === 0) {
      // Reset input even if no valid files were processed
      e.target.value = ""
      return
    }

    // 1. Create preview URLs for the valid new files
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

    // 2. Update states
    const updatedImages = [...images, ...validFiles]
    const updatedPreviews = [...previewUrls, ...newPreviewUrls]

    setImages(updatedImages)
    setPreviewUrls(updatedPreviews)

    // 3. Notify parent component
    onImagesChange?.(updatedImages)

    // 4. Reset input
    e.target.value = ""
  }

  const handleRemoveImage = (index: number) => {
    // Clear errors when interacting
    setUploadError(null)
    
    // Check if it's a default image or newly uploaded
    const isDefaultImage = index < defaultImages.length

    if (isDefaultImage) {
      // Remove from default images/previews
      const updatedPreviews = previewUrls.filter((_, i) => i !== index)
      setPreviewUrls(updatedPreviews)
    } else {
      // Remove from newly uploaded images
      const adjustedIndex = index - defaultImages.length
      const updatedImages = images.filter((_, i) => i !== adjustedIndex)
      const updatedPreviews = previewUrls.filter((_, i) => i !== index)

      // Revoke object URL to prevent memory leaks
      const urlToRemove = previewUrls[index]
      if (urlToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRemove)
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
      {/* Upload Button Section */}
      <div className="flex items-center gap-4">
        {canUploadMore && (
          <Button
            type="button"
            variant="outline"
            className="relative bg-transparent"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t.uploadButton}
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {totalImages} / {maxImages} {t.imageCountLabel}
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
      
      {/* Error Message Display (Replaced alert()) */}
      {uploadError && (
        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="font-semibold">{t.errorTitle}:</span> {uploadError}
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
                aria-label={t.removeAria}
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
          <p className="text-sm text-muted-foreground mb-2">{t.noImagesTitle}</p>
          <p className="text-xs text-muted-foreground">{t.noImagesSubtitle(maxImages)}</p>
        </div>
      )}
    </div>
  )
}