"use client"

import type React from "react"

import { useState, useRef, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, File } from 'lucide-react'

interface FileUploadProps {
  label: string
  defaultFile?: {
    id: string
    filename_download: string
  }
  onChange: (file: File | null, fileIdToDelete?: string) => void
  error?: string
}

export interface FileUploadHandle {
  reset: () => void
  getCurrentFileId: () => string | null
  validate: () => boolean
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  ({ label, defaultFile, onChange }, ref) => {
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
                <span className="truncate max-w-[100px]">
                  {selectedFile?.name || currentFile?.filename_download || "Archivo"}
                </span>
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

        
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"
