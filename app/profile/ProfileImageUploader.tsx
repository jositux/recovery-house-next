"use client";

import type React from "react";
import { useState } from "react";
import {
  ProfileImageCropper,
  type FileWithPreview,
} from "./ProfileImageCropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileImageUploaderProps {
  onImageCropped: (croppedImage: string) => void;
}

export function ProfileImageUploader({
  onImageCropped,
}: ProfileImageUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  );
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      }) as FileWithPreview;
      setSelectedFile(fileWithPreview);
      setIsDialogOpen(true);
    }
  };

  const handleCroppedImage = (image: string) => {
    console.log("Image cropped in uploader:", image.substring(0, 50) + "..."); // Log the first 50 characters
    setCroppedImage(image);
    onImageCropped(image);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar
        className="w-32 h-32 cursor-pointer"
        onClick={() => document.getElementById("profile-image-upload")?.click()}
      >
        <AvatarImage src={croppedImage || undefined} alt="Profile" />
        <AvatarFallback>
          <User className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>

      <Button
        className="w-full mb-4 bg-[#4A89DC] hover:bg-[#4A89DC]/90"
        size="lg"
        onClick={() => document.getElementById("profile-image-upload")?.click()}
      >
        Subir foto
      </Button>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-image-upload"
      />

      {selectedFile && (
        <ProfileImageCropper
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onCroppedImage={handleCroppedImage}
        />
      )}
    </div>
  );
}
