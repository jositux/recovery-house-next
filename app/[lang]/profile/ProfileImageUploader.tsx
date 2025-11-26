"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  ProfileImageCropper,
  type FileWithPreview,
} from "./ProfileImageCropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileImageUploaderProps {
  onImageCropped: (croppedImage: string) => void;
  existingAvatarId?: string;
}

export function ProfileImageUploader({
  onImageCropped,
  existingAvatarId,
}: ProfileImageUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  
  // Use existing avatar if provided
  useEffect(() => {
    if (existingAvatarId) {
      setAvatarSrc(`/webapi/assets/${existingAvatarId}`);
    }
  }, [existingAvatarId]);

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
    console.debug(croppedImage);
    setCroppedImage(image);
    setAvatarSrc(image); // Update avatar preview immediately
    onImageCropped(image);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar
        className="w-32 h-32 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => document.getElementById("profile-image-upload")?.click()}
      >
        <AvatarImage src={avatarSrc} alt="Profile" />
        <AvatarFallback>
          <User className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>

      <Button
        className="w-full mb-4 bg-[#39759E] hover:bg-[#39759E]"
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
