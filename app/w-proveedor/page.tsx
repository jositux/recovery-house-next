"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"


export default function WelcomePage() {
  const [name, setName] = useState<string>("")


  useEffect(() => {
    // Obtener datos del localStorage
    const storedName = localStorage.getItem("nombre")
    
    if (storedName) setName(storedName)

  }, [])


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Bienvenido, {name}</h1>
          <p className="text-1xl text-gray-600">Has elegido la opción de Proveedor de servicios</p>
        </div>

        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {" "}
          {/* 16:9 Aspect Ratio */}
          <Image
            src="/assets/welcome/proveedor.jpg" // Reemplaza esto con la URL de tu imagen
            alt="Imagen de bienvenida"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/subscriptions" passHref>
              <Button className="w-full bg-[#39759E] hover:bg-blue-600 text-white text-sm py-3">
                Quiero registrar mi servicio
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm py-3">
                En otro momento
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

