"use client"

import { useRef, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, X, Upload, FileText } from 'lucide-react'
import { fileService } from '@/services/fileService'

interface TaxFormUploadProps {
  onChange: (fileData: { id: string; filename: string; url: string } | null) => void
  className?: string
  error?: string
  value?: { id: string; filename: string; url: string } | null
}

export function TaxFormUpload({ onChange, className, error, value }: TaxFormUploadProps) {
  const [fileName, setFileName] = useState<string | null>(value?.filename || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadController, setUploadController] = useState<AbortController | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      const controller = new AbortController()
      setUploadController(controller)

      try {
        const fileData = await fileService.uploadFile({
          destination: 'UsersTaxEinFile',
          title: 'User Tax File',
          description: 'User Tax File Desc',
          file: file,
          signal: controller.signal,
          onProgress: (progress) => setUploadProgress(progress),
        });
        onChange(fileData)
        setFileName(fileData.filename)
        console.log(fileName)
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('File upload was cancelled')
          } else {
            console.error('File upload failed:', error.message);
            onChange(null)
          }
        } else {
          console.error('An unknown error occurred');
          onChange(null)
        }
      } finally {
        setIsUploading(false)
        setUploadController(null)
        setUploadProgress(0)
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  }, [onChange])

  const handleRemove = useCallback(() => {
    if (isUploading && uploadController) {
      uploadController.abort();
    }
    setFileName(null);
    setIsUploading(false);
    setUploadProgress(0);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [isUploading, uploadController, onChange]);

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const handleCancelUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadController) {
      uploadController.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
      <div
        onClick={handleUploadClick}
        className={cn(
          "w-full px-4 py-3 border rounded-lg flex items-center justify-between relative cursor-pointer",
          "hover:bg-accent/50 transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
          error && "border-destructive",
          (isUploading || value) && "bg-accent"
        )}
      >
        <div className="flex items-center gap-2 flex-grow pr-8">
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading... {uploadProgress}%</span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="ml-2 text-sm text-destructive hover:text-destructive/80"
              >
                Cancel
              </button>
            </>
          ) : value ? (
            <>
              <FileText className="h-5 w-5" />
              <span>{value.filename}</span>
            </>
          ) : (
            <span>Upload Tax Forms</span>
          )}
        </div>

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {(isUploading || value) ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1 hover:bg-accent rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </button>
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

