'use client';

import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import React, { useState, useEffect } from "react";

const CheckoutPage = () => {
  const [bookingData, setBookingData] = useState<{
    name?: string;
    description?: string;
    unit_amount: number;  // Ahora es obligatorio
    guests?: number;
  }>();  // Valor predeterminado para `unit_amount`

  useEffect(() => {
    const fetchBookingData = () => {
      const storedBooking = localStorage.getItem("booking");

      console.log("stored", storedBooking)
      if (storedBooking) {
        try {
          const parsedBooking = JSON.parse(storedBooking);
          // Asignar `unit_amount` si no está definido
          setBookingData({
            ...parsedBooking,
            unit_amount: parsedBooking.unit_amount || 0, // Asegura que siempre haya un `unit_amount`
          });
        } catch (error) {
          console.error("Error parsing booking data from localStorage:", error);
        }
      }
    };

    fetchBookingData();
  }, []);


  return (
    <main>
      <div className="max-w-screen-lg mx-auto my-8">
        {bookingData && Object.keys(bookingData).length > 0 ? (
          <CheckoutForm bookingData={bookingData} />
        ) : (
          <p>Loading booking data...</p>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
