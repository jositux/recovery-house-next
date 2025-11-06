"use client"

import { useState } from "react"
import { SingleImageUploaderWithId } from "./single-image-uploader-with-id"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadFile } from "@/services/fileUploadService"
import { deleteFile } from "@/services/deleteFileService"
import { Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GallerySimplePage() {
  const [existingImageId, setExistingImageId] = useState<string | undefined>("028fd207-d02e-435e-9fb3-ab343e2689fb")
  const [idToDelete, setIdToDelete] = useState<string | undefined>(undefined)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [finalImageId, setFinalImageId] = useState<string | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleChange = (data: { existingImageId: string | null; newFile: File | null; markedForDeletion: boolean }) => {
    console.log("[v0] handleChange called with:", data)

    if (data.markedForDeletion && data.existingImageId) {
      setIdToDelete(data.existingImageId)
      setExistingImageId(undefined)
    } else if (!data.markedForDeletion) {
      // Only update existingImageId if not marking for deletion
      setExistingImageId(data.existingImageId ?? undefined)
    }

    setNewFile(data.newFile)
    setFinalImageId(undefined)
  }

  const handleSave = async () => {
    console.log("[v0] handleSave called")
    console.log("[v0] idToDelete:", idToDelete)
    console.log("[v0] existingImageId:", existingImageId)
    console.log("[v0] newFile:", newFile)

    setIsUploading(true)
    setFinalImageId(undefined)

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        toast({
          title: "Error",
          description: "No se encontró el token de acceso",
          variant: "destructive",
        })
        return
      }

      let resultId: string | undefined = undefined

      if (idToDelete) {
        toast({
          title: "Eliminando imagen...",
          description: "Eliminando imagen del servidor",
        })

        await deleteFile(idToDelete, accessToken)
        setIdToDelete(undefined)

        toast({
          title: "Imagen eliminada",
          description: "La imagen se eliminó correctamente del servidor",
        })
      }

      if (newFile) {
        toast({
          title: "Subiendo imagen...",
          description: "Por favor espera",
        })

        const uploadResult = await uploadFile(newFile)
        resultId = uploadResult.id

        toast({
          title: "Imagen subida",
          description: "La imagen se subió correctamente",
        })
      } else if (existingImageId) {
        resultId = existingImageId
      }

      setFinalImageId(resultId)

      if (resultId) {
        toast({
          title: "Guardado exitoso",
          description: `ID de imagen: ${resultId}`,
        })
      } else {
        toast({
          title: "Sin imagen",
          description: "No hay imagen para guardar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving image:", error)
      toast({
        title: "Error",
        description: "Hubo un error al guardar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = () => {
    if (finalImageId) {
      navigator.clipboard.writeText(finalImageId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copiado",
        description: "ID copiado al portapapeles",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Galería Simple - Una Imagen</CardTitle>
          <CardDescription>
            Haz clic en X para eliminar la imagen de la UI. Se eliminará del servidor al hacer clic en Guardar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SingleImageUploaderWithId
            existingImageId={existingImageId}
            newFile={newFile}
            onChange={handleChange}
            maxSizeMB={5}
          />

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isUploading || (!newFile && !existingImageId)} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>

          {finalImageId && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-sm">ID de Imagen Final</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-sm">{finalImageId}</code>
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Este ID se guardaría en la base de datos</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-sm">Cómo funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Eliminar:</strong> Haz clic en X y la imagen desaparece de la UI
              </p>
              <p>
                <strong>Al guardar:</strong> Se eliminan del servidor las imágenes que fueron cerradas, se suben las
                nuevas, y se obtiene el ID final
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
