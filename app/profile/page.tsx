"use client"

import { useEffect, useState, useRef } from "react"
import { ProfileImageUploader } from "./ProfileImageUploader"
import { uploadBase64ToDirectus } from "@/services/uploadAvatarService"
import { getCurrentUser, type User } from "@/services/userService"
import { useRouter } from "next/navigation"

export default function ProfileImagePage() {
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  
  // Keep track of the images we've already processed
  const processedImages = useRef(new Set<string>())

  // Auth check and get user data
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      // Redirect to login if no token found
      router.push("/login")
      return
    }

    setAccessToken(token)
    
    // Fetch current user information
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(token)
        setUser(userData)
        
        // If user already has an avatar, set it
        if (userData.avatar) {
          setAvatarId(userData.avatar)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // If authentication error, redirect to login
        if (error instanceof Error && error.message.includes("Token")) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleCroppedImage = (image: string) => {
    setCroppedImageUrl(image)
  }

  useEffect(() => {
    if (!croppedImageUrl || !accessToken || isUploading) {
      return
    }

    // Skip if we've already processed this image
    if (processedImages.current.has(croppedImageUrl)) {
      return
    }

    // Mark as uploading and add to processed images
    setIsUploading(true)
    processedImages.current.add(croppedImageUrl)
    
    const uploadAvatar = async () => {
      try {
        const id = await uploadBase64ToDirectus(croppedImageUrl, accessToken)
        
        if (id) {
          setAvatarId(id)
          
          // Update user avatar in Directus
          if (user) {
            await updateUserAvatar(user.id, id, accessToken)
          }
        }
      } catch (error) {
        console.error("Error uploading avatar:", error)
      } finally {
        // Reset uploading state but keep the URL to prevent re-upload attempts
        setIsUploading(false)
      }
    }
    
    uploadAvatar()
  }, [croppedImageUrl, accessToken, user, isUploading])
  
  // Function to update user's avatar in the database
  const updateUserAvatar = async (userId: string, avatarId: string, token: string) => {
    try {
      const response = await fetch(`/webapi/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          avatar: avatarId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update user avatar: ${response.statusText}`)
      }
      
      // Update local user state
      if (user) {
        setUser({...user, avatar: avatarId})
      }
      
    } catch (error) {
      console.error("Error updating user avatar:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Actualizando su perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Imagen de perfil</h2>
        <div className="max-w-md mx-auto">
          <ProfileImageUploader 
            onImageCropped={handleCroppedImage} 
            existingAvatarId={avatarId || undefined} 
          />
        </div>
        <p className="mt-2 text-center text-gray-600">
          Haz clic en la imagen del perfil o en el botón de carga para seleccionar y recortar su imagen de perfil.
        </p>
        
        {isUploading && (
          <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded text-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Subiendo su imagen de perfil...
          </div>
        )}
      </div>
    </div>
  )
}
