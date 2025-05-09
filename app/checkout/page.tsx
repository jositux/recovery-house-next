'use client';

import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<{
    name?: string;
    description?: string;
    unit_amount: number;
  }>();

  useEffect(() => {
    const fetchBookingData = () => {
      const storedBooking = localStorage.getItem("booking");

      if (storedBooking) {
        try {
          const parsedBooking = JSON.parse(storedBooking);
          setBookingData({
            ...parsedBooking,
            unit_amount: parsedBooking.unit_amount * 100 || 0,
          });
        } catch (error) {
          console.error("Error parsing booking data from localStorage:", error);
        }
      } else {
        router.push("/rooms"); // Redirigir si no hay booking
      }
    };

    fetchBookingData();
  }, [router]);

  return (
    <main>
      <div className="max-w-screen-lg mx-auto my-8">
        {bookingData && Object.keys(bookingData).length > 0 ? (
          <CheckoutForm bookingData={bookingData} />
        ) : (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg text-gray-700">Cargando...</span>
          </div>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
