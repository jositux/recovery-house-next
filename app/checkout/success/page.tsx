"use client"

import { CheckCircle, Calendar, Home } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBooking } from "@/services/BookingService2"

// This component will handle the search params and booking logic
function BookingHandler({ onComplete }: { onComplete: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sendBooking = async () => {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        router.push("/login")
        return
      }

      const bookingRaw = localStorage.getItem("booking")
      console.log(bookingRaw)
      if (!bookingRaw) return

      try {
        const parsedBooking = JSON.parse(bookingRaw)
        const isPrivate = parsedBooking.isPrivate ?? true
        const paymentId = searchParams.get("rel")
        if (!paymentId) return

        let bookingData = {
          status: "PAGADO",
          checkIn: "",
          checkOut: "",
          patient: "",
          patientName: "",
          propertyName: "",
          guests: 0,
          price: 0,
          cleaning: 0,
          room: "",
          roomName: "",
          roomDescription: "",
          ownerName: "",
          isPrivate,
          singleBeds: 0,
          doubleBeds: 0,
          singleBedPrice: 0,
          doubleBedPrice: 0,
          singleBedCleaningPrice: 0,
          doubleBedCleaningPrice: 0,
          paymentId,
        }

        if (!isPrivate) {
          const sharedDataRaw = localStorage.getItem("bookingSharedData")
          if (!sharedDataRaw) return

          const sharedData = JSON.parse(sharedDataRaw)

          bookingData = {
            ...bookingData,
            checkIn: sharedData.checkIn,
            checkOut: sharedData.checkOut,
            patient: sharedData.patientId,
            patientName: sharedData.patientName,
            propertyName: sharedData.propertyName,
            room: sharedData.room,
            roomName: sharedData.roomName,
            roomDescription: sharedData.description,
            ownerName: sharedData.ownerName,
            singleBeds: sharedData.singleBeds,
            doubleBeds: sharedData.doubleBeds,
            singleBedPrice: Number(sharedData.singleBedPrice),
            doubleBedPrice: Number(sharedData.doubleBedPrice),
            singleBedCleaningPrice: Number(sharedData.singleBedCleaningPrice),
            doubleBedCleaningPrice: Number(sharedData.doubleBedCleaningPrice),
          }
        } else {
          const privateDataRaw = localStorage.getItem("bookingPrivateData")
          if (!privateDataRaw) return

          const privateData = JSON.parse(privateDataRaw)

          bookingData = {
            ...bookingData,
            checkIn: privateData.checkIn,
            checkOut: privateData.checkOut,
            patient: privateData.patientId,
            patientName: privateData.patientName,
            propertyName: privateData.propertyName,
            guests: privateData.guests,
            price: privateData.price,
            cleaning: privateData.cleaning,
            room: privateData.room,
            roomName: privateData.roomName,
            roomDescription: privateData.description,
            ownerName: privateData.ownerName,
          }
        }

        await createBooking(bookingData, accessToken)

        // Limpiar localStorage después de enviar
        localStorage.removeItem("booking")
        localStorage.removeItem("bookingSharedData")
        localStorage.removeItem("bookingPrivateData")

        // Notify parent component that booking is complete
        onComplete()
      } catch (error) {
        console.error("Error al enviar la reserva:", error)
      }
    }

    sendBooking()
  }, [router, searchParams, onComplete])

  return null // This component doesn't render anything
}

// The main success page component
const SuccessPage = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <BookingHandler onComplete={() => console.log("Booking completed successfully")} />
      </Suspense>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#39759E] to-blue-500 text-white p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            >
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-center text-2xl font-bold">¡Te esperamos para tu estadía!</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-gray-600 mb-6">
              Se ha procesado el pago correctamente. Tu reserva está confirmada y lista para que disfrutes de una
              experiencia inolvidable.
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">Reserva Confirmada</p>
              </div>
              <div className="text-center">
                <Home className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-600">Alojamiento Listo</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="w-full space-y-3">
              <Link href="/mis-reservas" passHref className="block w-full">
                <Button className="w-full bg-[#39759E] hover:bg-blue-600 text-white transition duration-300">
                  Ver tus reservas
                </Button>
              </Link>
              <Link href="/rooms" passHref className="block w-full">
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 transition duration-300"
                >
                  Explorar más alojamientos
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default SuccessPage
