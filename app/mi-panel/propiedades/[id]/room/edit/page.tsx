"use client";

//import { useState } from "react";
import RoomForm from "../RoomForm";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  roomUpdateService,
  type RoomUpdateData,
} from "@/services/RoomUpdateService4";
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

//import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  /*const [submittedData, setSubmittedData] = useState<RoomUpdateData | null>(
    null
  );*/

  //const pathname = usePathname(); // Obtiene la ruta actual
  ///const pathSegments = pathname.split("/"); // Divide la URL en segmentos

  const router = useRouter();

  const handleFormSubmit = async (data: RoomUpdateData) => {
    //setSubmittedData(data);
    const response = await roomUpdateService.updateRoom(data);

    router.push(`/mi-panel/propiedades/${data.propertyId}?rel=new-room`);

    return response.id;
  };

  const storedRoomData = localStorage.getItem("selected_room"); // Suponiendo que usaste esta clave para guardarlo

  const initialValues: RoomUpdateData = storedRoomData
    ? (() => {
        const parsedData = JSON.parse(storedRoomData);

        console.log("que trae todo", parsedData);

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
          beds: parseInt(parsedData.beds) || 2,
          capacity: parseInt(parsedData.capacity) || 4,
          pricePerNight: parseInt(parsedData.pricePerNight) || 0,
          cleaningFee: parseInt(parsedData.cleaningFee) || 0,

          // Precios para habitación privada o cama
          privateRoomPrice: parseInt(parsedData.privateRoomPrice) || 0,
          privateRoomCleaning: parseInt(parsedData.privateRoomCleaning) || 0,

          // Pricing for SHARED room - 2 campos separados
          sharedRoomPrice: parseInt(parsedData.sharedRoomPrice) || 0,
          sharedRoomCleaning: parseInt(parsedData.sharedRoomCleaning) || 0,

          bedType: parsedData.bedType || "",
          bedName: parsedData.bedName || "",

          checkinTime: parsedData.check_in_hour?.substring(0, 5) ?? "15:00",
          checkoutTime: parsedData.check_out_hour?.substring(0, 5) ?? "11:00",

      
          // Discount fields
          shortStayDiscount: parseInt(parsedData.discount_percentage_short_stay, 10).toString() || "0",
          mediumStayDiscount: parseInt(parsedData.discount_percentage_medium_stay, 10).toString() || "0",
          longStayDiscount: parseInt(parsedData.discount_percentage_long_stay, 10).toString() || "0",

          photos: parsedData.photos
            ? parsedData.photos.map(
                (photo: { directus_files_id: { id: string } }) =>
                  photo.directus_files_id.id
              )
            : [],
          extraTags: parsedData.extraTags
            ? parsedData.extraTags.map(
                (tag: { ExtraTags_id: string }) => tag.ExtraTags_id
              )
            : [""],
          servicesTags: parsedData.servicesTags
            ? parsedData.servicesTags.map(
                (tag: { serviceTags_id: string }) => tag.serviceTags_id
              )
            : [""],
        };
      })()
    : {
        id: "",
        propertyId: "",
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

  console.log("valores iniciales", initialValues);

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
      <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
      Editar Habitación / Cama
              </h1>
       
        <div className="grid gap-6 mx-auto">
          <div className="container">
            <RoomForm
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
            />
          </div>
          {/*
        {submittedData && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Submitted Room Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Name:</strong> {submittedData.name}
                </p>
                <p>
                  <strong>Room Number:</strong> {submittedData.roomNumber}
                </p>
                <p>
                  <strong>Description:</strong> {submittedData.description}
                </p>
                <p>
                  <strong>Beds:</strong> {submittedData.beds}
                </p>
                <p>
                  <strong>Capacity:</strong> {submittedData.capacity}
                </p>
                <p>
                  <strong>Price per Night:</strong> $
                  {submittedData.pricePerNight.toFixed(2)}
                </p>
                <p>
                  <strong>Cleaning Fee:</strong> $
                  {submittedData.cleaningFee.toFixed(2)}
                </p>
                <p>
                  <strong>Main Image:</strong> {submittedData.mainImage}
                </p>
                <p>
                  <strong>Additional Photos:</strong>{" "}
                  {submittedData.photos.join(", ")}
                </p>
                <p>
                  <strong>Extra Tags:</strong>{" "}
                  {submittedData.extraTags.join(", ")}
                </p>
                <p>
                  <strong>Services Tags:</strong>{" "}
                  {submittedData.servicesTags.join(", ")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}*/}
        </div>
      </div>
    </div>
  );
}
