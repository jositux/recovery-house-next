"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Bed, User, Pencil, Plus, Loader2, MapPin, Home, Trash, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { GoogleMap } from "@/components/ui/google-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MagicBackButton } from "@/components/ui/magic-back-button"
import { getCurrentUser } from "@/services/userService"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CannotDeleteDialog } from "./cannot-delete-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

interface ImageType {
  id: string
  isModerated: boolean
}

type ImageRoom = {
  directus_files_id: {
    id: string
    isModerated: boolean
  }
}

interface FileData {
  id: string
  filename_download: string
}

interface Room {
  id: string
  name: string
  description: string
  pricePerNight: string
  cleaningFee: string
  photos: ImageRoom[]
  extraTags: { ExtraTags_id: string }[]
  servicesTags: { serviceTags_id: string }[]
  roomNumber: string
  beds: number
  capacity: number
  descriptionService: string
  disabledDates: string
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
  mainImage: ImageType
  Rooms: Room[]
  type: string
  RNTFile: FileData
  taxIdEINFile: FileData
  taxIdApproved: boolean
  address: string
  fullAddress: string
  postalCode: string
}

export default function RoomPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updated, setUpdated] = useState<string | null>(null)

  const [isOwner, setIsOwner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false)
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)
  const [cannotDeleteType, setCannotDeleteType] = useState<"room" | "property">("room")
  const [selectedRoomForDeletion, setSelectedRoomForDeletion] = useState<Room | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

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
                "*, RNTFile.filename_download,RNTFile.id,taxIdEINFile.filename_download,taxIdEINFile.id, mainImage.id, mainImage.isModerated, Rooms.*,Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated, Rooms.extraTags.*,Rooms.servicesTags.*",
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
                fields:
                  "*, mainImage.id, mainImage.isModerated, Rooms.*, Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated",
              },
            })
          }
        } else {
          propertyResponse = await axios.get(`/webapi/items/Property/${id}`, {
            params: {
              fields:
                "*, mainImage.id, mainImage.isModerated, Rooms.*, Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated",
            },
          })
        }

        const propertyData: Property = propertyResponse.data.data

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
    if (searchParams.get("rel") === "new") {
      setUpdated("property")
      setShowModal(true)
    }
    if (searchParams.get("rel") === "new-room") {
      setUpdated("room")
      setShowModal(true)
    }
  }, [searchParams])

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

  const handleCalendarRoom = (room: Room) => {
    localStorage.setItem("selected_room", JSON.stringify(room))
    router.push(`/calendario/${room.id}/`)
  }

  const confirmDeleteProperty = async () => {
    if (!property) return

    try {
      /*const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        console.error("No access token found")
        return
      }*/

      // Aquí implementar la lógica de eliminación real
      await axios.delete(`/webapi/items/Property/${property.id}`/*, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }*/)

      // Redireccionar a la lista de propiedades después de eliminar
      router.push("/mis-propiedades")
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error)
      // Aquí podrías mostrar un mensaje de error
    }
  }

  const confirmDeleteRoom = async () => {
    if (!selectedRoomForDeletion) return

    try {
      /*const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        console.error("No access token found")
        return
      }*/

      // Aquí implementar la lógica de eliminación real
      await axios.delete(`/webapi/items/Room/${selectedRoomForDeletion.id}`/*, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }*/)

      // Actualizar la lista de habitaciones en la UI
      if (property) {
        setProperty({
          ...property,
          Rooms: property.Rooms.filter((room) => room.id !== selectedRoomForDeletion.id),
        })
      }
    } catch (error) {
      console.error("Error al eliminar la habitación:", error)
      // Aquí podrías mostrar un mensaje de error
    }
  }

  const handleDeleteProperty = async (property: Property) => {
    const checkBookings = async (roomIds: string[]): Promise<boolean> => {
      if (roomIds.length === 0) {
        console.log("❌ La propiedad no tiene habitaciones.")
        return false
      }

      try {
        const idsQuery = roomIds.map((id) => encodeURIComponent(id)).join(",") // Convertir array a string separado por comas
        const url = `/webapi/items/Booking?filter[room][_in]=${idsQuery}&fields=*`

        const response = await axios.get(url)

        if (response.data?.data?.length > 0) {
          console.log("✅ Hay reservas:", response.data.data)
          return true // Hay reservas
        } else {
          console.log("❌ No hay reservas para esta propiedad.")
          return false // No hay reservas
        }
      } catch (error) {
        console.error("Error en la solicitud:", error)
        return false // Manejo de error, asumir que no hay reservas
      }
    }

    // 🔹 Obtener los IDs de las habitaciones de la propiedad
    const roomIds = property.Rooms.map((room) => room.id)

    // 🔹 Esperamos la respuesta antes de continuar
    const hasBookings = await checkBookings(roomIds)

    if (!hasBookings) {
      console.log("🚀 Propiedad sin reservas, puedes eliminarla.")
      setCannotDeleteType("property")
      setShowConfirmDeleteDialog(true)
    } else {
      console.log("⚠️ No se puede eliminar la propiedad porque tiene habitaciones con reservas.")
      setCannotDeleteType("property")
      setShowCannotDeleteDialog(true)
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    setSelectedRoomForDeletion(room)

    const checkBookings = async (roomId: string): Promise<boolean> => {
      try {
        const url = `/webapi/items/Booking?filter[room][_eq]=${roomId}`
        const response = await axios.get(url)

        if (response.data?.data?.length > 0) {
          console.log("✅ Hay reservas:", response.data.data)
          return true // Hay reservas
        } else {
          console.log("❌ No hay reservas para esta habitación.")
          return false // No hay reservas
        }
      } catch (error) {
        console.error("Error en la solicitud:", error)
        return false // Manejo de error, asumir que no hay reservas
      }
    }

    // 🔹 Esperamos la respuesta antes de continuar
    const hasBookings = await checkBookings(room.id)

    if (!hasBookings) {
      console.log("🚀 Habitación sin reservas, puedes eliminarla.")
      setCannotDeleteType("room")
      setShowConfirmDeleteDialog(true)
    } else {
      console.log("⚠️ No se puede eliminar la habitación porque tiene reservas.")
      setCannotDeleteType("room")
      setShowCannotDeleteDialog(true)
    }
  }

  const transformImageRoomToImage = (fileData: ImageRoom): ImageType => {
    return {
      id: fileData.directus_files_id.id,
      isModerated: fileData.directus_files_id.isModerated,
    }
  }

  const getImageSrc = (image: ImageType) => {
    return image.isModerated && !isOwner ? "/assets/empty.jpg" : `/webapi/assets/${image.id}?key=full`
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
        <Image
          src={getImageSrc(property.mainImage) || "/assets/empty.jpg"}
          alt={property.name}
          layout="fill"
          objectFit="cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-30" />

        <div className="absolute bottom-8 left-0 right-0 text-white">
          <div className="container mx-auto px-4 lg:px-20">
            {isOwner && property.mainImage.isModerated !== undefined && (
              <div className="">
                {property.mainImage.isModerated ? (
                  <Badge variant="outline" className="bg-red-900 text-orange-100 border-orange-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Foto En Revisión
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-900 text-green-100 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Foto Aprobada
                  </Badge>
                )}
              </div>
            )}

            <h1 className="lg:text-5xl text-3xl font-bold mb-2">{property.name}</h1>
            <p className="text-1xl lg:text-2xl">
              {property.city}, {property.state}, {property.country}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4 lg:px-20">
          <MagicBackButton />
        </div>
        {isOwner && (
          <div>
            <div className="absolute z-100 top-4 right-4">
              <Button
                variant="secondary"
                onClick={() => handleEditBanner(property)}
                className="inline-flex items-center justify-center w-full rounded-full bg-white hover:bg-gray-100 text-gray-800 px-4 py-2"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Propiedad
              </Button>

              <div className="absolute z-100 top-12 right-0">
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteProperty(property)}
                  className="inline-flex items-center justify-center w-full rounded-full bg-red-900 hover:bg-red-800 text-white px-4 py-2"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
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
                  className="bg-white relative border pb-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative w-full h-48">
                    <Link href={`/rooms/${room.id}`} passHref>
                      <div className="relative w-full h-full">
                        <Image
                          src={getImageSrc(transformImageRoomToImage(room.photos[0])) || "/assets/empty.jpg"}
                          alt={property.name}
                          layout="fill"
                          objectFit="cover"
                        />

                        {isOwner && room.photos[0]?.directus_files_id.isModerated !== undefined && (
                          <div className="absolute left-4 top-4">
                            {room.photos[0].directus_files_id.isModerated ? (
                              <Badge variant="outline" className="bg-red-900 text-orange-100 border-orange-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Foto En Revisión
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-900 text-green-100 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Foto Aprobada
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>

                    {isOwner && (
                      <div className="absolute gap-2 flex top-2 right-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEditRoom(room)}
                          className="rounded-full bg-white hover:bg-gray-100 text-gray-800 px-4 py-2"
                        >
                          <Pencil className="h-4 w-2" />
                          Editar
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => handleDeleteRoom(room)}
                          className="rounded-full bg-red-900 hover:bg-red-800 text-white px-3 py-2"
                        >
                          <Trash className="h-4 w-4" />
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
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Tarifa de limpieza: ${room.cleaningFee}</p>
                    {isOwner && (
                      <div className="absolute bottom-4 right-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleCalendarRoom(room)}
                          className="rounded-full bg-green-900 hover:bg-black text-white px-4 py-2 mt-2 right-0"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Calendario
                        </Button>
                      </div>
                    )}
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

      {/* Success Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            {updated === "property" ? (
              <>
                <DialogTitle className="text-xl">🏡 ¡Propiedad cargada con éxito!</DialogTitle>
                <DialogDescription className="text-md">
                  Los moderadores de la plataforma revisarán tus documentos legales y fotos. Una vez aprobados,
                  recibirás una notificación por email y tu propiedad quedará activa.
                  <br />
                  <br />
                  Mientras tanto, puedes empezar a agregar las habitaciones. ✨
                </DialogDescription>
              </>
            ) : updated === "room" ? (
              <>
                <DialogTitle className="text-xl">🛏️ ¡Felitaciones, Puedes disfrutar de tu habitación!</DialogTitle>
                <DialogDescription className="text-md">
                  Puedes seguir agregando más habitaciones o editar las que ya creaste.
                  <br />
                  <br />📸 <strong>Importante:</strong> Si agregaste nuevas fotos, serán revisadas para asegurar que
                  cumplan con las normas de la plataforma. Recibirás una notificación cuando sean aprobadas.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle className="text-xl">🔔 Acción no reconocida</DialogTitle>
                <DialogDescription className="text-md">
                  Parece que ocurrió algo inesperado. Intenta nuevamente o contacta al soporte si el problema persiste.
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <Button className="bg-[#39759E]" onClick={() => setShowModal(false)}>
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      {/* Cannot Delete Dialog */}
      <CannotDeleteDialog
        isOpen={showCannotDeleteDialog}
        onClose={() => setShowCannotDeleteDialog(false)}
        type={cannotDeleteType}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        type={cannotDeleteType}
        onConfirm={cannotDeleteType === "property" ? confirmDeleteProperty : confirmDeleteRoom}
      />
    </div>
  )
}

