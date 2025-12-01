"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// --- Translation Interfaces and Data ---

interface SingleUploaderTranslation {
  newImageLabel: string
  existingImageLabel: string
  dragDropText: string
  clickSelectText: string
  maxSizeText: (max: number) => string
  invalidFileError: string
  sizeLimitError: (max: number) => string
  errorTitle: string
}

const translations: Record<string, SingleUploaderTranslation> = {
  es: {
    newImageLabel: "Nueva imagen",
    existingImageLabel: "Imagen existente",
    dragDropText: "Arrastra una imagen aquí",
    clickSelectText: "o haz clic para seleccionar",
    maxSizeText: (max: number) => `Tamaño máximo: ${max}MB`,
    invalidFileError: "Por favor, selecciona solo archivos de imagen (JPEG, PNG, etc.).",
    sizeLimitError: (max: number) => `El archivo es demasiado grande. Tamaño máximo: ${max}MB.`,
    errorTitle: "Error de Validación",
  },
  en: {
    newImageLabel: "New image",
    existingImageLabel: "Existing image",
    dragDropText: "Drag an image here",
    clickSelectText: "or click to select",
    maxSizeText: (max: number) => `Maximum size: ${max}MB`,
    invalidFileError: "Please select image files only (JPEG, PNG, etc.).",
    sizeLimitError: (max: number) => `The file is too large. Maximum size: ${max}MB.`,
    errorTitle: "Validation Error",
  },
}

// --- Component Props Update ---

interface SingleImageUploaderWithIdProps {
  existingImageId?: string
  newFile?: File | null
  onChange: (data: { existingImageId: string | null; newFile: File | null; markedForDeletion: boolean }) => void
  maxSizeMB?: number
  className?: string
  // Added 'lang' prop
  lang: string
}

export function SingleImageUploaderWithId({
  existingImageId,
  newFile,
  onChange,
  maxSizeMB = 10,
  className = "",
  lang,
}: SingleImageUploaderWithIdProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null) // State for internal error message
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Select the current translation object
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en"
  const t = translations[currentLangKey]

  const handleFileSelect = (files: FileList | null) => {
    setUploadError(null) // Clear previous errors
    
    if (!files || files.length === 0) return

    const file = files[0]

    if (!file.type.startsWith("image/")) {
      setUploadError(t.invalidFileError)
      if (fileInputRef.current) fileInputRef.current.value = "" // Reset input
      return
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setUploadError(t.sizeLimitError(maxSizeMB))
      if (fileInputRef.current) fileInputRef.current.value = "" // Reset input
      return
    }

    onChange({ existingImageId: null, newFile: file, markedForDeletion: false })
  }

  const handleRemove = () => {
    setUploadError(null) // Clear errors on remove
    
    if (existingImageId && !newFile) {
      onChange({ existingImageId: existingImageId, newFile: null, markedForDeletion: true })
    } else if (newFile) {
      onChange({ existingImageId: existingImageId || null, newFile: null, markedForDeletion: false })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const getImageUrl = () => {
    if (newFile) {
      return URL.createObjectURL(newFile)
    }
    if (existingImageId) {
      return `/webapi/assets/${existingImageId}?key=medium`
    }
    return null
  }

  const imageUrl = getImageUrl()
  const hasImage = !!imageUrl

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Error Message Display */}
      {uploadError && (
        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg mb-4">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="font-semibold">{t.errorTitle}:</span> {uploadError}
        </div>
      )}

      {hasImage ? (
        <Card className="relative group overflow-hidden">
          <img src={imageUrl || "/placeholder.svg"} alt={t.existingImageLabel} className="w-full h-48 object-cover" />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            aria-label="remove" // Assuming aria-label is needed here too
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {newFile ? t.newImageLabel : t.existingImageLabel}
          </div>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            **{t.dragDropText}** {t.clickSelectText}
          </p>
          <p className="text-xs text-muted-foreground">{t.maxSizeText(maxSizeMB)}</p>
        </Card>
      )}
    </div>
  )
}