"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getPropertiesByUserId, type Property } from "@/services/propertyCollectionService"
import { getCurrentUser, type User } from "@/services/userService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Star, Loader2, BedDouble } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("Token no encontrado. Inicia sesión nuevamente.")
        }

        const currentUser: User = await getCurrentUser(token)
        const data = await getPropertiesByUserId(currentUser.id, token)

        setProperties(data)
        localStorage.setItem("properties", JSON.stringify(data))
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error inesperado")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-gray-700">Cargando propiedades...</span>
      </div>
    )
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">Error: {error}</p>
  }

  return (
    <div className="container min-h-screen mx-auto py-16 px-4 md:px-0 lg:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
        <Link href="/registrar-propiedad">
          <Button className="bg-[#39759E] text-white hover:bg-primary/90">
            <Plus className="mr-2 h-5 w-5" /> Nueva Propiedad
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No hay propiedades disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto">
                  <Link href={`/propiedades/${property.id}`}>
                    <Image
                      src={`/webapi/assets/${property.mainImage || "/placeholder.svg"}?key=medium`}
                      alt={property.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                </div>
                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{property.name}</h2>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.country}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{property.description || "Sin descripción"}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <BedDouble className="h-4 w-4 mr-1" />
                      {property.Rooms?.length || 0} habitación{property.Rooms?.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="space-x-2">
                      <Link href={`/propiedades/${property.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertiesPage

