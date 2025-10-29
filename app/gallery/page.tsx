"use client"

import { MultiImageUploader } from "./multi-image-uploader"
import { useState } from "react"

export default function TestUploaderPage() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  const handleImagesChange = (images: File[]) => {
    setUploadedImages(images)
    console.log("Imágenes actualizadas:", images)
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Subir Imágenes</h1>
      <p className="text-muted-foreground mb-8">Prueba el componente de carga de múltiples imágenes</p>

      <MultiImageUploader maxImages={6} onImagesChange={handleImagesChange} />

      {uploadedImages.length > 0 && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Imágenes cargadas:</h2>
          <ul className="text-sm space-y-1">
            {uploadedImages.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
