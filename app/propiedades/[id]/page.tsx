"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Bed, User, Pencil, Plus, Loader2, MapPin, Home, Star } from "lucide-react"
import { GoogleMap } from "@/components/ui/google-map"
import { PropertyBlockForm } from "@/components/property-block-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MagicBackButton } from "@/components/ui/magic-back-button"
import { getCurrentUser } from "@/services/userService"

interface Room {
  id: string
  name: string
  description: string
  pricePerNight: string
  mainImage: string
  cleaningFee: string
  photos: {
    directus_files_id: {
      id: string
    }
  }[]
  extraTags: { ExtraTags_id: string }[]
  servicesTags: { serviceTags_id: string }[]
  roomNumber: string
  beds: number
  capacity: number
}

interface Property {
  id: string
  userId: string
  name: string
  country: string
  region: string
  state: string
  city: string
  place: {
    type: string
    coordinates: [number, number]
  }
  description: string
  mainImage: string
  Rooms: Room[]
  type: string
  RNTFile: FileData
  taxIdEINFile: FileData
  taxIdApproved: boolean
  address: string
  fullAddress: string
  postalCode: string
}

export interface FileData {
  id: string
  filename_download: string
}

export default function RoomPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const accessToken = localStorage.getItem("access_token")

        let propertyResponse

        if (accessToken) {
          const currentUser = await getCurrentUser(accessToken)
          propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields:
                "*, RNTFile.filename_download,RNTFile.id,taxIdEINFile.filename_download,taxIdEINFile.id, Rooms.*,Rooms.photos.*,Rooms.extraTags.*,Rooms.servicesTags.*",
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          console.log("current ", currentUser.id)
          console.log("property User id ", propertyResponse.data.data.userId)
          const isCurrentUserOwner = currentUser.id === propertyResponse.data.data.userId
          setIsOwner(isCurrentUserOwner)

          if (!isCurrentUserOwner) {
            propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
              params: {
                fields: "*, Rooms.*",
              },
            })
          }
        } else {
          propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields: "*, Rooms.*",
            },
          })
        }

        const propertyData: Property = propertyResponse.data.data
        console.log("la data posta", propertyData)
        setProperty(propertyData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    console.log("isOwner updated:", isOwner)
  }, [isOwner])

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "")
    const txt = document.createElement("textarea")
    txt.innerHTML = textWithoutTags
    return txt.value
  }

  const handleEditBanner = (property: Property) => {
    localStorage.setItem("selected_property", JSON.stringify(property))
    router.push(`/editar-propiedad/${id}/`)
  }

  const handleEditRoom = (room: Room) => {
    localStorage.setItem("selected_room", JSON.stringify(room))
    router.push(`/propiedades/${id}/room/edit`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-gray-700">Cargando propiedad...</span>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">{error || "Propiedad no encontrada"}</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Property Image */}
      <div className="relative h-[70vh] w-full">
        <Image src={`/webapi/assets/${property.mainImage}`} alt={property.name} layout="fill" objectFit="cover" />

        <div className="absolute inset-0 bg-black bg-opacity-30" />

        <div className="absolute bottom-8 left-0 right-0 text-white">
          <div className="container mx-auto px-4 lg:px-20">
            <h1 className="text-5xl font-bold mb-2">{property.name}</h1>
            <p className="text-2xl">
              {property.city}, {property.state}, {property.country}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              onClick={() => handleEditBanner(property)}
              className="rounded-full bg-white hover:bg-gray-100 text-gray-800 px-4 py-2"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      <div className="absolute top-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4 lg:px-20">
          <MagicBackButton />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Acerca de esta propiedad</h2>
            <p className="text-lg text-gray-700 mb-6">{decodeHtmlAndRemoveTags(property.description)}</p>
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <p>{property.fullAddress}</p>
            </div>
            <div className="flex items-center text-gray-600">
              <Home className="h-5 w-5 mr-2" />
              <p>{property.type === "Stay" ? "Estancia" : "Casa de Recuperación"}</p>
            </div>
          </div>
          <div className="h-64 rounded-lg overflow-hidden shadow-lg">
            <GoogleMap lat={property.place.coordinates[0]} lng={property.place.coordinates[1]} />
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Habitaciones disponibles</h2>
            {isOwner && (
              <Button asChild>
                <Link
                  href={`/propiedades/${property.id}/room/create`}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
                >
                  <Plus className="h-5 w-5" />
                  Agregar Habitación
                </Link>
              </Button>
            )}
          </div>
          {property.Rooms && property.Rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {property.Rooms.map((room: Room) => (
                <div
                  key={room.id}
                  className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative w-full h-48">
                    <Link href={`/rooms/${room.id}`} passHref>
                      <div className="relative w-full h-full">
                        <Image
                          src={`/webapi/assets/${room.mainImage}`}
                          alt={room.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </Link>

                    {isOwner && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEditRoom(room)}
                          className="rounded-full bg-white hover:bg-gray-100 text-gray-800 px-4 py-2"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-gray-600">
                        <Bed className="w-5 h-5 mr-2" />
                        <span>{room.beds} camas</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="w-5 h-5 mr-2" />
                        <span>{room.capacity} huéspedes</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-2xl font-bold text-primary">
                        ${room.pricePerNight} <span className="text-sm font-normal text-gray-600">/ noche</span>
                      </p>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="font-semibold">4.9</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Tarifa de limpieza: ${room.cleaningFee}</p>
                    {isOwner && <PropertyBlockForm />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6 relative">
                <Image
                  src="/assets/welcome/host.jpg?height=200&width=200"
                  alt="No rooms"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-3xl font-semibold mb-4 text-gray-800">¡Desbloquea el potencial de tu propiedad!</h3>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Agregar habitaciones es el primer paso para convertir tu espacio en una fuente de ingresos. Muestra tus
                espacios únicos y comienza a recibir reservas hoy mismo.
              </p>
              {isOwner && (
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    asChild
                    className="bg-primary text-white hover:bg-primary-dark transition-colors duration-300 rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl"
                  >
                    <Link href={`/propiedades/${property.id}/room/create`}>
                      <Plus className="h-6 w-6 mr-2 inline-block" />
                      Agregar tu primera habitación
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

