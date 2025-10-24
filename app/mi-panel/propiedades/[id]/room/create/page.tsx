"use client";

//import { useState } from "react";
import RoomForm from "../RoomForm";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roomService, type RoomData } from "@/services/AddRoomService4";
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  //const [submittedData, setSubmittedData] = useState<RoomData | null>(null);

  const pathname = usePathname(); // Obtiene la ruta actual
  const pathSegments = pathname.split("/"); // Divide la URL en segmentos
  const propertyId = pathSegments[3]; // Obtiene el ID correcto de la URL

  const router = useRouter();

  const handleFormSubmit = async (data: RoomData) => {
    //setSubmittedData(data);

    console.log(data);
    const response = await roomService.createRoom(data);

    if (response.id) {
      router.push(`/mi-panel/propiedades/${data.propertyId}?rel=new-room`);
    }

    return response.id;
  };

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

    // Precios para habitación privada o cama
    privateRoomPrice: 0,
    privateRoomCleaning: 0,

    // Pricing for SHARED room - 2 campos separados
    sharedRoomPrice: 0,
    sharedRoomCleaning: 0,

    bedType: "single",
    bedName: "",

    checkinTime:"15:00",
    checkoutTime:"11:00",

    // Discount fields
    shortStayDiscount: "0",
    mediumStayDiscount: "0",
    longStayDiscount: "0",

    // Otros campos
    photos: [],
    extraTags: [""],
    servicesTags: ["all-included"],
    descriptionService: "",
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4 px-4">
      <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
      Agregar Habitación / Cama
              </h1>
        <div className="grid gap-6 md:grid-cols-1">
          <div>
            <RoomForm
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
