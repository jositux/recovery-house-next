"use client"

import { useState } from "react"
import RoomForm from "./RoomForm"
import { roomService } from "@/services/AddRoomImagesService"
import { uploadFile } from "@/services/fileUploadService"
import { Fraunces } from "next/font/google"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
// Definición simple de tipos de idioma para referencia 
import { type Locale } from "@/lib/i18n"
import { useParams } from "next/navigation";

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


  // Función para obtener el ID de forma robusta
  const getPropertyIdFromPath = (path: string): string => {
    // 1. Dividir la ruta y filtrar los segmentos vacíos
    //    '/es/mi-panel/propiedades/ID/room/crear' -> ['es', 'mi-panel', 'propiedades', 'ID', 'room', 'crear']
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    // 2. Buscar el índice de la palabra clave 'propiedades'
    const propertiesIndex = segments.indexOf('propiedades');
    
    // 3. Verificar si se encontró 'propiedades' y si hay un segmento que lo sigue (el ID)
    if (propertiesIndex !== -1 && segments.length > propertiesIndex + 1) {
      // El ID de la propiedad es el segmento que sigue inmediatamente a 'propiedades'
      return segments[propertiesIndex + 1];
    }
    
    // 4. Fallback si no se encuentra
    return "demo-property-id";
  };


  const pathname = usePathname()
  const propertyId = getPropertyIdFromPath(pathname);


  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Por defecto 'es'
  const isSpanish = lang === "es";

  const router = useRouter()

  const handleFormSubmit = async (data: RoomFormData) => {

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
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>{isSpanish ? "Agregar Habitación / Cama": "Add Room / Bed"}</h1>
        <div className="grid gap-6 md:grid-cols-1">
          <div>
            <RoomForm onSubmit={handleFormSubmit} initialValues={initialValues} isUploading={isUploading} />
          </div>
        </div>
      </div>
    </div>
  )
}
