"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAssetUrl } from "@/lib/getAssetUrl";

interface SingleImageUploaderWithIdProps {
  existingImageId?: string
  newFile?: File | null
  onChange: (data: { existingImageId: string | null; newFile: File | null; markedForDeletion: boolean }) => void
  maxSizeMB?: number
  className?: string
}

export function SingleImageUploaderWithId({
  existingImageId,
  newFile,
  onChange,
  maxSizeMB = 5,
  className = "",
}: SingleImageUploaderWithIdProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona solo archivos de imagen")
      return
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      alert(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    onChange({ existingImageId: null, newFile: file, markedForDeletion: false })
  }

  const handleRemove = () => {
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
      return getAssetUrl(existingImageId, "medium")
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

      {hasImage ? (
        <Card className="relative group overflow-hidden">
          <img src={imageUrl || "/placeholder.svg"} alt="Imagen" className="w-full h-48 object-cover" />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {newFile ? "Nueva imagen" : "Imagen existente"}
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
          <p className="text-sm text-muted-foreground mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
          <p className="text-xs text-muted-foreground">Tamaño máximo: {maxSizeMB}MB</p>
        </Card>
      )}
    </div>
  )
}
