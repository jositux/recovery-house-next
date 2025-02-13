"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Bed, User, Pencil, Plus } from "lucide-react";
import { GoogleMap } from "@/components/ui/google-map";
import { PropertyBlockForm } from "@/components/property-block-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import Link from "next/link";

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: string;
  mainImage: string;
  cleaningFee: string;
  photos: {
    directus_files_id: {
      id: string;
    };
  }[];
  extraTags: { ExtraTags_id: string }[];
  servicesTags: { serviceTags_id: string }[];
  roomNumber: string;
  beds: number;
  capacity: number;
}

interface Property {
  id: string;
  userId: string;
  name: string;
  country: string;
  region: string;
  state: string;
  city: string;
  place: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  mainImage: string;
  Rooms: Room[];
  type: string;
  taxIdEIN: string;
  RNTFile: string;
  taxIdApproved: boolean;
  address: string;
  fullAddress: string;
  postalCode: string;
}

export default function RoomPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const router= useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [propertyResponse] = await Promise.all([
          axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields: "*,Rooms.*, Rooms.photos.*, Rooms.extraTags.*, Rooms.servicesTags.*",
            },
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          }),
         
        ]);

        setProperty(propertyResponse.data.data);
       
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Error al cargar los datos. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "");
    const txt = document.createElement("textarea");
    txt.innerHTML = textWithoutTags;
    return txt.value;
  };

  const handleEditBanner = () => {
    // Add logic to edit the banner
    console.log("Editing banner");
  };

  const handleEditRoom = (room: Room) => {

    console.log("Room elegido ", room)
    localStorage.setItem("selected_room", JSON.stringify(room));
    router.push(`/propiedades/${id}/room/edit`);
    //setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Propiedad no encontrada"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Property Image */}
      <div className="relative h-[500px] w-full">
        <Image
          src={`/webapi/assets/${property.mainImage}`}
          alt={property.name}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleEditBanner}
            className="rounded-full bg-white bg-opacity-50 hover:bg-opacity-100"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar Propiedad</span>
          </Button>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#162F40] mb-4">
          {property.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xl text-[#162F40] mb-2">
              {property.fullAddress}
            </p>
            <p className="text-lg text-[#162F40]">
              {decodeHtmlAndRemoveTags(property.description)}
            </p>
          </div>
          <div className="h-64 rounded-lg">
            <GoogleMap
              lat={property.place.coordinates[0]}
              lng={property.place.coordinates[1]}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-20">
  <h2 className="text-2xl font-bold text-[#162F40]">
    Habitaciones disponibles
  </h2>
  <Button asChild>
    <Link href={`/propiedades/${property.id}/room/create`} className="flex items-center gap-2">
      <Plus className="h-5 w-5" />
      Agregar Habitación
    </Link>
  </Button>
</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {property.Rooms.map((room: Room) => (
            <div key={room.id} className="border rounded-lg overflow-hidden">
              <div className="relative w-[400px] h-[225px] overflow-hidden">
                <Image
                  src={`/webapi/assets/${room.mainImage}`}
                  alt={room.name}
                  width={400}
                  height={225}
                  objectFit="cover"
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    variant="secondary"
                    onClick={() =>  handleEditRoom(room)}
                    className="flex items-center gap-2 rounded-full bg-white bg-opacity-100 hover:bg-opacity-100 px-4 py-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    <span>Camas: {room.beds}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span>Capacidad: {room.capacity}</span>
                  </div>
                </div>
                {/*<p className="text-[#162F40] mb-4">
                  {decodeHtmlAndRemoveTags(room.description).substring(0, 100)}
                  ...
          </p>*/}
                <p className="text-lg font-bold mb-2">
                  ${room.pricePerNight} / noche
                </p>
                <p className="text-sm text-[#162F40]">
                  Tarifa de limpieza: ${room.cleaningFee}
                </p>
              </div>
              <PropertyBlockForm />
            </div>
          ))}
        </div>


        

      </div>
    </div>
  );
}
