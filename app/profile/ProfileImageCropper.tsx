"use client";

import React, { type SyntheticEvent, useState, useCallback } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import "react-image-crop/dist/ReactCrop.css";
import { CropIcon, Trash2Icon } from "lucide-react";

export interface FileWithPreview extends File {
  preview: string;
}

interface ProfileImageCropperProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  onCroppedImage: (croppedImage: string) => void;
}

export function ProfileImageCropper({
  isOpen,
  setIsOpen,
  selectedFile,
  setSelectedFile,
  onCroppedImage,
}: ProfileImageCropperProps) {
  const aspect = 1;

  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

  const onImageLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, []);

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      try {
        const croppedImageUrl = getCroppedImg(imgRef.current, crop);
        setCroppedImageUrl(croppedImageUrl);
      } catch (error) {
        console.error("Error in onCropComplete:", error);
        alert("An error occurred while processing the crop. Please try again.");
      }
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
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
      crop.height
    );

    return canvas.toDataURL("image/png");
  }

  function handleCrop() {
    if (!croppedImageUrl) {
      console.error("No cropped image URL available");
      alert("Please crop the image before saving.");
      return;
    }

    try {
      onCroppedImage(croppedImageUrl);
      setIsOpen(false);
    } catch (error) {
      console.error("Error during crop:", error);
      alert(
        "An error occurred while saving the cropped image. Please try again."
      );
    }
  }

  function handleCancel() {
    setSelectedFile(null);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent className="p-0 gap-0 max-w-[90vw] max-h-[90vh] w-auto h-auto">
        <div className="p-6 w-full h-full flex items-center justify-center overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropComplete(c)}
            aspect={aspect}
            className="max-w-full max-h-full"
          >
            <img
              ref={imgRef}
              alt="Image Cropper"
              src={selectedFile?.preview || "/placeholder.svg"}
              onLoad={onImageLoad}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                width: "auto",
                height: "auto",
              }}
            />
          </ReactCrop>
        </div>
        <DialogFooter className="p-6 pt-0 justify-center">
          <DialogClose asChild>
            <Button
              size={"sm"}
              type="reset"
              className="w-fit"
              variant={"outline"}
              onClick={handleCancel}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            size={"sm"}
            className="w-fit"
            onClick={handleCrop}
          >
            <CropIcon className="mr-1.5 size-4" />
            Recortar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
        height: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}
