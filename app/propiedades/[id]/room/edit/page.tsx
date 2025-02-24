"use client";

//import { useState } from "react";
import RoomForm from "@/components/forms/RoomForm";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  roomUpdateService,
  type RoomUpdateData,
} from "@/services/RoomUpdateService";

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

    router.push(`/propiedades/${data.propertyId}?rel=new-room`);

    return response.id;
  };

  const storedRoomData = localStorage.getItem("selected_room"); // Suponiendo que usaste esta clave para guardarlo

  const initialValues: RoomUpdateData = storedRoomData
    ? (() => {
        const parsedData = JSON.parse(storedRoomData);

        console.log("que trae", parsedData.descriptionService)

        return {
          id: parsedData.id || "",
          propertyId: parsedData.propertyId || "",
          name: parsedData.name || "",
          roomNumber: parsedData.roomNumber || "",
          description: parsedData.description || "",
          descriptionService: parsedData.descriptionService || "",
          beds: parseInt(parsedData.beds) || 2,
          capacity: parseInt(parsedData.capacity) || 4,
          pricePerNight: parseInt(parsedData.pricePerNight) || 0,
          cleaningFee: parseInt(parsedData.cleaningFee) || 0,
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
        beds: 1,
        capacity: 1,
        pricePerNight: 0,
        cleaningFee: 0,
        photos: [],
        extraTags: [""],
        servicesTags: [""],
        descriptionService: "",
      };

  console.log("valores iniciales", initialValues);

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-2xl font-bold mb-6">Editar Habitación</h1>
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
