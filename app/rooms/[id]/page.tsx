"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Wifi,
  Car,
  AmbulanceIcon as FirstAid,
  Shirt,
  Waves,
  Tv,
  Clock,
  ChefHat,
  Hospital,
} from "lucide-react";
import { Camera } from "lucide-react";
import { BookingWidget } from "@/components/ui/booking-widget";
import { AmenityIcon } from "@/components/ui/amenity-icon";
import { ServiceProviderCard } from "@/components/ui/service-provider-card";
import { GoogleMap } from "@/components/ui/google-map";
import { Fraunces } from "next/font/google";
import { PhotoGallery } from "@/components/ui/photo-gallery";

const fraunces = Fraunces({ subsets: ["latin"] });

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: string;
  mainImage: string;
  cleaningFee: string;
  beds: number;

  photos: {
    directus_files_id: string;
  }[];
  extraTags: { ExtraTags_id: string }[];
  servicesTags: { serviceTags_id: string }[];
}

interface Property {
  id: string;
  name: string;
  country: string;
  region: string;
  state: string;
  city: string;
  place: {
    type: string;
    coordinates: [number, number];
  };
  description: string | null;
  photos: {
    directus_files_id: string;
  }[];
  Rooms: Room[];
}

interface Booking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  patient: string;
  guests: number;
  price: number;
  cleaning: number;
  room: string;
}

interface ServiceProvider {
  id: string;
  date_created: string;
  taxIdEIN: string;
  taxIdEINFile: string;
  RNTFile: string;
  taxIdApproved: boolean;
  membership: string;
  userId: string;
  phone: string;
  email: string;
  name: string;
  description: string;
  country: string;
  state: string;
  city: string;
  extraTags: number[];
  serviceTags: number[];
}

export default function RoomPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [propertyResponse, bookingsResponse, providerResponse] =
          await Promise.all([
            axios.get("/webapi/items/Property", {
              params: {
                fields:
                  "*,photos.directus_files_id.*, Rooms.*, Rooms.photos.*, Rooms.extraTags.*, Rooms.extraTags.*, Rooms.servicesTags.*",
              },
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }),
            axios.get(`/webapi/items/Booking`, {
              params: {
                "filter[room][_eq]": id,
              },
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }),
            axios.get("/webapi/items/Provider", {
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }),
          ]);

        const properties = propertyResponse.data.data;
        const foundProperty = properties.find((prop: Property) =>
          prop.Rooms.some((room: Room) => room.id === id)
        );
        if (foundProperty) {
          setProperty(foundProperty);
          setRoom(
            foundProperty.Rooms.find((room: Room) => room.id === id) || null
          );
        } else {
          setError("Habitación no encontrada");
        }

        setServiceProviders(providerResponse.data.data);
        setBookings(bookingsResponse.data.data);
      } catch (error) {
        console.error("Error fetching room data:", error);
        setError(
          "Error al cargar los datos de la habitación. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRoomData();
    }
  }, [id]);

  useEffect(() => {
    if (room && room.photos) {
      setPhotoIds(
        room.photos.map((photo) => `/webapi/assets/${photo.directus_files_id}`)
      );
    }
  }, [room]);

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "");
    const txt = document.createElement("textarea");
    txt.innerHTML = textWithoutTags;
    return txt.value;
  };

  const amenities = [
    { icon: Wifi, label: "WiFi" },
    { icon: Car, label: "Traslados desde y hacia la clínica" },
    { icon: FirstAid, label: "Servicio de Enfermería" },
    { icon: Shirt, label: "Lavandería gratis" },
    { icon: Waves, label: "Piscina/spa" },
    { icon: Tv, label: "TV" },
    { icon: Clock, label: "Servicio 24/7" },
    { icon: ChefHat, label: "Chef" },
    { icon: Hospital, label: "Clínica Médica/hospitalaria" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (error || !room || !property) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Habitación no encontrada"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[500px] w-full">
        <img
          src={`/webapi/assets/${room.mainImage}`}
          alt={property.name}
          className="w-full h-full object-cover"
        />
       
      </div>

      {photoIds.length > 1 && (
  <div className="container relative mx-auto px-4 lg:px-20">
    <button
      className="absolute left-20 bottom-8 bg-white px-4 py-2 rounded-md text-[#162F40] flex items-center gap-2"
      onClick={() => setIsGalleryOpen(true)}
    >
      <Camera className="w-5 h-5" />
      Ver todas las fotos
    </button>
  </div>
)}

      {/* Photo Gallery */}

      <PhotoGallery
        photos={photoIds}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Stats */}
            <div className="mb-6">
              <h1
                className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
              >
                {room.name}
              </h1>
              <p className="text-xl text-[#162F40] mb-4">{property.name}</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-[#162F40]">
                {decodeHtmlAndRemoveTags(room.description)}
              </p>
            </div>

            {/* Booking Widget for mobile */}
            <div className="mb-4 lg:hidden">
              {" "}
              {/* Modified margin */}
              <BookingWidget
                room={room.id}
                name={room.name}
                description={room.description}
                price={Number.parseFloat(room.pricePerNight)}
                cleaning={Number.parseFloat(room.cleaningFee)}
                bookings={bookings}
              />
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2
                className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}
              >
                Amenidades / Servicios
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.servicesTags.map((tag, index) => (
                  <AmenityIcon
                    key={index}
                    icon={
                      amenities.find((a) => a.label === tag.serviceTags_id)
                        ?.icon || Wifi
                    }
                    label={tag.serviceTags_id}
                  />
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#162F40] mb-4">
                El vecindario
              </h2>
              <div className="h-[300px] w-full relative rounded-lg overflow-hidden">
                <GoogleMap
                  lat={property.place.coordinates[0]}
                  lng={property.place.coordinates[1]}
                />
              </div>
            </div>

            {/* Service Providers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#162F40]">
                  Proveedores de servicios
                </h2>
                <button className="text-[#39759E]">Filtrar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceProviders.map((provider) => (
                  <ServiceProviderCard
                    key={provider.id}
                    name={provider.name}
                    service={provider.description}
                    treatment={provider.serviceTags.join(", ")}
                    phone={provider.phone}
                    email={provider.email}
                  />
                ))}
              </div>
            </div>

            {/* Booking Widget for mobile (at the bottom) */}
            <div className="mt-8 lg:hidden">
              <BookingWidget
                room={room.id}
                name={room.name}
                description={room.description}
                price={Number.parseFloat(room.pricePerNight)}
                cleaning={Number.parseFloat(room.cleaningFee)}
                bookings={bookings}
              />
            </div>
          </div>

          {/* Booking Widget for desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <BookingWidget
                room={room.id}
                name={room.name}
                description={room.description}
                price={Number.parseFloat(room.pricePerNight)}
                cleaning={Number.parseFloat(room.cleaningFee)}
                bookings={bookings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
