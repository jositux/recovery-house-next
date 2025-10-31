"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { BookingWidget } from "@/components/ui/booking-widget-private";
import { BookingWidgetBed } from "@/components/ui/booking-widget-bed";
import { getExtraTags } from "@/services/extraTagsService";
import useTags from "@/hooks/useExtraTags";
import { fetchCurrentUser } from "@/services/BookingService";
import { fetchUserById } from "@/services/UserById";
import { fetchStayData, type Stay } from "@/services/stayService";

import { RoomHero } from "./components/room-hero";
import { RoomHeader } from "./components/room-header";
import { SharedBedAlert } from "./components/shared-bed-alert";
import { RoomDescription } from "./components/room-description";
import { PoliciesCard } from "./components/policies-card";
import { PolicyDialogButtons } from "./components/policy-dialog-buttons";
import { HostInfoSection } from "./components/host-info-section";
import { LocationSection } from "./components/location-section";
import { ServiceProvidersSection } from "./components/service-providers-section";
import { HostProfile } from "@/components/rating/HostProfile";
import { ReviewsModal } from "@/components/rating/ReviewsModal";
import { Button } from "@/components/ui/button";

import { Fraunces } from "next/font/google";
import { CollectionExtraTags } from "@/components/collectionExtraTagsRoom";

const fraunces = Fraunces({ subsets: ["latin"] });

interface Ranking {
  limpieza: number;
  atención: number;
  comodidad: number;
}

interface ReviewReply {
  id: string;
  userCreated: string;
  dateCreated: string;
  userUpdated: string | null;
  dateUpdated: string | null;
  reviewId: string;
  ownerId: string;
  reply: string;
}

interface Review {
  id: string;
  bookingId: string;
  roomId: string;
  name: string;
  comment: string;
  ranking: Ranking;
  status: string;
  dateCreated: string;
  review_replies: ReviewReply[];
}

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
  capacity: number;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  privateRoomPrice: string;
  privateRoomCleaning: string;
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
  bookingState: string;
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
  discountStayType: string;
  discountPercentageStayApplied: number;
  discountStayAmount: number;
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

