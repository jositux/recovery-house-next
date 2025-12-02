"use client";

import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react"; // Importamos useMemo
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createBookingModify, ModifyBookingPayload } from "@/services/BookingModifyService"; 
import { type Locale } from "@/lib/i18n" 

// --- Objeto de Traducción ---
const translations = {
  es: {
    title: "¡Modificación exitosa!",
    message: "Se ha procesado el pago por la modificación. Te esperamos en el alojamiento.",
    viewBookings: "Ver tus reservas",
    exploreRooms: "Explorar más",
    loginError: "Falta el token de acceso. Redirigiendo a iniciar sesión...",
    modifyError: "Error al modificar la reserva",
  },
  en: {
    title: "Modification Successful!",
    message: "The payment for the modification has been processed. We look forward to welcoming you to the accommodation.",
    viewBookings: "View Your Bookings",
    exploreRooms: "Explore More",
    loginError: "Missing access token. Redirecting to login...",
    modifyError: "Error modifying reservation",
  },
};

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es'
  
  // Usamos useMemo para acceder a las traducciones
  const t = useMemo(() => translations[lang], [lang]); 

  useEffect(() => {
    const sendBookingBalanced = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        // En un entorno de producción, podrías mostrar un toast con t.loginError
        router.push(`/${lang}/login`);
        return;
      }

      const bookingRaw = localStorage.getItem("booking");
      if (!bookingRaw) return;

      try {
        const parsedBooking: ModifyBookingPayload = JSON.parse(bookingRaw) as ModifyBookingPayload;
        const paymentId = searchParams.get("rel");
        
        // El accessToken ya se chequeó al inicio del useEffect
        
        const payload: ModifyBookingPayload = {
          bookingId: parsedBooking.bookingId,
          guests: parsedBooking.guests,
          checkInDateHour: parsedBooking.checkInDateHour,
          checkOutDateHour: parsedBooking.checkOutDateHour,
          checkInHour: parsedBooking.checkInHour,
          price: parsedBooking.price,
          cleaning: parsedBooking.cleaning,
          finalPrice: parsedBooking.finalPrice,
          discountStayType: parsedBooking.discountStayType,
          discountPercentageStayApplied: parsedBooking.discountPercentageStayApplied,
          discountStayAmount: parsedBooking.discountStayAmount,
          prepaymentPercentage: Number(parsedBooking.prepaymentPercentage) || 0,
          paymentAmount: parsedBooking.paymentAmount,
          paymentDate: new Date().toISOString().split(".")[0] + "Z",
          paymentBalance: parsedBooking.paymentBalance,
          paymentId: paymentId,
          paymentType: parsedBooking?.paymentType === "prepayment" ? "prepayment" : "fullpayment",
        };
    
        await createBookingModify(payload, accessToken);
        localStorage.removeItem("booking");
    
      } catch (error) {
        console.error("Error modificando reserva", error);
        // Aquí podrías manejar el error de forma visible: setError(t.modifyError)
      } 
    };

    sendBookingBalanced();
  }, [router, searchParams, t]); // Agregamos 't' como dependencia, aunque solo se usa para logica futura de errores.

  return (
    <div className="min-h-screen flex pt-8 justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#39759E] to-blue-500 text-white p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            >
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-center text-2xl font-bold">
              {t.title} {/* <-- TRADUCIDO */}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-gray-600 mb-6">
              {t.message} {/* <-- TRADUCIDO */}
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="w-full space-y-3">
              <Link href={`/${lang}/mi-panel/reservas-realizadas`} passHref className="block w-full">
                <Button className="w-full bg-[#39759E] hover:bg-blue-600 text-white transition duration-300">
                  {t.viewBookings} {/* <-- TRADUCIDO */}
                </Button>
              </Link>
              <Link href={`/${lang}/rooms`} passHref className="block w-full">
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 transition duration-300 bg-transparent"
                >
                  {t.exploreRooms} {/* <-- TRADUCIDO */}
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// ... (LoadingFallback y SuccessPage se mantienen sin cambios ya que no contienen texto estático a traducir)
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#39759E] to-blue-500 text-white p-6">
          <div className="h-20 w-20 mx-auto mb-4 bg-white/20 rounded-full animate-pulse" />
          <div className="h-8 bg-white/20 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const SuccessPage = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SuccessPageContent />
      </Suspense>
    );
  };
  
  export default SuccessPage;