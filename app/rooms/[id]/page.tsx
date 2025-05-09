"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Bed, Users } from "lucide-react";
//import { Camera } from "lucide-react";
import { BookingWidget } from "@/components/ui/booking-widget-private";
import BookingWidgetShared from "@/components/ui/booking-widget-shared";
import { ServiceProviderCard } from "@/components/ui/service-provider-card";
import { GoogleMap } from "@/components/ui/google-map";
import { Fraunces } from "next/font/google";
//import { PhotoGallery } from "@/components/ui/photo-gallery";
import { getExtraTags } from "@/services/extraTagsService";
import useTags from "@/hooks/useExtraTags";
import { CollectionExtraTags } from "@/components/collectionExtraTagsRoom";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { PopupSwiperGallery } from "./popup-swiper-gallery";
import { BedSingle, BedDouble } from "lucide-react";

import { fetchCurrentUser } from "@/services/BookingService";
import { useRouter } from "next/navigation";

//import { useCheckOwnership } from "@/hooks/isOwner";

const fraunces = Fraunces({ subsets: ["latin"] });

interface RoomTag {
  id: string;
  Room_id: string;
  ExtraTags_id: string;
}

type ImageRoom = {
  directus_files_id: {
    id: string;
    isModerated: boolean;
  };
};

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: string;
  cleaningFee: string;
  beds: number;
  capacity: number; // Added capacity field
  isPrivate: boolean;
  // Configuración de camas
  singleBeds: number;
  doubleBeds: number;
  // Precios para habitación compartida
  singleBedPrice: number;
  singleBedCleaningPrice: number;
  doubleBedPrice: number;
  doubleBedCleaningPrice: number;
  photos: ImageRoom[];
  extraTags: RoomTag[];
  servicesTags: { serviceTags_id: string }[];
  descriptionService: string;
  Property_id: string;
  disableDates: string;
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
  userId: string;
  hostName: string;
  guestComments: string;
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
  singleBeds: number;
  doubleBeds: number;
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

interface BookingPrivateData {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  price: number;
  cleaning: number;
  totalPrice: number;
}

interface BookingSharedData {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  singleBeds: number;
  doubleBeds: number;
  singleBedPrice: number;
  doubleBedPrice: number;
  singleBedCleaningPrice: number;
  doubleBedCleaningPrice: number;
  totalPrice: number;
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
  //const [photoIds, setPhotoIds] = useState<string[]>([]);
  //const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { extraTags } = useTags("extraTags", getExtraTags);

  /*const [bookingPrivateData, setBookingPrivateData] =
    useState<BookingPrivateData | null>(null);

  const [bookingSharedData, setBookingSharedData] =
    useState<BookingSharedData | null>(null);*/

  const router = useRouter();

  interface User {
    id: string;
    first_name: string;
    last_name: string;
  }

