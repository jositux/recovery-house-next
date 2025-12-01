"use client";

import { Suspense, useCallback, useMemo, useEffect } from "react";
import { CheckCircle, Calendar } from "lucide-react";
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
import { useRouter, useSearchParams, useParams } from "next/navigation"; // Importar useParams
import { createBooking } from "@/services/BookingService3";

// Simulación de la importación de Locale y la interfaz Booking
// import { type Locale } from "@/lib/i18n"; 
import { type Locale } from "@/lib/i18n"; // Importación de Locale

interface Booking {
  room: string;
  patient: string;
  ownerId: string;
  guests: number;
  checkInDateHour: string;
  checkOutDateHour: string;
  finalPrice: number;
  price: number;
  cleaning: number;
  discountStayType: string;
  discountPercentageStayApplied: number;
  discountStayAmount: number;
  prepaymentPercentage: number;
  paymentAmount: number;
  paymentBalance: number;
  paymentDate: string;
  paymentId: string;
  paymentType: string;
}

// -----------------------------------------------------------
//             TRADUCCIONES DE LA PÁGINA DE ÉXITO
// -----------------------------------------------------------

const translations = {
  es: {
    title: "¡Te esperamos para tu estadía!",
    description: "Se ha procesado el pago correctamente. Tu reserva está confirmada y lista para que disfrutes de una experiencia inolvidable.",
    status: "Reserva Confirmada",
    viewBookings: "Ver tus reservas",
    exploreRooms: "Explorar más alojamientos",
    loadingTitle: "Confirmando tu reserva...",
    loadingDescription: "Estamos finalizando la transacción.",
  },
  en: {
    title: "We look forward to your stay!",
    description: "Payment has been processed successfully. Your reservation is confirmed and ready for you to enjoy an unforgettable experience.",
    status: "Booking Confirmed",
    viewBookings: "View Your Bookings",
    exploreRooms: "Explore More Accommodations",
    loadingTitle: "Confirming Your Booking...",
    loadingDescription: "We are finalizing the transaction.",
  },
};

type Translations = typeof translations.es;

// -----------------------------------------------------------

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // Hook para obtener parámetros de ruta

  // 1. Lógica de I18n usando useParams y useMemo
  const { t, lang } = useMemo(() => {
    // Obtener 'lang' del objeto params
    const routeLang = params.lang as string | undefined;
    const currentLang = (routeLang as Locale) || 'es'; // Default to 'es'

    const isSpanish = currentLang.toLowerCase().startsWith('es');
    const t: Translations = translations[isSpanish ? 'es' : 'en'] as Translations;
    
    return { t, lang: currentLang };
  }, [params.lang]); // Dependencia: params.lang


  // 2. Lógica para enviar la reserva
  const sendBooking = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push(`/${lang}/login`); // Usar lang para la redirección
      return;
    }

    const bookingRaw = localStorage.getItem("booking");
    
    if (!bookingRaw) {
      console.warn("No se encontraron datos de reserva en localStorage.");
      return;
    }

    let parsedBooking: Booking;
    try {
      parsedBooking = JSON.parse(bookingRaw) as Booking;
    } catch (e) {
      console.error("Error al parsear los datos de reserva:", e);
      return;
    }

    const currentDateTime: string =
      new Date().toISOString().split(".")[0] + "Z";
    
    const paymentId = searchParams.get("rel");

    let updatedCheckInDateHour = parsedBooking.checkInDateHour;

        if (updatedCheckInDateHour && !updatedCheckInDateHour.endsWith('Z')) {
            updatedCheckInDateHour += 'Z';
        }

    try {
      const bookingData: Booking = {
        room: parsedBooking.room,
        patient: parsedBooking.patient,
        ownerId: parsedBooking.ownerId,
        guests: parsedBooking.guests,
        checkInDateHour: updatedCheckInDateHour,
        checkOutDateHour: parsedBooking.checkOutDateHour,
        finalPrice: parsedBooking.finalPrice,
        price: parsedBooking.price,
        cleaning: parsedBooking.cleaning,
        discountStayType: parsedBooking.discountStayType,
        discountPercentageStayApplied:
          parsedBooking.discountPercentageStayApplied,
        discountStayAmount: parsedBooking.discountStayAmount,
        prepaymentPercentage: 10,
        paymentAmount: parsedBooking.paymentAmount,
        paymentBalance: parsedBooking.paymentBalance,
        paymentDate: currentDateTime,
        paymentId: paymentId ?? "",
        paymentType: parsedBooking.paymentType,
      };

      await createBooking(bookingData, accessToken);
      
      localStorage.removeItem("bookingData"); 
      localStorage.removeItem("booking"); 
      
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
    }
  }, [router, searchParams, lang]); // Agregar 'lang' como dependencia

  useEffect(() => {
    sendBooking();
  }, [sendBooking]);

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
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-gray-600 mb-6">
              {t.description}
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">{t.status}</p>
              </div>
              
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="w-full space-y-3">
              <Link href={`/mi-panel/reservas-realizadas`} passHref className="block w-full"> {/* Usar /${lang}/ */}
                <Button className="w-full bg-[#39759E] hover:bg-blue-600 text-white transition duration-300">
                  {t.viewBookings}
                </Button>
              </Link>
              <Link href={`/rooms`} passHref className="block w-full"> {/* Usar /${lang}/ */}
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 transition duration-300 bg-transparent"
                >
                  {t.exploreRooms}
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// Componente Fallback ajustado para usar la lógica de traducción
const LoadingFallback = () => {
    const params = useParams();
    const { t } = useMemo(() => {
        const routeLang = params.lang as string | undefined;
        const currentLang = (routeLang as Locale) || 'es';
        const isSpanish = currentLang.toLowerCase().startsWith('es');
        return { t: translations[isSpanish ? 'es' : 'en'] as Translations };
    }, [params.lang]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#39759E] to-blue-500 text-white p-6">
                    <div className="h-20 w-20 mx-auto mb-4 bg-white/20 rounded-full animate-pulse" />
                    <CardTitle className="text-center text-2xl font-bold">
                        {t.loadingTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-center text-gray-600 mb-6">{t.loadingDescription}</p>
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};

const SuccessPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;