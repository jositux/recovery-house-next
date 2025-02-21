"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Edit, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Fraunces } from "next/font/google"
import { motion } from "framer-motion"

const fraunces = Fraunces({ subsets: ["latin"] })

// Import the providerService (assuming it's defined elsewhere)
import { providerService } from "@/services/providerService"

export function SuccessContent() {
  const [status, setStatus] = useState("loading")
  const [customerEmail, setCustomerEmail] = useState("")
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      fetchSessionStatus()
    }
  }, [sessionId])

  async function fetchSessionStatus() {
    const response = await fetch("/api/check-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    })

    const { session, error } = await response.json()

    if (error) {
      setStatus("failed")
      console.error(error)
      return
    }

    setStatus(session.status)
    setCustomerEmail(session.customer_email)

    console.log(customerEmail)

    // If there's no error, read data from localStorage and create property
    if (!error) {
      const newServiceData = localStorage.getItem("new_service")
      if (newServiceData) {
        try {
          const providerData = JSON.parse(newServiceData)
          const propertyResponse = await providerService.createProperty(providerData)
          console.log("Property created:", propertyResponse)
          // You might want to handle the response here (e.g., show a success message)
        } catch (err) {
          console.error("Error creating property:", err)
          // You might want to handle the error here (e.g., show an error message)
        }
      }

      localStorage.removeItem("new_service");
    }
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Procesando su suscripción</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <CardDescription>Por favor espere mientras confirmamos su suscripción...</CardDescription>
            </CardContent>
          </Card>
        )
      case "failed":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Error en la suscripción</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <CardDescription>No se pudo procesar la suscripción. Por favor, inténtelo de nuevo.</CardDescription>
            </CardContent>
          </Card>
        )
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-[#39759E] to-blue-500 h-2" />
              <CardHeader className="pt-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className={`${fraunces.className} text-2xl text-center font-normal mb-2 text-gray-800`}>
                  ¡Gracias por registrar su servicio!
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center px-8">
                <CardDescription className="text-center text-sm text-gray-600 mb-6">
                Su servicio está en proceso de revisión. Le notificaremos por e-mail en cuanto esté disponible para su uso. ¡Estamos contentos que pronto pueda disfrutar de los beneficios de Recovery Care Solutions!

</CardDescription>
               <motion.div
  className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
>
<Link href="/" passHref className="w-full">
    <Button variant="outline" className="w-full py-6 text-lg font-semibold text-sm" size="lg">
      <Home className="mr-2 h-5 w-5" /> Volver al Inicio
    </Button>
  </Link>
  <Link href="/editar-servicio" passHref className="w-full">
    <Button className="w-full py-6 text-lg font-semibold text-sm bg-[#39759E]" size="lg">
      <Edit className="mr-2 h-5 w-5" /> Editar Mi Servicio
    </Button>
  </Link>
 
</motion.div>

              </CardContent>
              <CardFooter className="bg-gray-50 mt-6 py-4 text-center text-sm text-gray-500">
                ¿Necesita ayuda? Contáctenos en info@recoverycaresolutions.com
              </CardFooter>
            </Card>
          </motion.div>
        )
    }
  }

  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">{renderContent()}</div>
}

