"use client"

import { useRef, useState } from "react"
import { Camera, X, Loader } from 'lucide-react'
import { cn } from "@/lib/utils"
import { fileService } from '@/services/fileService';

interface ImageUploadProps {
  onChange: (fileData: { id: string; filename: string; url: string; } | undefined) => void
  onRemove: () => void
  value?: { id: string; filename: string; url: string; } | undefined
  className?: string
}

export function ImageUpload({ onChange, onRemove, value, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(value)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        const fileData = await fileService.uploadFile({
          destination: 'PropertiesPhoto',
          title: 'PropertiesPhoto',
          description: 'PropertiesPhoto Desc',
          file: file,
        });
        setUploadedImage(fileData)
        onChange(fileData)
      } catch (error) {
        console.error('File upload failed:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadedImage(undefined)
    onRemove()
    onChange(undefined)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {isUploading ? (
        <Loader className="w-10 h-10 text-gray-400 animate-spin" />
      ) : uploadedImage ? (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={uploadedImage.url}
            alt="Image preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <Camera className="w-10 h-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 text-center">
            Click to upload image
          </p>
        </>
      )}
    </div>
  )
}

