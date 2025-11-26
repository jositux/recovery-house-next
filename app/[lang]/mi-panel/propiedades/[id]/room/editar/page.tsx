"use client"

import { useState } from "react"
import RoomForm from "./RoomForm"
import { roomUpdateService, type RoomUpdateData } from "@/services/RoomUpdateService4"
import { Fraunces } from "next/font/google"
import { uploadFile } from "@/services/fileUploadService"
import { deleteFile } from "@/services/deleteFileService"
import { useToast } from "@/hooks/use-toast"

const fraunces = Fraunces({ subsets: ["latin"] })

import { useRouter } from "next/navigation"

export default function RoomPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [remainingIds, setRemainingIds] = useState<string[]>([])
  const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([])

  const handleImagesChange = (files: File[], existingIds: string[], marked: string[]) => {
    setNewFiles(files)
    setRemainingIds(existingIds)
    setMarkedForDeletion(marked)
  }

  const handleFormSubmit = async (data: RoomUpdateData) => {
    try {
      const accessToken = localStorage.getItem("access_token")

      if (!accessToken) {
        throw new Error("Access token not found in localStorage")
      }

      if (markedForDeletion.length > 0) {
        toast({
          title: "Eliminando imágenes...",
          description: `Eliminando ${markedForDeletion.length} imagen(es)`,
        })

        const deletePromises = markedForDeletion.map((id) => deleteFile(id, accessToken))
        await Promise.all(deletePromises)
      }

      let finalPhotoIds: string[] = []

      // Get existing IDs that weren't marked for deletion
      const idsNotMarked = remainingIds.filter((id) => !markedForDeletion.includes(id))

      // Upload new files if any
      if (newFiles.length > 0) {
        toast({
          title: "Subiendo imágenes...",
          description: `Subiendo ${newFiles.length} imagen(es) nueva(s)`,
        })

        const uploadPromises = newFiles.map((file) => uploadFile(file))
        const uploadResults = await Promise.all(uploadPromises)
        const newImageIds = uploadResults.map((result) => result.id)

        finalPhotoIds = [...idsNotMarked, ...newImageIds]
      } else {
        // No new files, just use existing IDs
        finalPhotoIds = idsNotMarked
      }

      const finalData = {
        ...data,
        photos: finalPhotoIds,
      }

      const response = await roomUpdateService.updateRoom(finalData)

      toast({
        title: "¡Felicidades!",
        description: "La habitación ha sido guardada",
        variant: "default",
      })

      router.push(`/mi-panel/propiedades/${data.propertyId}?rel=new-room`)

      return response.id
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: "Hubo un error al guardar los cambios",
        variant: "destructive",
      })
      throw error
    }
  }

  const storedRoomData = localStorage.getItem("selected_room")

  const initialValues: RoomUpdateData = storedRoomData
    ? (() => {
        const parsedData = JSON.parse(storedRoomData)

        console.log("que trae todo", parsedData)

        return {
          id: parsedData.id || "",
          propertyId: parsedData.propertyId || "",
          name: parsedData.name || "",
          roomNumber: parsedData.roomNumber || "",
          description: parsedData.description || "",
          isPrivate: parsedData.isPrivate === false ? false : true,
          singleBeds: parsedData.singleBeds || 0,
          doubleBeds: parsedData.doubleBeds || 0,
          descriptionService: parsedData.descriptionService || "",
          beds: Number.parseInt(parsedData.beds) || 2,
          capacity: Number.parseInt(parsedData.capacity) || 4,
          pricePerNight: Number.parseInt(parsedData.pricePerNight) || 0,
          cleaningFee: Number.parseInt(parsedData.cleaningFee) || 0,
          privateRoomPrice: Number.parseInt(parsedData.privateRoomPrice) || 0,
          privateRoomCleaning: Number.parseInt(parsedData.privateRoomCleaning) || 0,
          sharedRoomPrice: Number.parseInt(parsedData.sharedRoomPrice) || 0,
          sharedRoomCleaning: Number.parseInt(parsedData.sharedRoomCleaning) || 0,
          bedType: parsedData.bedType || "",
          bedName: parsedData.bedName || "",
          checkinTime: parsedData.check_in_hour?.substring(0, 5) ?? "15:00",
          checkoutTime: parsedData.check_out_hour?.substring(0, 5) ?? "11:00",
          shortStayDiscount: Number.parseInt(parsedData.discount_percentage_short_stay, 10).toString() || "0",
          mediumStayDiscount: Number.parseInt(parsedData.discount_percentage_medium_stay, 10).toString() || "0",
          longStayDiscount: Number.parseInt(parsedData.discount_percentage_long_stay, 10).toString() || "0",
          photos: parsedData.photos
            ? parsedData.photos.map((photo: { directus_files_id: { id: string } }) => photo.directus_files_id.id)
            : [],
          extraTags: parsedData.extraTags
            ? parsedData.extraTags.map((tag: { ExtraTags_id: string }) => tag.ExtraTags_id)
            : [""],
          servicesTags: parsedData.servicesTags
            ? parsedData.servicesTags.map((tag: { serviceTags_id: string }) => tag.serviceTags_id)
            : ["all-included"],
        }
      })()
    : {
        id: "",
        propertyId: "",
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
        extraTags: [""],
        servicesTags: ["all-included"],
        descriptionService: "",
      }

  console.log("valores iniciales", initialValues)

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>Editar Habitación / Cama</h1>
        <div className="grid gap-6 mx-auto">
          <div className="container">
            <RoomForm onSubmit={handleFormSubmit} initialValues={initialValues} onImagesChange={handleImagesChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