  const [currentUser, setCurrentUser] = useState<User| null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        return;
      }

      const user = await fetchCurrentUser(accessToken);
      console.log(user)
      setCurrentUser(user);
    };

    fetchUser();
  }, []); // solo se ejecuta una vez al montar el componente

  // Handle reservation from the BookingWidgetPrivate
  const handleReservation = async (data: BookingPrivateData) => {
   // setBookingPrivateData(data);
   

    if (!currentUser) {
      console.error("User not loaded");
      router.push("/login");
      return;
    }

    const formattedPrivateBooking = {
      ...data,
      isPrivate: room?.isPrivate,
      patientId: currentUser.id,
      room: room?.id,
      roomName: room?.name,
      ownerId: property?.id,
      ownerName: property?.name,
      propertyName: property?.name,
      description: room?.description,
    };

    localStorage.setItem(
      "bookingPrivateData",
      JSON.stringify(formattedPrivateBooking)
    );

    localStorage.removeItem('bookingSharedData');

    const formattedBooking = {
      isPrivate: room?.isPrivate,
      name: room?.name,
      description: room?.description,
      unit_amount: data.totalPrice
    };

    localStorage.setItem(
      "booking",
      JSON.stringify(formattedBooking)
    );

    router.push("/checkout");
  };

  // Handle reservation from the BookingWidgetPrivate
  const handleReservationShared = async (data: BookingSharedData) => {
   // setBookingSharedData(data);

    if (!currentUser) {
      console.error("User not loaded");
      router.push("/login");
      return;
    }

    const formattedSharedBooking = {
      ...data,
      isPrivate: room?.isPrivate,
      patientId: currentUser.id,
      room: room?.id,
      roomName: room?.name,
      ownerId: property?.id,
      ownerName: property?.name,
      propertyName: property?.name,
      description: room?.description,
    };

    localStorage.setItem(
      "bookingSharedData",
      JSON.stringify(formattedSharedBooking)
    );

    localStorage.removeItem('bookingPrivateData');

    const formattedBooking = {
      isPrivate: room?.isPrivate,
      name: room?.name,
      description: room?.description,
      unit_amount: data.totalPrice
    };

    localStorage.setItem(
      "booking",
      JSON.stringify(formattedBooking)
    );

    router.push("/checkout");

  };

  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Primero obtenemos los datos de la habitación
        const roomResponse = await axios.get("/webapi/items/Room", {
          params: {
            fields:
              "*,photos.directus_files_id.id,photos.directus_files_id.isModerated,extraTags.*,servicesTags.*,propertyId",
            "filter[id][_eq]": id,
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });

        const roomData = roomResponse.data.data?.[0];

        
        if (!roomData) {
          setError("Habitación no encontrada");
          return;
        }

        // Usamos el Property_id de la habitación para obtener la propiedad específica
        const [propertyResponse, bookingsResponse, providerResponse] =
          await Promise.all([
            axios.get("/webapi/items/Property", {
              params: {
                fields: "*",
                "filter[id][_eq]": roomData.propertyId,
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

        const propertyData = propertyResponse.data.data?.[0];
        if (!propertyData) {
          setError("Propiedad no encontrada");
          return;
        }

        setRoom(roomData);
        setProperty(propertyData);
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

  //const { isOwner } = useCheckOwnership(String(property?.id));

  const getImageSrc = useCallback((image: ImageRoom) => {
    return image.directus_files_id.isModerated
      ? "/assets/empty.jpg"
      : `/webapi/assets/${image.directus_files_id.id}?key=full`;
  }, []);

  /*useEffect(() => {
    if (room && room.photos) {
      setPhotoIds(room.photos.map((photo) => getImageSrc(photo)));
    }
  }, [room, getImageSrc]);*/

  const [imagesSwiper, setImagesSwiper] = useState<
    { src: string; alt: string }[]
  >([]);

  // Modificar el useEffect para transformar las fotos al formato requerido
  useEffect(() => {
    if (room && room.photos) {
      // Transformar el array de fotos al formato que espera el componente Swiper
      const swiperImages = room.photos.map((photo) => ({
        src: getImageSrc(photo),
        alt: "Imagen de Habitación",
      }));

      setImagesSwiper(swiperImages);

      // Mantener también el array original de URLs si lo necesitas para otros componentes
      //setPhotoIds(room.photos.map((photo) => getImageSrc(photo)));
    }
  }, [room, getImageSrc]);

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "");
    const txt = document.createElement("textarea");
    txt.innerHTML = textWithoutTags;
    return txt.value;
  };


  const getAvailableBeds = (
    room: Room,
    bookingsForRoom: Booking[]
  ): { availableSingleBeds: number; availableDoubleBeds: number } => {
    const reservedSingleBeds = bookingsForRoom.reduce((sum, b) => sum + (b.singleBeds || 0), 0);
    const reservedDoubleBeds = bookingsForRoom.reduce((sum, b) => sum + (b.doubleBeds || 0), 0);
  
    return {
      availableSingleBeds: room.singleBeds - reservedSingleBeds,
      availableDoubleBeds: room.doubleBeds - reservedDoubleBeds,
    };
  };

  const [availableBeds, setAvailableBeds] = useState<{ availableSingleBeds: number; availableDoubleBeds: number }>({
    availableSingleBeds: 0,
    availableDoubleBeds: 0
  });

  useEffect(() => {
    if (room) {
      const bookingsForRoom = bookings.filter(b => b.room === room.id);
      const { availableSingleBeds, availableDoubleBeds } = getAvailableBeds(room, bookingsForRoom);
      setAvailableBeds({ availableSingleBeds, availableDoubleBeds });
    }
  }, [room, bookings]);  // Recalcular cuando room o bookings cambien



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
          src={getImageSrc(room.photos[0]) || "/assets/empty.jpg"}
          alt={property.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="container mx-auto px-4 lg:px-20">
            <MagicBackButton />
          </div>
        </div>
      </div>

      {/*photoIds.length > 1 && (
        <div className="container relative mx-auto px-4 lg:px-20">
          <button
            className="absolute left-20 bottom-8 bg-white px-4 py-2 rounded-md text-[#162F40] flex items-center gap-2"
            onClick={() => setIsGalleryOpen(true)}
          >
            <Camera className="w-5 h-5" />
            Ver todas las fotos
          </button>
        </div>
      )*/}

      {/* Photo Gallery

      <PhotoGallery
        photos={photoIds}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      /> */}

      {imagesSwiper.length > 1 && (
        <div className="container relative mx-auto px-4 lg:px-20">
          <div className="absolute left-20 bottom-8">
            <PopupSwiperGallery
              images={imagesSwiper}
              buttonText="Ver todas las fotos"
              autoplay={true}
            />
          </div>
        </div>
      )}

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
              <div className="flex items-center space-x-4 text-[#162F40]">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>
                    {room.beds}{" "}
                    {room.beds === 1 ? "cama en total" : "camas en total"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>
                    Capacidad: {room.capacity} {room.isPrivate}
                    {room.capacity === 1 ? "persona" : "personas"}
                  </span>
                </div>
              </div>

              {room.isPrivate === false && (
  <div className="flex items-center mt-4 space-x-4 text-[#162F40]">
    {room.singleBeds > 0 && (
      <div className="flex items-center">
        <BedSingle className="w-5 h-5 mr-2" />
        <span>
          {room.singleBeds} cama{room.singleBeds > 1 ? "s" : ""} simple{room.singleBeds > 1 ? "s" : ""}{" "}
          ({availableBeds?.availableSingleBeds ?? 0} disponible
          {availableBeds?.availableSingleBeds === 1 ? "" : "s"})
        </span>
      </div>
    )}

    {room.doubleBeds > 0 && (
      <div className="flex items-center">
        <BedDouble className="w-5 h-5 mr-2" />
        <span>
          {room.doubleBeds} cama{room.doubleBeds > 1 ? "s" : ""} doble{room.doubleBeds > 1 ? "s" : ""}{" "}
          ({availableBeds?.availableDoubleBeds ?? 0} disponible
          {availableBeds?.availableDoubleBeds === 1 ? "" : "s"})
        </span>
      </div>
    )}
  </div>
)}

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
              {room.isPrivate === false ? (
                // Si es exactamente false, muestro la versión compartida
                <BookingWidgetShared
                  singleBedPrice={room.singleBedPrice}
                  singleBedCleaningPrice={room.singleBedCleaningPrice}
                  doubleBedPrice={room.doubleBedPrice}
                  doubleBedCleaningPrice={room.doubleBedCleaningPrice}
                  bookings={bookings}
                  availableSingleBeds={availableBeds.availableSingleBeds}
                  availableDoubleBeds={availableBeds.availableDoubleBeds}
                  disableDates={room.disableDates}
                  onReservation={handleReservationShared}
                />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                <BookingWidget
                  price={parseInt(room.pricePerNight, 10)}
                  cleaning={parseInt(room.cleaningFee, 10)}
                  maxGuests={room.capacity}
                  disableDates={room.disableDates}
                  bookings={bookings}
                  onReservation={handleReservation}
                />
              )}
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2
                className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}
              >
                Amenidades / Servicios
              </h2>

              <CollectionExtraTags
                extraTags={extraTags}
                enable="property"
                roomTags={room.extraTags}
              />
            </div>

            {/* Description */}
            {room.descriptionService && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Más acerca de los servicios:
                </h3>
                <p className="text-[#162F40]">
                  {decodeHtmlAndRemoveTags(room.descriptionService)}
                </p>
              </div>
            )}

            {/* Sección de Anfitrión */}
            {property.hostName && (
              <div className="mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {property.hostName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Anfitrión:
                    </h3>
                    <p className="text-gray-700">{property.hostName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Comentarios */}
            {property.guestComments && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comentarios para el huésped:
                </h3>
                <p className="text-gray-700">{property.guestComments}</p>
              </div>
            )}

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
                <button className="hidden text-[#39759E]">Filtrar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const stateProviders = serviceProviders.filter(
                    (provider) => provider.state === property.state
                  );

                  const providersToShow =
                    stateProviders.length > 0
                      ? stateProviders
                      : serviceProviders.filter(
                          (provider) => provider.country === property.country
                        );

                  return providersToShow.map((provider) => (
                    <ServiceProviderCard
                      key={provider.id}
                      name={provider.name}
                      service={provider.description}
                      treatment={provider.serviceTags.join(", ")}
                      description={provider.description}
                      phone={provider.phone}
                      email={provider.email}
                    />
                  ));
                })()}
              </div>
            </div>

            {/* Booking Widget for mobile (at the bottom) */}
            <div className="mt-8 hidden lg:hidden">
              {room.isPrivate === false ? (
                // Si es exactamente false, muestro la versión compartida
                <BookingWidgetShared
                  singleBedPrice={room.singleBedPrice}
                  singleBedCleaningPrice={room.singleBedCleaningPrice}
                  doubleBedPrice={room.doubleBedPrice}
                  doubleBedCleaningPrice={room.doubleBedCleaningPrice}
                  bookings={bookings}
                  availableSingleBeds={availableBeds.availableSingleBeds}
                  availableDoubleBeds={availableBeds.availableDoubleBeds}
                  disableDates={room.disableDates}
                  onReservation={handleReservationShared}
                />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                <BookingWidget
                  price={parseInt(room.pricePerNight, 10)}
                  cleaning={parseInt(room.cleaningFee, 10)}
                  maxGuests={room.capacity}
                  disableDates={room.disableDates}
                  bookings={bookings}
                  onReservation={handleReservation}
                />
              )}
            </div>
          </div>

          {/* Booking Widget for desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              {room.isPrivate === false ? (
                // Si es exactamente false, muestro la versión compartida
                <BookingWidgetShared
                singleBedPrice={room.singleBedPrice}
                singleBedCleaningPrice={room.singleBedCleaningPrice}
                doubleBedPrice={room.doubleBedPrice}
                doubleBedCleaningPrice={room.doubleBedCleaningPrice}
                bookings={bookings}
                availableSingleBeds={availableBeds.availableSingleBeds}
                availableDoubleBeds={availableBeds.availableDoubleBeds}
                disableDates={room.disableDates}
                onReservation={handleReservationShared}
              />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                <BookingWidget
                  price={parseInt(room.pricePerNight, 10)}
                  cleaning={parseInt(room.cleaningFee, 10)}
                  maxGuests={room.capacity}
                  disableDates={room.disableDates}
                  bookings={bookings}
                  onReservation={handleReservation}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
