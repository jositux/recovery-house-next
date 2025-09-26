"use client";

import { Suspense } from "react";
import { CheckCircle, Calendar, Home } from "lucide-react";
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
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBookingBalanced } from "@/services/BookingBalancedService";

interface BookingBalanced {
  bookingId: string,
  paymentAmount: number,
  paymentDate: string,
  paymentId: string,
  paymentType: string
}

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sendBookingBalanced = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const bookingRaw = localStorage.getItem("bookingBalanced")!;
      const parsedBookingBalanced: BookingBalanced = JSON.parse(bookingRaw) as BookingBalanced;


      if (!bookingRaw) return;

      try {
        const paymentId = searchParams.get("rel");

        const data: BookingBalanced = {
          bookingId: parsedBookingBalanced.bookingId,
          paymentAmount: parsedBookingBalanced.paymentAmount,
          paymentDate: parsedBookingBalanced.paymentDate,
          paymentId: paymentId ?? "",
          paymentType: parsedBookingBalanced.paymentType
        };

        await createBookingBalanced(data, accessToken);
        localStorage.removeItem("bookingBalanced"); // Fixed: should be "bookingData" not "booking"
        localStorage.removeItem("booking");
      } catch (error) {
        console.error("Error al enviar la reserva:", error);
      }
    };

    sendBookingBalanced();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
              ¡Te esperamos para tu estadía!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-gray-600 mb-6">
              Se ha procesado el pago de lo pendiente. Tu reserva está confirmada
              y lista para que disfrutes de una experiencia inolvidable.
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">Pago pendiente realizado</p>
              </div>
              
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="w-full space-y-3">
              <Link href="/reservas-realizadas" passHref className="block w-full">
                <Button className="w-full bg-[#39759E] hover:bg-blue-600 text-white transition duration-300">
                  Ver tus reservas
                </Button>
              </Link>
              <Link href="/rooms" passHref className="block w-full">
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 transition duration-300 bg-transparent"
                >
                  Explorar más alojamientos
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

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
