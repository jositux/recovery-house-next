"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { uploadFile } from "@/services/fileUploadService"
import { Camera, Loader2, XCircle } from "lucide-react"

interface CoverPhotoUploadProps {
  defaultImageId?: string
  onImageIdChange?: (id: string) => void
}

const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({ defaultImageId = "", onImageIdChange }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [imageId, setImageId] = useState<string>(defaultImageId)

  const notifyParent = useCallback(() => {
    if (onImageIdChange) {
      onImageIdChange(imageId)
    }
  }, [imageId, onImageIdChange])

  useEffect(() => {
    notifyParent()
  }, [notifyParent])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setImageId("")

    try {
      const response = await uploadFile(file)
      setImageId(response.id)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearImage = (): void => {
    setImageId("")
  }

  return (
    <div className="relative w-full max-w-4xl h-64 border-2 border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
      <input
        type="file"
        id="cover-photo-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />

      {imageId ? (
        <>
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={`/webapi/assets/${imageId}?key=medium`}
              alt="Cover Photo"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>

          <button
            onClick={handleClearImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-600 shadow-md z-10"
            aria-label="Clear image"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </>
      ) : (
        <label htmlFor="cover-photo-upload" className="flex flex-col items-center gap-2 cursor-pointer">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          ) : (
            <Camera className="w-10 h-10 text-[#162F40]" />
          )}
          <span className="text-sm font-medium text-[#162F40]">SUBIR FOTO</span>
        </label>
      )}
    </div>
  )
}

export default CoverPhotoUpload

