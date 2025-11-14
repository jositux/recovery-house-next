"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { uploadFile } from "@/services/fileUploadService"
import { deleteFile } from "@/services/deleteFileService"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "./file-upload"
import { z } from "zod"
import { Loader2 } from "lucide-react"

const fileSchema = z.object({
  RNTFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo RNT es obligatorio.",
  }),
  taxIdEINFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo TAX ID es obligatorio.",
  }),
})

type FileState = {
  file: File | null
  fileIdToDelete?: string
}

export default function FileUploadPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [rntState, setRntState] = useState<FileState>({ file: null })
  const [taxIdState, setTaxIdState] = useState<FileState>({ file: null })

  const [errors, setErrors] = useState<{ RNTFile?: string; taxIdEINFile?: string }>({})

  const handleRntChange = (file: File | null, fileIdToDelete?: string) => {
    setRntState({ file, fileIdToDelete })
  }

  const handleTaxIdChange = (file: File | null, fileIdToDelete?: string) => {
    setTaxIdState({ file, fileIdToDelete })
  }

  const handleSave = async () => {
    const result = fileSchema.safeParse({
      RNTFile: rntState.file ? "present" : "",
      taxIdEINFile: taxIdState.file ? "present" : "",
    })

    if (!result.success) {
      const formattedErrors: { RNTFile?: string; taxIdEINFile?: string } = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "RNTFile") {
          formattedErrors.RNTFile = issue.message
        } else if (issue.path[0] === "taxIdEINFile") {
          formattedErrors.taxIdEINFile = issue.message
        }
      })
      setErrors(formattedErrors)
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona ambos archivos requeridos.",
        variant: "destructive",
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        throw new Error("Access token not found")
      }

      const deletePromises = []
      if (rntState.fileIdToDelete) {
        deletePromises.push(deleteFile(rntState.fileIdToDelete, accessToken))
      }
      if (taxIdState.fileIdToDelete) {
        deletePromises.push(deleteFile(taxIdState.fileIdToDelete, accessToken))
      }

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises)
      }

      const uploadPromises = []
      if (rntState.file) {
        uploadPromises.push(uploadFile(rntState.file))
      }
      if (taxIdState.file) {
        uploadPromises.push(uploadFile(taxIdState.file))
      }

      await Promise.all(uploadPromises)

      toast({
        title: "Guardado exitoso",
        description: "Los archivos se han guardado correctamente.",
      })

      // Limpiar estados después de guardar
      setRntState({ file: null })
      setTaxIdState({ file: null })
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Carga de Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecciona los archivos RNT y TAX ID EIN requeridos</p>
        </div>

        <div className="space-y-6">
          <FileUpload label="Archivo RNT *" onChange={handleRntChange} error={errors.RNTFile} />

          <FileUpload label="Archivo TAX ID EIN *" onChange={handleTaxIdChange} error={errors.taxIdEINFile} />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
