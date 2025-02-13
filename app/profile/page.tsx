"use client"

import { useEffect, useState } from "react"
import { ProfileImageUploader } from "./ProfileImageUploader"
import { uploadBase64ToDirectus } from "@/services/uploadAvatarService"

export default function ProfileImagePage() {
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Leer `access_token` de localStorage al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      setAccessToken(token)
    }
  }, [])

  const handleCroppedImage = (image: string) => {
    console.log("Cropped image received:", image.substring(0, 50) + "...")
    setCroppedImageUrl(image)
  }

  useEffect(() => {
    if (croppedImageUrl && accessToken) {
      (async () => {
        const id = await uploadBase64ToDirectus(croppedImageUrl, accessToken)
        if (id) setAvatarId(id)
      })()
    }
  }, [croppedImageUrl, accessToken]) // Se ejecuta cuando cambia la imagen o el token

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Profile Image Upload</h1>
      <div className="max-w-md mx-auto">
        <ProfileImageUploader onImageCropped={handleCroppedImage} />
      </div>
      <p className="mt-2 text-center text-gray-600">
        Click on the avatar or the upload button to select and crop your profile image.
      </p>

      {avatarId && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Profile Image</h2>
          <img
            src={`/webapi/assets/${avatarId}`}
            alt="Profile"
            className="mx-auto mb-4 max-w-xs rounded-full"
          />
          <h3 className="text-xl font-bold mb-2">Avatar ID</h3>
          <div className="bg-gray-100 p-4 rounded-md overflow-auto">
            <code className="text-sm break-all">{avatarId}</code>
          </div>
        </div>
      )}
    </div>
  )
}
