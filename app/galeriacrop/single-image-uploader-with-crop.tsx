"use client"

import type React from "react"

import { useState, useCallback, useRef, type SyntheticEvent } from "react"
import { Upload, X, CropIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import "react-image-crop/dist/ReactCrop.css"

interface SingleImageUploaderWithCropProps {
  existingImageId?: string
  onImageChange: (file: File | null) => void
  onMarkForDeletion?: (id: string, marked: boolean) => void
  aspectRatio?: number
}

export function SingleImageUploaderWithCrop({
  existingImageId,
  onImageChange,
  onMarkForDeletion,
  aspectRatio = 1,
}: SingleImageUploaderWithCropProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    existingImageId ? `/webapi/assets/${existingImageId}?key=small` : null,
  )
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [tempFileName, setTempFileName] = useState<string>("")

  const [crop, setCrop] = useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("")
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      if (aspectRatio) {
        setCrop(centerAspectCrop(width, height, aspectRatio))
      }
    },
    [aspectRatio],
  )

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      try {
        const croppedImageUrl = getCroppedImg(imgRef.current, crop)
        setCroppedImageUrl(croppedImageUrl)
      } catch (error) {
        console.error("Error in onCropComplete:", error)
      }
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas")
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    return canvas.toDataURL("image/png")
  }

  function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setTempFileName(file.name)
        setShowCropDialog(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropSave = () => {
    if (!imageToCrop || !tempFileName) {
      return
    }

    try {
      const imageToUse = croppedImageUrl || imageToCrop
      const croppedFile = base64ToFile(imageToUse, tempFileName)
      const previewUrl = URL.createObjectURL(croppedFile)
      setImagePreview(previewUrl)
      setCurrentFile(croppedFile)
      onImageChange(croppedFile)

      setShowCropDialog(false)
      setImageToCrop(null)
      setCroppedImageUrl("")
      setTempFileName("")
    } catch (error) {
      console.error("Error during crop:", error)
      alert("An error occurred while saving the cropped image. Please try again.")
    }
  }

  const handleCancelCrop = () => {
    setShowCropDialog(false)
    setImageToCrop(null)
    setCroppedImageUrl("")
    setTempFileName("")
  }

  const handleRemove = () => {
    if (existingImageId && !currentFile) {
      setImagePreview(null)
      if (onMarkForDeletion) {
        onMarkForDeletion(existingImageId, true)
      }
    } else {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
      setImagePreview(existingImageId ? `/webapi/assets/${existingImageId}?key=small` : null)
      setCurrentFile(null)
      onImageChange(null)
      if (existingImageId && onMarkForDeletion) {
        onMarkForDeletion(existingImageId, false)
      }
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Imagen</h3>
          </div>

          {imagePreview ? (
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-border">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Click para seleccionar una imagen</p>
              <p className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </Card>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogTitle className="sr-only">Recortar imagen</DialogTitle>
        <DialogContent className="p-0 gap-0 w-full h-auto max-w-[90vw] max-h-[90vh] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] rounded-lg">
          <div className="p-4 sm:p-6 w-full h-full flex items-center justify-center overflow-auto">
            {imageToCrop && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => onCropComplete(c)}
                aspect={aspectRatio}
                className="max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Image Cropper"
                  src={imageToCrop || "/placeholder.svg"}
                  onLoad={onImageLoad}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 p-4 sm:p-6 pt-0">
            <Button
              size="sm"
              type="button"
              className="w-fit bg-transparent"
              variant="outline"
              onClick={handleCancelCrop}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancelar
            </Button>
            <Button type="button" size="sm" className="w-fit" onClick={handleCropSave}>
              <CropIcon className="mr-1.5 size-4" />
              Recortar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
        height: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}
