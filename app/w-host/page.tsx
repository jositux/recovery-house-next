"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Home, ArrowRight, Clock } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

export default function WelcomePage() {
  const [name, setName] = useState<string>("")

  useEffect(() => {
    const storedName = localStorage.getItem("nombre")
    if (storedName) setName(storedName)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl overflow-hidden shadow-xl">
        <div className="relative h-64 sm:h-80">
          <Image
            src="/assets/welcome/host.jpg"
            alt="Imagen de bienvenida"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bienvenido, {name}</h1>
            <p className="text-lg sm:text-xl text-gray-200">Has elegido la opción de Dueño de Propiedad</p>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-lg text-gray-700 mb-6">
            Como dueño de propiedad, tienes la oportunidad de compartir tu espacio único con viajeros de todo el mundo. 
            ¿Estás listo para comenzar tu viaje como anfitrión?
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <Home className="h-8 w-8 text-blue-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Registra tu propiedad</h3>
                <p className="text-sm text-gray-600">Comienza a recibir huéspedes y genera ingresos con tu espacio.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-2">
                <Clock className="h-8 w-8 text-gray-500" />
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Explora más tarde</h3>
                <p className="text-sm text-gray-600">Tómate tu tiempo para considerar las opciones y vuelve cuando estés listo.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50">
          <Button asChild className="w-full sm:w-auto bg-[#39759E] hover:bg-blue-600 text-white">
            <Link href="/registrar-propiedad" className="flex items-center justify-center">
              Registrar mi propiedad
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center justify-center">
              Explorar más tarde
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
