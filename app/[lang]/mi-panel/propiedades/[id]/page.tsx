"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  Bed,
  BedSingle,
  BedDouble,
  User,
  Pencil,
  Plus,
  Loader2,
  MapPin,
  Trash,
  CheckCircle,
  AlertCircle,
  Calendar,
  Home,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleMap } from "@/components/ui/google-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { getCurrentUser } from "@/services/userService";
import { getAssetUrl } from "@/lib/getAssetUrl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CannotDeleteDialog } from "./cannot-delete-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

interface ImageType {
  id: string;
  isModerated: boolean;
}

type ImageRoom = {
  directus_files_id: {
    id: string;
    isModerated: boolean;
  };
};

interface FileData {
  id: string;
  filename_download: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: string;
  cleaningFee: string;
  photos: ImageRoom[];
  extraTags: { ExtraTags_id: string }[];
  servicesTags: { serviceTags_id: string }[];
  roomNumber: string;
  beds: number;
  capacity: number;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  // Precios para habitación o cama
  privateRoomPrice: number;
  privateRoomCleaning: number;

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: number;
  sharedRoomCleaning: number;

  bedType: string;
  bedName: string;
  descriptionService: string;
  disabledDates: string;
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
  mainImage: ImageType;
  Rooms: Room[];
  type: string;
  RNTFile: FileData;
  taxIdEINFile: FileData;
  taxIdApproved: boolean;
  address: string;
  fullAddress: string;
  postalCode: string;
}

