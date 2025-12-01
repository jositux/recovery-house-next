"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Bed, Users, Clock, Percent, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Camera } from 'lucide-react';
import { BookingWidget } from "@/components/ui/booking-widget-private";
//import BookingWidgetShared from "@/components/ui/booking-widget-shared"
import { BookingWidgetBed } from "@/components/ui/booking-widget-bed";
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
import { Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { fetchCurrentUser } from "@/services/BookingService";
import { fetchUserById } from "@/services/UserById";
import { useRouter } from "next/navigation";

import { fetchStayData, Stay } from "@/services/stayService";

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
  // Precios para habitación privada o cama
  privateRoomPrice: string;
  privateRoomCleaning: string;

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: string;
  sharedRoomCleaning: string;

  bedType: string;
  bedName: string;

  check_in_hour: string;
  check_out_hour: string;
  discount_percentage_medium_stay: string;
  discount_percentage_long_stay: string;
  prepayment_percentage: string;

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
  ownerId: string;
  guests: number;
  price: number;
  cleaning: number;
  room: string;
  singleBeds: number;
  doubleBeds: number;
  isPrivate: boolean;
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

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  price: number;
  cleaning: number;
  totalPrice: number;
  discountStayType: string,    
  discountPercentageStayApplied: number,
  discountStayAmount: number,
}

interface DiscountData {
  shortStayDiscounts: string[];
  mediumStayDiscounts: string[];
  longStayDiscounts: string[];
  defaultShortStayDiscount: string;
  defaultMediumStayDiscount: string;
  defaultLongStayDiscount: string;
  shortStayRange: { min: number; max: number | null };
  mediumStayRange: { min: number; max: number | null };
  longStayRange: { min: number; max: number | null };
}

