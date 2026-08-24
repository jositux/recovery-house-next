'use client';

import { CheckoutForm } from "./CheckoutForm";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { type Locale } from "@/lib/i18n"; // Importación de Locale

const CheckoutPage = () => {
  const router = useRouter();

  const params = useParams();
  
  // Obtener 'lang' y 'isSpanish'
  const lang = (params.lang as Locale) || 'es'; // Default to 'es'

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
            unit_amount:  Math.round(Number(parsedBooking.paymentAmount) * 100) || 0,
          });
        } catch (error) {
          console.error("Error parsing booking data from localStorage:", error);
        }
      } else {
        router.push(`/${lang}/rooms`); // Redirigir si no hay booking
      }
    };

    fetchBookingData();
  }, [router]);

  return (
    <main className="bg-white">
      <div className="max-w-screen-lg mx-auto py-8">
        {bookingData && Object.keys(bookingData).length > 0 ? (
          <CheckoutForm bookingData={bookingData} lang={lang}/>
        ) : (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
