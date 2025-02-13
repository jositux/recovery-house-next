"use client";

import { useState } from "react";
import RoomForm from "./RoomForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roomService, type RoomData } from "@/services/AddRoomService";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  const [submittedData, setSubmittedData] = useState<RoomData | null>(null);

  const pathname = usePathname(); // Obtiene la ruta actual
  const pathSegments = pathname.split("/"); // Divide la URL en segmentos
  const propertyId = pathSegments[2]; // Obtiene el ID correcto de la URL

  const router = useRouter();


  const handleFormSubmit = async (data: RoomData) => {
    setSubmittedData(data);
    const response = await roomService.createRoom(data);
  
    if (response.id) {
      router.push(`/propiedades/${data.propertyId}`);
    }
    
    return response.id;
  };
  

  const initialValues: RoomData = {
    id:"",
    propertyId: propertyId,
    name: "",
    roomNumber: "",
    description: "",
    beds: 1,
    capacity: 1,
    pricePerNight: 0,
    cleaningFee: 0,
    mainImage: "",
    photos: [],
    extraTags: [""],
    servicesTags: [""],
  };

  return (
    <div className="container mx-auto p-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Room Information Form</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <RoomForm onSubmit={handleFormSubmit} initialValues={initialValues} />
        </div>
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
        )}
      </div>
    </div>
  );
}
