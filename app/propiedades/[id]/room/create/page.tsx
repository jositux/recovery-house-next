"use client"

//import { useState } from "react";
import RoomForm from "./RoomForm"
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roomService, type RoomData } from "@/services/AddRoomService2"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

export default function RoomPage() {
  //const [submittedData, setSubmittedData] = useState<RoomData | null>(null);

  const pathname = usePathname() // Obtiene la ruta actual
  const pathSegments = pathname.split("/") // Divide la URL en segmentos
  const propertyId = pathSegments[2] // Obtiene el ID correcto de la URL

  const router = useRouter()

  const handleFormSubmit = async (data: RoomData) => {
    //setSubmittedData(data);
    const response = await roomService.createRoom(data)

    if (response.id) {
      router.push(`/propiedades/${data.propertyId}?rel=new-room`)
    }

    return response.id
  }

  const initialValues: RoomData = {
    id: "",
    propertyId: propertyId,
    name: "",
    roomNumber: "",
    description: "",
    // Campos de tipo de habitación
    isPrivate: true,
    // Configuración de camas
    singleBeds: 0,
    doubleBeds: 0,
    // Total de camas y capacidad
    beds: 1,
    capacity: 1,
    // Precios para habitación privada
    pricePerNight: 0,
    cleaningFee: 0,
    // Precios para habitación compartida
    singleBedPrice: 0,
    singleBedCleaningPrice: 0,
    doubleBedPrice: 0,
    doubleBedCleaningPrice: 0,
    // Otros campos
    photos: [],
    extraTags: [""],
    servicesTags: ["all-included"],
    descriptionService: "",
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Agregar Habitación</h1>
        <div className="grid gap-6 md:grid-cols-1">
          <div>
            <RoomForm onSubmit={handleFormSubmit} initialValues={initialValues} />
          </div>
        </div>
      </div>
    </div>
  )
}
