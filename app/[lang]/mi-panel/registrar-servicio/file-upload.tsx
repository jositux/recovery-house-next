"use client"

import type React from "react"

import { useState, useRef, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, File } from 'lucide-react'

// --- Translation Interfaces and Data ---

interface FileUploadTranslation {
    selectButton: string
    changeButton: string
    defaultFileName: string
    removeAria: string
}

const translations: Record<string, FileUploadTranslation> = {
    es: {
        selectButton: "Seleccionar archivo",
        changeButton: "Cambiar archivo",
        defaultFileName: "Archivo",
        removeAria: "Eliminar archivo seleccionado",
    },
    en: {
        selectButton: "Select file",
        changeButton: "Change file",
        defaultFileName: "File",
        removeAria: "Remove selected file",
    },
}

// --- Component Props Update ---

interface FileUploadProps {
  label: string
  defaultFile?: {
    id: string
    filename_download: string
  }
  onChange: (file: File | null, fileIdToDelete?: string) => void
  error?: string
  // Added 'lang' prop
  lang: string
}

export interface FileUploadHandle {
  reset: () => void
  getCurrentFileId: () => string | null
  validate: () => boolean
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  ({ label, defaultFile, onChange, lang, error }, ref) => {
    
    // Select the current translation object
    const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en";
    const t = translations[currentLangKey];
    
    const normalizedDefaultFile = defaultFile && defaultFile.id && defaultFile.id !== "" && defaultFile.filename_download && defaultFile.filename_download !== ""
      ? defaultFile 
      : undefined

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [currentFile, setCurrentFile] = useState<{ id: string; filename_download: string } | undefined>(normalizedDefaultFile)
    const [originalFileId] = useState<string | undefined>(normalizedDefaultFile?.id)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSelectedFile(null)
        setCurrentFile(undefined)
        if (inputRef.current) {
          inputRef.current.value = ""
        }
      },
      getCurrentFileId: (): string | null => {
        if (selectedFile) return null
        return currentFile?.id ?? null
      },
      validate: (): boolean => {
        // Validation logic remains the same (checks if there is any file selected or current)
        return !!(selectedFile || currentFile)
      },
    }))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      setSelectedFile(file)

      if (file && originalFileId) {
        onChange(file, originalFileId)
        setCurrentFile(undefined)
      } else {
        onChange(file)
      }
    }

    const handleRemove = () => {
      setSelectedFile(null)
      if (inputRef.current) {
        inputRef.current.value = ""
      }

      if (originalFileId) {
        onChange(null, originalFileId)
        setCurrentFile(undefined)
      } else {
        onChange(null)
      }
    }

    const hasFile = selectedFile || currentFile

    // Generate unique ID based on the label for 'htmlFor' and 'id'
    const inputId = label.toLowerCase().replace(/\s/g, "-")

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {hasFile ? t.changeButton : t.selectButton}
          </Button>

          {hasFile && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <File className="h-4 w-4" />
                <span className="truncate max-w-[100px]">
                  {selectedFile?.name || currentFile?.filename_download || t.defaultFileName}
                </span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove} 
                className="h-8 w-8 p-0"
                aria-label={t.removeAria}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          id={inputId}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* You may want to display the 'error' prop here, though it's not part of the translation requirements */}
        {error && (
            <p className="text-sm font-medium text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"