const calculateAverage = (ranking: Ranking): number => {
  const values = Object.values(ranking).filter((rating) => rating > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, rating) => sum + rating, 0) / values.length;
};

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [discountData, setDiscountData] = useState<DiscountData | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [imagesSwiper, setImagesSwiper] = useState<
    { src: string; alt: string }[]
  >([]);

  const { extraTags } = useTags("extraTags", getExtraTags);

  const [reviews, setReviews] = useState<Review[]>([]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + calculateAverage(review.ranking),
          0
        ) / reviews.length
      : 0;

  const totalReviews = reviews.length;
  const hostExperience = "4 meses de experiencia como anfitrión";

  const filterCurrentBookings = (bookings: Booking[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const checkOutDate = new Date(booking.checkOut);
      return (
        checkOutDate >= today &&
        booking.bookingState !== "cancelled_by_patient" &&
        booking.bookingState !== "cancelled_by_owner"
      );
    });
  };

  useEffect(() => {
    setFilteredBookings(filterCurrentBookings(bookings));
  }, [bookings]);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const user = await fetchCurrentUser(accessToken);
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

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

  const getCurrentIsoTime = () =>
    new Date().toISOString().split("T")[1].split(".")[0] + "Z";

  const handleReservation = async (data: BookingData) => {
    if (!currentUser) {
      console.error("User not loaded");
      router.push("/login");
      return;
    }

    const checkInDate = new Date(data.checkIn);
    const currentDate = new Date();
    const diffTime = checkInDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      // If check-in is less than 3 days away, go directly to checkout
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) throw new Error("Missing token");

        const owner = await fetchUserById(accessToken, property?.userId ?? "");

        localStorage.removeItem("bookingData");
        // localStorage.setItem("bookingData", JSON.stringify(formattedBookingData))

        const formattedBooking = {
          isPrivate: room?.isPrivate,
          name: room?.name,
          description: room?.description,
          unit_amount: data.totalPrice,

          room: room?.id,
          patient: currentUser.id,
          patientName: currentUser.first_name + " " + currentUser.last_name,
          ownerId: property?.userId,
          guests: data?.guests,
          roomName: room?.name,
          ownerName: owner.first_name + " - " + owner.last_name,
          propertyName: property?.name,
          photo: room?.photos[0].directus_files_id.id,
          checkInDateHour: data?.checkIn + "T" + getCurrentIsoTime(),
          checkOutDateHour: data?.checkOut + "T" + getCurrentIsoTime(),
          price: data?.price,
          cleaning: data?.cleaning,
          discountStayType: "short",
          discountPercentageStayApplied: data?.discountPercentageStayApplied,
          discountStayAmount: data?.discountStayAmount,
          prepaymentPercentage: 10,
          paymentAmount: data?.totalPrice,
          paymentBalance: 0,
          paymentType: "fullpayment",
          finalPrice: data?.totalPrice,
        };

        localStorage.setItem("booking", JSON.stringify(formattedBooking));

        // Redirect directly to checkout for urgent bookings
        router.push(`/checkout`);
        return;
      } catch (error) {
        console.error("Error fetching usuario", error);
        setError("Error al buscar el usuario");
        return;
      }
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Missing token");

      const owner = await fetchUserById(accessToken, property?.userId ?? "");

      const formattedBookingData = {
        ...data,
        checkInHour: room?.check_in_hour,
        isPrivate: room?.isPrivate,
        patientId: currentUser.id,
        patientName: currentUser.first_name + " " + currentUser.last_name,
        ownerId: property?.userId,
        room: room?.id,
        roomName: room?.name,
        ownerName: owner.first_name + " - " + owner.last_name,
        propertyName: property?.name,
        description: room?.description,
        photo: room?.photos[0].directus_files_id.id,
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

      router.push(`/confirm-pay?rel=${room?.id}`);
    } catch (error) {
      console.error("Error fetching usuario", error);
      setError("Error al buscar el usuario");
    }
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
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

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.warn("No access token found, skipping reviews fetch");
        return;
      }

      try {
        const response = await axios.get("/webapi/items/Reviews", {
          params: {
            "filter[roomId][_eq]": id,
            "sort[]": "-dateCreated",
            fields: "*,review_replies.*",
            "deep[review_replies][sort]": "-dateCreated",
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setReviews(response.data.data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  const getImageSrc = useCallback((image?: ImageRoom) => {
    if (!image || !image.directus_files_id) {
      return "/assets/empty.jpg";
    }

    return image.directus_files_id.isModerated
      ? "/assets/empty.jpg"
      : `/webapi/assets/${image.directus_files_id.id}?key=full`;
  }, []);

  useEffect(() => {
    if (room && room.photos) {
      const swiperImages = room.photos.map((photo) => ({
        src: getImageSrc(photo),
        alt: "Imagen de Habitación",
      }));

      setImagesSwiper(swiperImages);
    }
  }, [room, getImageSrc]);

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
      <RoomHero
        imageSrc={getImageSrc(room.photos[0]) || "/assets/empty.jpg"}
        propertyName={property.name}
        images={imagesSwiper}
      />

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <RoomHeader
              roomName={room.name}
              propertyName={property.name}
              isPrivate={room.isPrivate}
              bedName={room.bedName}
              beds={room.beds}
              capacity={room.capacity}
              bedType={room.bedType}
            />

            {room.isPrivate === false && <SharedBedAlert />}

            <RoomDescription description={room.description} />

            <div className="grid gap-6 mt-6 mb-12">
              <PoliciesCard
                checkInHour={room.check_in_hour ?? "00:00:00"}
                checkOutHour={room.check_out_hour ?? "00:00:00"}
                mediumStayDiscount={room.discount_percentage_medium_stay ?? "0"}
                longStayDiscount={room.discount_percentage_long_stay ?? "0"}
                prepaymentPercentage={room.prepayment_percentage ?? "10"}
                mediumStayRange={
                  discountData?.mediumStayRange ?? { min: 6, max: 9 }
                }
                longStayRange={
                  discountData?.longStayRange ?? { min: 10, max: null }
                }
              />
            </div>

            <PolicyDialogButtons />

            {/* Booking Widget for mobile */}
            <div className="mb-4 lg:hidden">
              {room.isPrivate === false ? (
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onReservation={handleReservation}
                />
              ) : (
                <BookingWidget
                  price={Number.parseInt(room.privateRoomPrice, 10)}
                  cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                  maxGuests={room.capacity}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
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
              />
            </div>

            <HostInfoSection
              hostName={property.hostName}
              guestComments={property.guestComments}
            />

            <LocationSection
              latitude={property.place.coordinates[0]}
              longitude={property.place.coordinates[1]}
            />

            <ServiceProvidersSection
              serviceProviders={serviceProviders}
              propertyState={property.state}
              propertyCountry={property.country}
            />

            {/* User Profile Section */}
            <div className="min-h-screen bg-background py-8">
              <div className="">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[#162F40]">
                    Evaluaciones
                  </h2>
                  <p className="text-muted-foreground">
                    Conoce lo que dicen nuestros huéspedes
                  </p>
                </div>

                <HostProfile
                  hostName={property.hostName}
                  hostExperience={hostExperience}
                  averageRating={Number(averageRating.toFixed(1))}
                  totalReviews={totalReviews}
                />

{typeof totalReviews === "number" && totalReviews > 0 && (
  <div className="text-center">
    <Button
      onClick={() => setShowReviews(true)}
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium rounded-lg"
    >
      Ver todas las evaluaciones ({totalReviews})
    </Button>
  </div>
)}

                <ReviewsModal
                  isOpen={showReviews}
                  onClose={() => setShowReviews(false)}
                  reviews={reviews}
                  averageRating={Number(averageRating.toFixed(1))}
                  totalReviews={totalReviews}
                />
              </div>
            </div>
          </div>

          {/* Booking Widget for desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              {room.isPrivate === false ? (
                <BookingWidgetBed
                  price={Number.parseInt(room.sharedRoomPrice, 10)}
                  cleaning={Number.parseInt(room.sharedRoomCleaning, 10)}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
                  disableDates={room.disableDates}
                  bookings={filteredBookings}
                  onReservation={handleReservation}
                />
              ) : (
                <BookingWidget
                  price={Number.parseInt(room.privateRoomPrice, 10)}
                  cleaning={Number.parseInt(room.privateRoomCleaning, 10)}
                  maxGuests={room.capacity}
                  discount_percentage_medium_stay={Number.parseInt(
                    room.discount_percentage_medium_stay ?? "0"
                  )}
                  discount_percentage_long_stay={Number.parseInt(
                    room.discount_percentage_long_stay ?? "0"
                  )}
                  prepayment_percentage={Number.parseInt(
                    room.prepayment_percentage ?? "10"
                  )}
                  minMediumStayRange={discountData?.mediumStayRange.min ?? 6}
                  maxMediumStayRange={discountData?.mediumStayRange.max ?? 9}
                  minLongStayRange={discountData?.longStayRange.min ?? 10}
                  maxLongStayRange={discountData?.longStayRange.max ?? 10000}
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
