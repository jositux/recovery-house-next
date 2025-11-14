"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, File } from "lucide-react"

interface FileUploadProps {
  label: string
  defaultFileId?: string
  onChange: (file: File | null, fileIdToDelete?: string) => void
  error?: string
}

export function FileUpload({ label, defaultFileId, onChange, error }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentFileId, setCurrentFileId] = useState<string | undefined>(defaultFileId)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)

    // Si hay un archivo anterior y se selecciona uno nuevo, marcar el anterior para eliminar
    if (file && currentFileId) {
      onChange(file, currentFileId)
      setCurrentFileId(undefined)
    } else {
      onChange(file)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    // Si había un archivo anterior, marcar para eliminar
    if (currentFileId) {
      onChange(null, currentFileId)
      setCurrentFileId(undefined)
    } else {
      onChange(null)
    }
  }

  const hasFile = selectedFile || currentFileId

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")}>{label}</Label>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {hasFile ? "Cambiar archivo" : "Seleccionar archivo"}
        </Button>

        {hasFile && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{selectedFile?.name || `Archivo ${currentFileId}`}</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        id={label.toLowerCase().replace(/\s/g, "-")}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