// Definición simple de tipos de idioma para referencia
import { type Locale } from "@/lib/i18n" 
export default function RoomPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  const [isOwner, setIsOwner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [cannotDeleteType, setCannotDeleteType] = useState<"room" | "property">(
    "room"
  );
  const [selectedRoomForDeletion, setSelectedRoomForDeletion] =
    useState<Room | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Por defecto 'es'

  const isSpanish = lang === "es";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem("access_token");

        let propertyResponse;

        if (accessToken) {
          const currentUser = await getCurrentUser(accessToken);
          propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields:
                "*, RNTFile.filename_download,RNTFile.id,taxIdEINFile.filename_download,taxIdEINFile.id, mainImage.id, mainImage.isModerated, Rooms.*,Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated, Rooms.extraTags.*,Rooms.servicesTags.*",
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log("current ", currentUser.id);
          console.log("property User id ", propertyResponse.data.data.userId);
          const isCurrentUserOwner =
            currentUser.id === propertyResponse.data.data.userId;
          setIsOwner(isCurrentUserOwner);

          if (!isCurrentUserOwner) {
            propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
              params: {
                fields:
                  "*, mainImage.id, mainImage.isModerated, Rooms.*, Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated",
              },
            });
          }
        } else {
          propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields:
                "*, mainImage.id, mainImage.isModerated, Rooms.*, Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated",
            },
          });
        }

        const propertyData: Property = propertyResponse.data.data;

        setProperty(propertyData);
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

  useEffect(() => {
    if (searchParams.get("rel") === "new") {
      setUpdated("property");
      setShowModal(true);
    }
    if (searchParams.get("rel") === "new-room") {
      setUpdated("room");
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log("isOwner updated:", isOwner);
  }, [isOwner]);

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "");
    const txt = document.createElement("textarea");
    txt.innerHTML = textWithoutTags;
    return txt.value;
  };

  const handleEditBanner = (property: Property) => {
    localStorage.setItem("selected_property", JSON.stringify(property));
    router.push(`/${lang}/mi-panel/editar-propiedad/${id}/`);
  };

  const handleEditRoom = (room: Room) => {
    localStorage.setItem("selected_room", JSON.stringify(room));
    router.push(`/${lang}/mi-panel/propiedades/${id}/room/editar`);
  };

  const handleCalendarRoom = (room: Room) => {
    localStorage.setItem("selected_room", JSON.stringify(room));
    router.push(`/${lang}/mi-panel/calendario/${room.id}/`);
  };

  const confirmDeleteProperty = async () => {
    if (!property) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      // 1️⃣ Obtener los IDs de las habitaciones asociadas a la propiedad
      const roomIds = property.Rooms.map((room) => room.id);

      // 2️⃣ Eliminar cada habitación de forma secuencial
      for (const id of roomIds) {
        try {
          await axios.delete(`/webapi/items/Room/${id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log(`✅ Habitación ${id} eliminada`);
        } catch (error) {
          console.error(`❌ Error al eliminar la habitación ${id}:`, error);
        }
      }

      // 3️⃣ Luego, eliminar la propiedad
      await axios.delete(`/webapi/items/Property/${property.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(`🏠 Propiedad ${property.id} eliminada`);

      // 4️⃣ Redireccionar a la lista de propiedades
      router.push(`/${lang}/mi-panel/mis-propiedades`);
    } catch (error) {
      console.error("❌ Error al eliminar la propiedad:", error);
    }
  };

  const confirmDeleteRoom = async () => {
    if (!selectedRoomForDeletion) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      // Aquí implementar la lógica de eliminación real
      await axios.delete(`/webapi/items/Room/${selectedRoomForDeletion.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Actualizar la lista de habitaciones en la UI
      if (property) {
        setProperty({
          ...property,
          Rooms: property.Rooms.filter(
            (room) => room.id !== selectedRoomForDeletion.id
          ),
        });
      }
    } catch (error) {
      console.error("Error al eliminar la habitación:", error);
      // Aquí podrías mostrar un mensaje de error
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    const checkBookings = async (roomIds: string[]): Promise<boolean> => {
      if (roomIds.length === 0) {
        console.log("❌ La propiedad no tiene habitaciones.");
        return false;
      }

      try {
        const idsQuery = roomIds.map((id) => encodeURIComponent(id)).join(","); // Convertir array a string separado por comas
        const url = `/webapi/items/Booking?filter[room][_in]=${idsQuery}&fields=*`;

        //const url = `/webapi/items/Booking?filter[generalState][_eq]=true&filter[room][_in]=${idsQuery}&fields=*`;

        const response = await axios.get(url);

        if (response.data?.data?.length > 0) {
          console.log("✅ Hay reservas:", response.data.data);
          return true; // Hay reservas
        } else {
          console.log("❌ No hay reservas para esta propiedad.");
          return false; // No hay reservas
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        return false; // Manejo de error, asumir que no hay reservas
      }
    };

    // 🔹 Obtener los IDs de las habitaciones de la propiedad
    const roomIds = property.Rooms.map((room) => room.id);

    // 🔹 Esperamos la respuesta antes de continuar
    const hasBookings = await checkBookings(roomIds);

    if (!hasBookings) {
      console.log("🚀 Propiedad sin reservas, puedes eliminarla.");
      setCannotDeleteType("property");
      setShowConfirmDeleteDialog(true);
    } else {
      console.log(
        "⚠️ No se puede eliminar la propiedad porque tiene habitaciones con reservas."
      );
      setCannotDeleteType("property");
      setShowCannotDeleteDialog(true);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    setSelectedRoomForDeletion(room);

    const checkBookings = async (roomId: string): Promise<boolean> => {
      try {
        const url = `/webapi/items/Booking?filter[room][_eq]=${roomId}`;
        //const url = `/webapi/items/Booking?filter[generalState][_eq]=true&filter[room][_eq]=${roomId}`;
        const response = await axios.get(url);

        if (response.data?.data?.length > 0) {
          console.log("✅ Hay reservas:", response.data.data);
          return true; // Hay reservas
        } else {
          console.log("❌ No hay reservas para esta habitación.");
          return false; // No hay reservas
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        return false; // Manejo de error, asumir que no hay reservas
      }
    };

    // 🔹 Esperamos la respuesta antes de continuar
    const hasBookings = await checkBookings(room.id);

    if (!hasBookings) {
      console.log("🚀 Habitación sin reservas, puedes eliminarla.");
      setCannotDeleteType("room");
      setShowConfirmDeleteDialog(true);
    } else {
      console.log(
        "⚠️ No se puede eliminar la habitación porque tiene reservas."
      );
      setCannotDeleteType("room");
      setShowCannotDeleteDialog(true);
    }
  };

  const transformImageRoomToImage = (fileData: ImageRoom): ImageType => {
    return {
      id: fileData.directus_files_id.id,
      isModerated: fileData.directus_files_id.isModerated,
    };
  };

  const getImageSrc = (image: ImageType) => {
    return image.isModerated && !isOwner
      ? "/assets/empty.jpg"
      : getAssetUrl(image.id, "full");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-gray-700">
          Cargando propiedad...
        </span>
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
    <div className="min-h-screen bg-gray-50">
      {/* Property Image */}
      <div className="relative h-[50vh] w-full rounded-lg overflow-hidden">
        <div className="absolute z-10 top-4 left-4 mx-auto">
          <MagicBackButton />
        </div>

        <div className="absolute top-2 z-10 top-4 right-4 mx-auto">
          {isOwner && (
            <div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEditBanner(property)}
                  className="rounded-full bg-white hover:bg-gray-100 text-gray-800 px-4 py-2"
                >
                  <Pencil className="h-4 w-2" />
                  {isSpanish ? "Editar" : "Edit"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleDeleteProperty(property)}
                  className="rounded-full bg-red-900 hover:bg-red-800 text-white px-3 py-2"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Image
          src={getImageSrc(property.mainImage) || "/assets/empty.jpg"}
          alt={property.name}
          layout="fill"
          objectFit="cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-50" />

        <div className="absolute bottom-8 left-0 right-0 text-white">
          <div className="container mx-auto px-4 lg:px-4">
            {isOwner && property.mainImage.isModerated !== undefined && (
              <div className="">
                {property.mainImage.isModerated ? (
                  <Badge
                    variant="outline"
                    className="bg-red-900 text-orange-100 border-orange-300"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {isSpanish ? "Foto en revisión" : "Photo under review"}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-300"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {isSpanish ? "Foto aprobada" : "Photo approved"}
                  </Badge>
                )}
              </div>
            )}

            <h1
              className={`${fraunces.className} lg:text-5xl text-3xl mt-4 font-bold mb-2`}
            >
              {property.name}
            </h1>
            <p className="text-1xl lg:text-1xl">
              {property.city}, {property.state}, {property.country}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2
              className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}
            >
              {isSpanish ? "Acerca de esta propiedad" : "About this property"}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {decodeHtmlAndRemoveTags(property.description)}
            </p>
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <p>{property.fullAddress}</p>
            </div>
          </div>
          <div className="h-64 rounded-lg overflow-hidden shadow-lg">
            <GoogleMap
              lat={property.place.coordinates[0]}
              lng={property.place.coordinates[1]}
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="rounded-xl mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="space-y-2">
                <h2
                  className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
                >
                  {isSpanish ? "Habitaciones / camas" : "Rooms / beds"}
                </h2>
              </div>

              {isOwner && (
                <Link
                  href={`/mi-panel/propiedades/${property.id}/room/crear`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39759E] text-white hover:bg-green-800 transition">
                    <Plus className="h-5 w-5" />
                    {isSpanish
                      ? "Agregar Habitación o Cama"
                      : "Add Room or Bed"}
                  </Button>
                </Link>
              )}
            </div>

            {property.Rooms && property.Rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {property.Rooms.map((room: Room) => (
                  <div
                    key={room.id}
                    className="bg-white relative border pb-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative w-full h-48">
                      <Link href={`/${lang}/rooms/${room.id}`} passHref>
                        <div className="relative w-full h-full">
                          <Image
                            src={
                              room.photos && room.photos.length > 0
                                ? getImageSrc(
                                    transformImageRoomToImage(room.photos[0])
                                  )
                                : "/assets/empty.jpg"
                            }
                            alt={property.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />

                          {isOwner &&
                            room.photos[0]?.directus_files_id.isModerated !==
                              undefined && (
                              <div className="absolute left-4 top-4">
                                {room.photos[0].directus_files_id
                                  .isModerated ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-900 text-orange-100 border-orange-300"
                                  >
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {isSpanish
                                      ? "Foto en revisión"
                                      : "Photo under review"}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800 border-green-300"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {isSpanish
                                      ? "Foto aprobada"
                                      : "Photo approved"}
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>
                      </Link>

                      {isOwner && (
                        <div className="absolute gap-2 flex top-2 right-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEditRoom(room)}
                            className="rounded-full bg-white hover:bg-gray-100 text-gray-800 px-3 py-2"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => handleDeleteRoom(room)}
                            className="rounded-full bg-red-900 hover:bg-red-800 text-white px-3 py-2"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h1
                        className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-4`}
                      >
                        {room.isPrivate === false && room.bedName
                          ? `${room.bedName} - `
                          : ""}
                        {room.name}
                      </h1>

                      {room.isPrivate === true || room.isPrivate === null ? (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-gray-600">
                              <Bed className="w-5 h-5 mr-2" />
                              <span>
                                {room.beds} {isSpanish ? "camas" : "beds"}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="w-5 h-5 mr-2" />
                              <span>
                                {room.capacity}{" "}
                                {isSpanish ? "huéspedes" : "guests"}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mb-4">
                            <p className="text-2xl font-bold text-primary">
                              ${room.privateRoomPrice}{" "}
                              <span className="text-sm font-normal text-gray-600">
                                {" "}
                                {isSpanish ? "USD / noche" : "USD / night"}
                              </span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {isSpanish
                              ? `Tarifa de limpieza: ${room.privateRoomCleaning} USD`
                              : `Cleaning fee: ${room.privateRoomCleaning} USD`}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-gray-600">
                              {room.bedType === "double" ? (
                                <>
                                  <BedDouble size={16} color="#333" />
                                  &nbsp;
                                  <span>
                                    {isSpanish
                                      ? "1 cama doble"
                                      : "1 double bed"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <BedSingle size={16} color="#333" />
                                  <span>  {isSpanish
                                      ? "1 cama sencilla"
                                      : "1 simple bed"}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mb-4">
                            <p className="text-2xl font-bold text-primary">
                              ${room.sharedRoomPrice}{" "}
                              <span className="text-sm font-normal text-gray-600">
                                {" "}
                                {isSpanish ? "USD / noche" : "USD / night"}
                              </span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {isSpanish
                              ? `Tarifa de limpieza: ${room.sharedRoomCleaning} USD`
                              : `Cleaning fee: ${room.sharedRoomCleaning} USD`}
                          </p>
                        </>
                      )}

                      {isOwner && (
                        <div className="absolute bottom-4 right-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleCalendarRoom(room)}
                            className="rounded-full bg-green-900 hover:bg-black text-white px-4 py-2 mt-2 right-0"
                          >
                            <Calendar className="h-4 w-4" />
                            {isSpanish ? "Calendario" : "Calendar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !isOwner ? (
              <div className="max-w-xl mx-auto py-16 px-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Home className="h-8 w-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {isSpanish
                      ? "Sin espacios disponibles"
                      : "No spaces available"}
                  </h2>
                  <p className="text-gray-600">
                    <span>
                      {isSpanish
                        ? "El usuario aún no cargó ningún espacio para alquilar"
                        : "The user has not added any space for rent yet"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto py-16 px-4">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {isSpanish
                        ? "Sin espacios disponibles"
                        : "No spaces available"}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      <span>
                        {isSpanish
                          ? "Para que tu residencia de recuperación sea visible, necesitas registrar al menos un espacio de alojamiento."
                          : "For your recovery residence to be visible, you need to register at least one accommodation space."}
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          <span>
                            {isSpanish ? " Habitación Privada" : "Private Room"}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isSpanish
                            ? "Espacio exclusivo. Se reserva la habitación completa."
                            : "Private space. The entire room is reserved."}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex items-start gap-3">
                      <Bed className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {isSpanish
                            ? "Cama en Habitación Compartida"
                            : "Bed in Shared Room"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span>
                            {isSpanish
                              ? "Se reserva 1 cama en un espacio compartido con otros pacientes."
                              : "1 bed is reserved in a shared space with other patients."}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50 text-left">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <p className="font-semibold mb-1">
                        {isSpanish ? "Importante:" : "Important:"}
                      </p>

                      <p className="text-sm">
                        {isSpanish ? (
                          <>
                            Si tu propiedad es un <strong>monoambiente</strong>{" "}
                            o <strong>apartastudio</strong>, debes cargar
                            igualmente la habitación o cama para que esté
                            visible para los visitantes.
                          </>
                        ) : (
                          <>
                            If your property is a{" "}
                            <strong>studio apartment</strong> or{" "}
                            <strong>single-room unit</strong>, you must still
                            register the room or bed so it is visible to
                            visitors.
                          </>
                        )}
                      </p>
                    </AlertDescription>
                  </Alert>

                  {isOwner && (
                    <div className="pt-2">
                      <Button
                        asChild
                        size="lg"
                        style={{ backgroundColor: "#39759E" }}
                        className="text-white hover:opacity-90 transition-opacity"
                      >
                        <Link
                          href={`/mi-panel/propiedades/${property.id}/room/crear`}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          <span>
                            {isSpanish
                              ? "Agregar Habitación o Cama"
                              : "Add Room or Bed"}
                          </span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


<Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            {updated === "property" ? (
              <>
                <DialogTitle className="text-xl">
                  {isSpanish
                    ? "🏡 ¡Propiedad cargada con éxito!"
                    : "🏡 Property successfully uploaded!"}
                </DialogTitle>
                <DialogDescription className="text-md">
                  {isSpanish
                    ? "Los moderadores de la plataforma revisarán tus documentos legales y fotos. Una vez aprobados, recibirás una notificación por email y tu propiedad quedará activa."
                    : "Platform moderators will review your legal documents and photos. Once approved, you will receive an email notification and your property will become active."}
                  <br />
                  <br />
                  {isSpanish
                    ? "Mientras tanto, puedes empezar a agregar las habitaciones o camas. ✨"
                    : "In the meantime, you can start adding the rooms or beds. ✨"}
                </DialogDescription>
              </>
            ) : updated === "room" ? (
              <>
                <DialogTitle className="text-xl">
                  {isSpanish
                    ? "🛏️ ¡Felicitaciones, puedes disfrutar del alojamiento!"
                    : "🛏️ You can now enjoy the accommodation!"}
                </DialogTitle>
                <DialogDescription className="text-md">
                  {isSpanish
                    ? "Puedes seguir agregando más habitaciones / camas o editar las que ya creaste."
                    : "You can continue adding more rooms / beds or edit the ones you have already created."}
                  <br />
                  <br />
                  📸 <strong>
                    {isSpanish ? "Importante" : "Important"}
                    :
                  </strong>{" "}
                  {isSpanish
                    ? "Si agregaste nuevas fotos, serán revisadas para asegurar que cumplan con las normas de la plataforma. Recibirás una notificación cuando sean aprobadas."
                    : "If you added new photos, they will be reviewed to ensure they comply with platform standards. You will receive a notification when they are approved."}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle className="text-xl">
                  {isSpanish
                    ? "🔔 Acción no reconocida"
                    : "🔔 Unrecognized Action"}
                </DialogTitle>
                <DialogDescription className="text-md">
                  {isSpanish
                    ? "Parece que ocurrió algo inesperado. Intenta nuevamente o contacta al soporte si el problema persiste."
                    : "It seems something unexpected happened. Please try again or contact support if the problem persists."}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <Button className="bg-[#39759E]" onClick={() => setShowModal(false)}>
            {isSpanish ? "Entendido" : "Got It"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Cannot Delete Dialog */}
      <CannotDeleteDialog
        isOpen={showCannotDeleteDialog}
        onClose={() => setShowCannotDeleteDialog(false)}
        type={cannotDeleteType}
        lang={lang}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        type={cannotDeleteType}
        onConfirm={
          cannotDeleteType === "property"
            ? confirmDeleteProperty
            : confirmDeleteRoom
        }
        lang={lang}
      />
    </div>
  );
}