export default function RoomPage() {
  const { id } = useParams();

  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  //const [user, setUser] = useState<User | null>(null);

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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  //const [ownerUser, setOwnerUser] = useState<User | null>(null);

  // Filter bookings to only include those with checkout dates in the future
  const filterCurrentBookings = (bookings: Booking[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    return bookings.filter((booking) => {
      const checkOutDate = new Date(booking.checkOut);
      return checkOutDate >= today;
    });
  };

  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setFilteredBookings(filterCurrentBookings(bookings));
  }, [bookings]);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        return;
      }

      const user = await fetchCurrentUser(accessToken);
      console.log(user);
      setCurrentUser(user);
    };

    fetchUser();

    
  }, []); // solo se ejecuta una vez al montar el componente



  const [discountData, setDiscountData] = useState<DiscountData | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token") ?? "";
    if (!accessToken) return;

    const loadData = async () => {
      try {
        const stays: Stay[] = await fetchStayData(accessToken);

        const shortStay = stays.find((s) => s.type === "corta");
        const mediumStay = stays.find((s) => s.type === "media");
        const longStay = stays.find((s) => s.type === "larga");

        setDiscountData({
          shortStayDiscounts: shortStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          mediumStayDiscounts: mediumStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          longStayDiscounts: longStay?.discounts.map((d) =>
            d.percentage.toString()
          ) ?? ["0"],
          defaultShortStayDiscount:
            shortStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultMediumStayDiscount:
            mediumStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultLongStayDiscount:
            longStay?.discounts[0]?.percentage.toString() ?? "0",
          shortStayRange: {
            min: shortStay?.minNights ?? 1,
            max: shortStay?.maxNights ?? 5,
          },
          mediumStayRange: {
            min: mediumStay?.minNights ?? 6,
            max: mediumStay?.maxNights ?? 9,
          },
          longStayRange: {
            min: longStay?.minNights ?? 10,
            max: longStay?.maxNights ?? null,
          },
        });
      } catch (err) {
        console.error("Error cargando descuentos:", err);
      }
    };

    loadData();
  }, []);

  // Handle reservation from the BookingWidgetPrivate
  const handleReservation = async (data: BookingData) => {
    if (!currentUser) {
      console.error("User not loaded");
      router.push("/login");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Missing token");
  
      // 🔹 obtengo al owner directamente
      const owner = await fetchUserById(accessToken, property?.userId ?? "");
  
      const formattedBookingData = {
        ...data,
        isPrivate: room?.isPrivate,
        patientId: currentUser.id,
        patientName: currentUser.first_name + " " + currentUser.last_name,
        ownerId: property?.userId,
        room: room?.id,
        roomName: room?.name,
        ownerName: owner.first_name + " - " + owner.last_name, // 👈 uso la variable, no el state
        propertyName: property?.name,
        description: room?.description,
      };
  
      localStorage.removeItem("bookingData");
      localStorage.setItem("bookingData", JSON.stringify(formattedBookingData));
  
      const formattedBooking = {
        isPrivate: room?.isPrivate,
        name: room?.name,
        description: room?.description,
        unit_amount: data.totalPrice,
      };
  
      localStorage.setItem("booking", JSON.stringify(formattedBooking));
  
      router.push("/confirm-pay");
    } catch (error) {
      console.error( "Error fetching usuario", error);
      setError("Error al buscar el usuario");
    }
  };
  

  // Handle reservation from the BookingWidgetPrivate
  /*
  const handleReservationShared = async (data: BookingData) => {
    // setBookingSharedData(data);

    if (!currentUser) {
      console.error("User not loaded");
      router.push("/login");
      return;
    }

    const formattedBookingData = {
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

    localStorage.removeItem("bookingData");

    localStorage.setItem("bookingData", JSON.stringify(formattedBookingData));

    const formattedBooking = {
      isPrivate: room?.isPrivate,
      name: room?.name,
      description: room?.description,
      unit_amount: data.totalPrice,
    };

    localStorage.setItem("booking", JSON.stringify(formattedBooking));

    router.push("/checkout");
  };
  */

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

        const today = new Date().toISOString().split("T")[0];

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
                "filter[checkOut][_gt]": today,
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

  type HtmlContentProps = {
    html?: string | null;
  };

  const HtmlContent = ({ html }: HtmlContentProps) => {
    if (!html || html.trim() === "") return null;

    return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  /*
  const getAvailableBeds = (
    room: Room,
    bookingsForRoom: Booking[]
  ): { availableSingleBeds: number; availableDoubleBeds: number } => {
    const reservedSingleBeds = bookingsForRoom.reduce(
      (sum, b) => sum + (b.singleBeds || 0),
      0
    );
    const reservedDoubleBeds = bookingsForRoom.reduce(
      (sum, b) => sum + (b.doubleBeds || 0),
      0
    );

    return {
      availableSingleBeds: room.singleBeds - reservedSingleBeds,
      availableDoubleBeds: room.doubleBeds - reservedDoubleBeds,
    };
  };*/

  /*const [availableBeds, setAvailableBeds] = useState<{
    availableSingleBeds: number;
    availableDoubleBeds: number;
  }>({
    availableSingleBeds: 0,
    availableDoubleBeds: 0,
  });

  useEffect(() => {
    if (room) {
      const bookingsForRoom = filteredBookings.filter(
        (b) => b.room === room.id
      );
      const { availableSingleBeds, availableDoubleBeds } = getAvailableBeds(
        room,
        bookingsForRoom
      );
      setAvailableBeds({ availableSingleBeds, availableDoubleBeds });
    }
  }, [room, filteredBookings]); // Recalcular cuando room o bookings cambien*/

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


  function formatTimeToAMPM(time: string): string {
    console.log(time)
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convierte 0 => 12
    return `${hour}:${minute} ${ampm}`;
  }

  function formatDiscount(discount: string): string {
    const num = parseFloat(discount);
    if (isNaN(num) || num === 0) {
      return "Sin descuento";
    }
    return `${Math.round(num)}%`;
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
                {room.isPrivate === false && room.bedName?.trim()
                  ? `${room.bedName} - `
                  : ""}
                {room.name}
              </h1>
              <p className="text-xl text-[#162F40] mb-4"> {property.name}</p>
              {room.isPrivate === true && (
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
                      Capacidad: {room.capacity}{" "}
                      {room.capacity === 1 ? "persona" : "personas"}
                    </span>
                  </div>
                </div>
              )}

              {room.isPrivate === false && (
                <div className="flex items-center mt-4 space-x-4 text-[#162F40]">
                  {room.bedType === "double" ? (
                    <div className="flex items-center">
                      <BedDouble className="w-5 h-5 mr-2" />
                      <span>1 cama doble</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <BedSingle className="w-5 h-5 mr-2" />
                      <span>1 cama sencilla</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {room.isPrivate === false && (
              <Alert className="border-blue-200 bg-white/50 backdrop-blur-sm mb-6">
                <AlertDescription className="text-gray-700 font-medium">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        NOTA:
                      </h3>
                      <p className="text-sm leading-relaxed">
                        Esta cama se alquila de manera individual, lo que
                        significa que reservás un lugar dentro de una habitación
                        compartida. Esta modalidad es ideal para quienes buscan
                        una opción económica y están abiertos a compartir el
                        espacio con otras personas.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Description */}
            <div className="mb-8">
              <p className="text-[#162F40]">
                <HtmlContent html={room.description} />
              </p>
            </div>

            <div className="grid gap-6 mt-6 mb-12">
              {/* Check-in/Check-out Times */}
              <Card className="w-full max-w-3xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Políticas del hospedaje
                  </CardTitle>
                  <p className="text-slate-600 mt-2">
                    Información importante sobre horarios, descuentos y pagos
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Check-in/Check-out Section */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Horario de Entrada
                        </h3>
                        <p className="text-lg font-bold text-blue-600">
                          {formatTimeToAMPM(room.check_in_hour ?? "00:00:00")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Horario de Salida
                        </h3>
                        <p className="text-lg font-bold text-orange-600">
                          {formatTimeToAMPM(room.check_out_hour ?? "00:00:00")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Discounts Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <Percent className="h-5 w-5 mr-2 text-green-600" />
                      Descuentos por Estadía
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">
                            Estadía Media
                          </span>
                          <span className="text-xl font-bold text-green-600">
                           
                          {formatDiscount(room.discount_percentage_medium_stay ?? "0")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                        {discountData?.mediumStayRange.min} - {discountData?.mediumStayRange.max} noches
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">
                            Estadía Larga
                          </span>
                          <span className="text-xl font-bold text-emerald-600">
                          {formatDiscount(room.discount_percentage_long_stay ?? "0")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {discountData?.longStayRange.min}+ noches
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prepayment Section */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">
                          Adelanto de Pago
                        </h3>
                        <p className="text-slate-600">
                          Puedes hacer un adelanto del{" "}
                          <span className="font-bold text-purple-600">
                          {formatDiscount(room.prepayment_percentage ?? "10")}
                          </span>{" "}
                          del total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      Las políticas se aplican solamente a este hospedaje
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Widget for mobile */}
            <div className="mb-4 lg:hidden">
              {" "}
              {/* Modified margin */}
              {room.isPrivate === false ? (
                // Si es exactamente false, muestro la versión compartida
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay= {Number.parseInt(room.discount_percentage_medium_stay ?? "0")}
                  discount_percentage_long_stay= {Number.parseInt(room.discount_percentage_long_stay ?? "0")}
                  prepayment_percentage= {Number.parseInt(room.prepayment_percentage ?? "10")}
                  minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange= {discountData?.longStayRange.min ?? 10}
                  maxLongStayRange= {discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onReservation={handleReservation}
                />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                <BookingWidget
                  price={Number.parseInt(room.privateRoomPrice, 10)}
                  cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                  maxGuests={room.capacity}

                  discount_percentage_medium_stay= {Number.parseInt(formatDiscount(room.discount_percentage_medium_stay ?? "0"))}
                  discount_percentage_long_stay= {Number.parseInt(formatDiscount(room.discount_percentage_long_stay ?? "0"))}
                  prepayment_percentage= {Number.parseInt(formatDiscount(room.prepayment_percentage ?? "10"))}
                  minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange= {discountData?.longStayRange.min ?? 10}
                  maxLongStayRange= {discountData?.longStayRange.max ?? 10000}

                  disableDates={room.disableDates}
                  bookings={filteredBookings}
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
                lang="es"
              />
            </div>

            {/* Description */}
            {room.descriptionService && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Más acerca de los servicios:
                </h3>
                {room.descriptionService}
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
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay= {Number.parseInt(room.discount_percentage_medium_stay ?? "0")}
                  discount_percentage_long_stay= {Number.parseInt(room.discount_percentage_long_stay ?? "0")}
                  prepayment_percentage= {Number.parseInt(room.prepayment_percentage ?? "10")}
                  minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange= {discountData?.longStayRange.min ?? 10}
                  maxLongStayRange= {discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onReservation={handleReservation}
                />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                 <BookingWidget
                  price={Number.parseInt(room.privateRoomPrice, 10)}
                  cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                  maxGuests={room.capacity}

                  discount_percentage_medium_stay= {Number.parseInt(room.discount_percentage_medium_stay ?? "0")}
                  discount_percentage_long_stay= {Number.parseInt(room.discount_percentage_long_stay ?? "0")}
                  prepayment_percentage= {Number.parseInt(room.prepayment_percentage ?? "10")}
                  minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange= {discountData?.longStayRange.min ?? 10}
                  maxLongStayRange= {discountData?.longStayRange.max ?? 10000}
                  
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
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
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay= {Number.parseInt(room.discount_percentage_medium_stay ?? "0")}
                  discount_percentage_long_stay= {Number.parseInt(room.discount_percentage_long_stay ?? "0")}
                  prepayment_percentage= {Number.parseInt(room.prepayment_percentage ?? "10")}
                  minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange= {discountData?.longStayRange.min ?? 10}
                  maxLongStayRange= {discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onReservation={handleReservation}
                />
              ) : (
                // En cualquier otro caso (true, null, undefined, etc.), muestro la versión privada
                <BookingWidget
                price={Number.parseInt(room.privateRoomPrice, 10)}
                cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                maxGuests={room.capacity}

                discount_percentage_medium_stay= {Number.parseInt(room.discount_percentage_medium_stay ?? "0")}
                discount_percentage_long_stay= {Number.parseInt(room.discount_percentage_long_stay ?? "0")}
                prepayment_percentage= {Number.parseInt(room.prepayment_percentage ?? "10")}
                minMediumStayRange= {discountData?.mediumStayRange.min ?? 6}
                maxMediumStayRange= {discountData?.mediumStayRange.max ?? 9}
                minLongStayRange= {discountData?.longStayRange.min ?? 10}
                maxLongStayRange= {discountData?.longStayRange.max ?? 10000}
                
                disableDates={room.disableDates}
                bookings={filteredBookings}
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
