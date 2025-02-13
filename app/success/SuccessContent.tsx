"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

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
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className={`${fraunces.className} text-2xl text-center font-medium mb-6`}>¡Suscripción Exitosa!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <CardDescription className="text-center">
                Gracias por su suscripción. Se ha enviado un correo con los detalles.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/registrar-servicio" passHref>
                <Button className="w-full sm:w-auto">Agregar Servicio</Button>
              </Link>
              <Link href="/rooms" passHref>
                <Button variant="outline" className="w-full sm:w-auto">
                  En otro momento
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
    }
  }

  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">{renderContent()}</div>
}

