"use client";

import { useState, useEffect, useRef } from "react";
import { ProfileImageUploader } from "./ProfileImageUploader";
import { uploadBase64ToDirectus } from "@/services/uploadAvatarService";

interface ProfileImageSectionProps {
  userId: string;
  accessToken: string;
  existingAvatarId?: string | null;
  // 🌐 Nueva prop para el idioma
  lang: string; 
}

export function ProfileImageSection({
  userId,
  accessToken,
  existingAvatarId,
  lang, // Recibimos el idioma como prop
}: ProfileImageSectionProps) {
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(existingAvatarId ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSuccessMessage, setImageSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processedImages = useRef(new Set<string>());

  // 🌐 Lógica de Idioma
  const isSpanish = lang === "es";

  // Textos localizados
  const texts = {
    successMessage: isSpanish 
      ? "Imagen de perfil actualizada exitosamente" 
      : "Profile image updated successfully",
    defaultError: isSpanish 
      ? "Error al subir la imagen" 
      : "Error uploading image",
    uploadingMessage: isSpanish 
      ? "Subiendo imagen de perfil..." 
      : "Uploading profile image...",
  };

  // Handle when the user crops a new image
  const handleCroppedImage = (image: string) => {
    setCroppedImageUrl(image);
  };

  // Reset success/error messages after a timeout
  const showTemporaryMessage = (
    successMsg: string | null,
    errorMsg: string | null,
    duration: number = 5000
  ): void => {
    setImageSuccessMessage(successMsg);
    setErrorMessage(errorMsg);

    setTimeout(() => {
      setImageSuccessMessage(null);
      setErrorMessage(null);
    }, duration);
  };

  // Upload the avatar when a new image is cropped
  useEffect(() => {
    if (!croppedImageUrl || !accessToken || isUploading) return;

    // Skip if already processed this exact image
    if (processedImages.current.has(croppedImageUrl)) return;

    setIsUploading(true);
    processedImages.current.add(croppedImageUrl);

    const uploadAvatar = async () => {
      try {
        const id = await uploadBase64ToDirectus(croppedImageUrl, accessToken);
        
        if (id) {
          setAvatarId(id);
          
          await updateUserAvatar(userId, id, accessToken);
          
          // Usamos el texto traducido
          showTemporaryMessage(texts.successMessage, null); 
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        // Usamos el texto traducido por defecto, pero permitimos el mensaje del error
        let errorMessage = texts.defaultError; 
        if (error instanceof Error) {
          // Si el error es una instancia de Error, usamos su mensaje
          errorMessage = error.message; 
        }
        showTemporaryMessage(null, errorMessage);
      } finally {
        setIsUploading(false);
      }
    };

    uploadAvatar();
  }, [croppedImageUrl, accessToken, userId, isUploading, texts.successMessage, texts.defaultError]);

  // Default implementation of updating user avatar
  const updateUserAvatar = async (
    userId: string,
    avatarId: string,
    token: string
  ) => {
    try {
      const response = await fetch(`/webapi/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: avatarId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user avatar: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating user avatar:", error);
      throw error;
    }
  };

  return (
    <div className="">
      
      <div className="max-w-xs mx-auto">
        <ProfileImageUploader
          onImageCropped={handleCroppedImage}
          existingAvatarId={avatarId || undefined}
          lang={lang} 
        />
        {isUploading && (
          <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm text-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            {texts.uploadingMessage} {/* Texto traducido */}
          </div>
        )}
        {imageSuccessMessage && (
          <div className="mt-2 text-green-600 text-sm text-center">
            {imageSuccessMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-2 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}