"use client"

import { useState } from "react"
import RoomForm from "./RoomForm"
import { roomService } from "@/services/AddRoomImagesService"
import { uploadFile } from "@/services/fileUploadService"
import { Fraunces } from "next/font/google"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const fraunces = Fraunces({ subsets: ["latin"] })

interface RoomFormData {
  id: string
  propertyId: string
  name: string
  roomNumber: string
  description: string
  isPrivate: boolean
  singleBeds: number
  doubleBeds: number
  beds: number
  capacity: number
  privateRoomPrice: number
  privateRoomCleaning: number
  sharedRoomPrice: number
  sharedRoomCleaning: number
  bedType: string
  bedName: string
  checkinTime: string
  checkoutTime: string
  shortStayDiscount: string
  mediumStayDiscount: string
  longStayDiscount: string
  photos: string[]
  imageFiles?: File[]
  extraTags: string[]
  servicesTags: string[]
  descriptionService: string
}

export default function RoomPage() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const pathname = usePathname()
  const pathSegments = pathname.split("/")
  const propertyId = pathSegments[3] || "demo-property-id"

  const router = useRouter()

  const handleFormSubmit = async (data: RoomFormData) => {
    console.log("Form data received:", data)

    if (data.imageFiles && data.imageFiles.length > 0) {
      setIsUploading(true)
      try {
        const uploadPromises = data.imageFiles.map((file: File) => uploadFile(file))
        const uploadResults = await Promise.all(uploadPromises)
        const imageIds = uploadResults.map((result) => result.id)

        data.photos = imageIds

        console.log("Uploaded image IDs:", imageIds)
      } catch (error) {
        console.error("Error uploading images:", error)
        toast({
          title: "Error al subir imágenes",
          description: "Por favor intente nuevamente",
          variant: "destructive",
        })
        setIsUploading(false)
        throw error
      }
    }

    try {
      const roomData = data
      const response = await roomService.createRoom(roomData)

      if (response.id) {
        toast({
          title: "Habitación creada",
          description: "La habitación se ha creado exitosamente",
          variant: "default",
        })
        router.push(`/mi-panel/propiedades/${data.propertyId}?rel=new-room`)
      }

      return response.id
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Error al crear habitación",
        description: "Por favor intente nuevamente",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const initialValues: Partial<RoomFormData> = {
    id: "",
    propertyId: propertyId,
    name: "",
    roomNumber: "",
    description: "",
    isPrivate: true,
    singleBeds: 0,
    doubleBeds: 0,
    beds: 1,
    capacity: 1,
    privateRoomPrice: 0,
    privateRoomCleaning: 0,
    sharedRoomPrice: 0,
    sharedRoomCleaning: 0,
    bedType: "single",
    bedName: "",
    checkinTime: "15:00",
    checkoutTime: "11:00",
    shortStayDiscount: "0",
    mediumStayDiscount: "0",
    longStayDiscount: "0",
    photos: [],
    extraTags: [],
    servicesTags: [],
    descriptionService: "",
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>Agregar Habitación / Cama</h1>
        <div className="grid gap-6 md:grid-cols-1">
          <div>
            <RoomForm onSubmit={handleFormSubmit} initialValues={initialValues} isUploading={isUploading} />
          </div>
        </div>
      </div>
    </div>
  )
}
