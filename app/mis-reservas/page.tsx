"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/userService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import ReviewModal from "@/components/ReviewModal";

interface Booking {
  id: string;
  status: string;
  checkOut: string;
  checkIn: string;
  patient: string;
  price: string;
  cleaning: string;
  room: string;
  guests: number;
}

interface Room {
  id: string;
  name: string;
  roomNumber: string;
  beds: number;
  capacity: number;
  description: string;
  mainImage: string;
  propertyId: string;
  cleaningFee: string;
  pricePerNight: string;
}

interface Property {
  id: string;
  name: string;
  Rooms: Room[];
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const user = await getCurrentUser(token);

        console.log(user);

        // Fetch bookings
        const bookingsResponse = await fetch(
          `/webapi/items/Booking?filter[patient][_eq]=${user.id}&fields=*`
        );
        const bookingsData = await bookingsResponse.json();

        // Fetch properties with rooms
        const propertiesResponse = await fetch(
          `/webapi/items/Property?&fields=*,+Rooms.*`
        );
        const propertiesData = await propertiesResponse.json();

        setBookings(bookingsData.data);
        setProperties(propertiesData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Error al cargar las reservas. Por favor, intente de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const findRoomAndPropertyDetails = (
    roomId: string
  ): { room: Room | undefined; property: Property | undefined } => {
    for (const property of properties) {
      const room = property.Rooms.find((room) => room.id === roomId);
      if (room) return { room, property };
    }
    return { room: undefined, property: undefined };
  };

  const handleReviewClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (selectedBookingId) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const response = await fetch("/webapi/items/Review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: selectedBookingId,
            rating,
            comment,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        // Optionally, you can update the local state or refetch the bookings
        console.log("Review submitted successfully");
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Cargando reservas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mis Reservas</h1>
      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">
          No tienes reservas actualmente.
        </p>
      ) : (
        <ul className="space-y-6">
          {bookings.map((booking) => {
            const { room: roomDetails, property } = findRoomAndPropertyDetails(
              booking.room
            );
            return (
              <li key={booking.id}>
                <Card className="overflow-hidden shadow-lg rounded-lg">
  <div className="flex flex-col md:flex-row">
  <div className="relative w-full md:w-1/3 aspect-w-16 aspect-h-9">
      <Image
        src={
          roomDetails?.mainImage
            ? `/webapi/assets/${roomDetails.mainImage}`
            : "/placeholder.svg"
        }
        alt={roomDetails?.name || "Room image"}
        layout="fill"
        objectFit="cover"
        className="rounded-t-lg md:rounded-l-lg"
      />
    </div>

    <CardContent className="flex-1 p-6 md:w-2/3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        {roomDetails?.name || "Habitación"} (
        {property?.name || "Propiedad desconocida"})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Ingreso</p>
          <p className="font-medium">{format(new Date(booking.checkIn), "PPP", { locale: es })}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Salida</p>
          <p className="font-medium">{format(new Date(booking.checkOut), "PPP", { locale: es })}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Huéspedes</p>
          <p className="font-medium">{booking.guests}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Precio por noche</p>
          <p className="font-medium">${booking.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Limpieza</p>
          <p className="font-medium">${booking.cleaning}</p>
        </div>
      </div>

      {roomDetails && (
        <p className="text-sm text-gray-600 mb-4">{roomDetails.description}</p>
      )}

      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-gray-800">
          Total: ${calculateTotal(booking)}
        </p>
        <Button
          onClick={() => handleReviewClick(booking.id)}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
        >
          Dejar Comentario
        </Button>
      </div>
    </CardContent>
  </div>
</Card>

              </li>
            );
          })}
        </ul>
      )}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        bookingId={selectedBookingId || ""}
      />
    </div>
  );
};

function calculateTotal(booking: Booking): string {
  const nights =
    (new Date(booking.checkOut).getTime() -
      new Date(booking.checkIn).getTime()) /
    (1000 * 3600 * 24);
  const total =
    nights * booking.guests * Number.parseFloat(booking.price) +
    Number.parseFloat(booking.cleaning);

  return total.toFixed(2);
}

export default BookingList;
