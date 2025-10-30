"use client"

import { MultiImageUploader } from "./multi-image-uploader"
import { useState } from "react"
import { uploadFile } from "@/services/fileUploadService"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function TestUploaderPage() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedIds, setUploadedIds] = useState<string[]>([])
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleImagesChange = (images: File[]) => {
    setUploadedImages(images)
    console.log("Imágenes actualizadas:", images)
    setUploadedIds([])
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (uploadedImages.length === 0) {
      alert("No hay imágenes para subir")
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      // Upload all images in parallel
      const uploadPromises = uploadedImages.map((file) => uploadFile(file))
      const results = await Promise.all(uploadPromises)

      // Extract IDs from results
      const ids = results.map((result) => result.id)
      setUploadedIds(ids)
      setUploadSuccess(true)

      console.log("Array de IDs subidos:", ids)
      alert(`¡${ids.length} imágenes subidas exitosamente!`)
    } catch (error) {
      console.error("Error al subir imágenes:", error)
      alert("Error al subir las imágenes. Por favor intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Subir Imágenes</h1>
      <p className="text-muted-foreground mb-8">Prueba el componente de carga de múltiples imágenes</p>

      <MultiImageUploader maxImages={6} onImagesChange={handleImagesChange} />

      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
            style={{ backgroundColor: "#39759E" }}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo {uploadedImages.length} imagen(es)...
              </>
            ) : (
              `Guardar ${uploadedImages.length} imagen(es)`
            )}
          </Button>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Imágenes seleccionadas:</h2>
          <ul className="text-sm space-y-1">
            {uploadedImages.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploadSuccess && uploadedIds.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="font-semibold text-green-900 mb-2">✓ Imágenes subidas exitosamente</h2>
          <p className="text-sm text-green-800 mb-2">Array de IDs:</p>
          <code className="block p-3 bg-white rounded text-xs overflow-x-auto">
            {JSON.stringify(uploadedIds, null, 2)}
          </code>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 bg-transparent"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(uploadedIds))
              alert("IDs copiados al portapapeles")
            }}
          >
            Copiar IDs
          </Button>
        </div>
      )}
    </div>
  )
}
