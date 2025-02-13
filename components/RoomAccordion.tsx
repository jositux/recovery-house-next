import { useState, useEffect, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GalleryUpload from "@/components/GalleryUpload"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { CollectionServiceTags } from "@/components/collectionServiceTags"
import { getExtraTags } from "@/services/extraTagsService"
import { getServiceTags } from "@/services/serviceTagsService"
import { PlusCircle, Hotel, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Room {
  id: string
  name: string
  roomNumber: string
  description: string
  beds: number
  capacity: number
  pricePerNight: string
  cleaningFee: string
  mainImage: string
  photos: string[]
  extraTags: string[]
  servicesTags: string[]
  propertyId: string
}

interface RoomAccordionProps {
  rooms?: Room[]
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>
}

const RoomAccordion = ({ rooms = [], setRooms }: RoomAccordionProps) => {
  const [extraTags, setExtraTags] = useState<{ id: string; name: string; icon: string, enable_property: boolean; enable_services: boolean; }[]>([])
  const [servicesTags, setServicesTags] = useState<{ id: string; name: string; icon: string }[]>([])
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        const extraTagsData = await getExtraTags()
        setExtraTags(extraTagsData)

        const servicesTagsData = await getServiceTags()
        setServicesTags(servicesTagsData)
      } catch (error) {
        console.error(error)
      }
    }
    loadTags()
  }, [])

  const handleTagsChange = (tags: string[], roomId: string) => {
    updateRoomsState((prevRooms) => prevRooms.map((room) => (room.id === roomId ? { ...room, extraTags: tags } : room)))
  }

  const handleServiceTagsChange = (tags: string[], roomId: string) => {
    updateRoomsState((prevRooms) =>
      prevRooms.map((room) => (room.id === roomId ? { ...room, servicesTags: tags } : room)),
    )
  }

  const updateRoomsState = (updateCallback: (prevRooms: Room[]) => Room[]) => {
    setRooms((prevRooms) => {
      const updatedRooms = updateCallback(prevRooms)
      if (JSON.stringify(prevRooms) !== JSON.stringify(updatedRooms)) {
        return updatedRooms
      }
      return prevRooms
    })
  }

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `Habitación ${rooms.length + 1}`,
      roomNumber: "",
      description: "",
      beds: 1,
      capacity: 1,
      pricePerNight: "",
      cleaningFee: "",
      mainImage: "",
      photos: [],
      extraTags: [],
      servicesTags: [],
      propertyId: "",
    }

    updateRoomsState((prevRooms) => [newRoom, ...prevRooms])
  }

  const updateRoom = <T extends keyof Room>(id: string, field: T, value: Room[T]) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === id) {
          let adjustedValue = value

          // Validar y ajustar pricePerNight y cleaningFee
          if ((field === "pricePerNight" || field === "cleaningFee") && typeof value === "string") {
            const numericValue = Number.parseFloat(value) || 0 // Convertir a número o usar 0 si no es válido
            adjustedValue = (numericValue < 0 ? 0 : numericValue).toString() as Room[T]
          }

          const updatedRoom = { ...room, [field]: adjustedValue }

          // Actualizar mainImage si el campo es 'photos'
          if (field === "photos" && Array.isArray(value)) {
            updatedRoom.mainImage = value.length > 0 ? value[0] : ""
          }

          return updatedRoom
        }

        return room
      }),
    )
  }

  const toggleRoom = (id: string) => setExpandedRoom(expandedRoom === id ? null : id)

  const deleteRoom = (id: string) => {
    if (rooms.length <= 1) return
    const updatedRooms = rooms.filter((room) => room.id !== id)

    const reorderedRooms = updatedRooms.map((room, index) => ({
      ...room,
      name: `Habitación ${updatedRooms.length - index}`,
    }))

    setRooms(reorderedRooms)
    if (expandedRoom === id) setExpandedRoom(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, id: string, field: keyof Room) =>
    updateRoom(id, field, e.target.value)

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>, id: string, field: keyof Room) =>
    updateRoom(id, field, Number.parseInt(e.target.value))

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>, id: string, field: keyof Room) =>
    updateRoom(id, field, e.target.value)

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button type="button" onClick={addRoom} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Habitación
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2 cursor-pointer" onClick={() => toggleRoom(room.id)}>
                  {room.mainImage ? (
                    <img
                      src={`/webapi/assets/${room.mainImage}`}
                      alt={room.name}
                      className="w-14 h-14 object-cover rounded-full mr-2"
                    />
                  ) : (
                    <Hotel className="h-5 w-5 text-blue-500 mr-2" />
                  )}
                  <span>{room.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {rooms.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRoom(room.id)}
                      aria-label={`Delete Room ${room.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRoom(room.id)}
                    aria-label={expandedRoom === room.id ? "Collapse room details" : "Expand room details"}
                  >
                    {expandedRoom === room.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence initial={false}>
                {expandedRoom === room.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm">Nombre</label>
                            <Input
                              placeholder="Ej. Habitación Azul"
                              value={room.name}
                              onChange={(e) => handleInputChange(e, room.id, "name")}
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm">Número</label>
                            <Input
                              placeholder="Ej. C4"
                              value={room.roomNumber}
                              onChange={(e) => handleInputChange(e, room.id, "roomNumber")}
                            />
                          </div>
                        </div>
                        <div>
                          <Textarea
                            placeholder="Describa la Habitación. Es muy importante que sea detallada."
                            value={room.description}
                            onChange={(e) => handleTextareaChange(e, room.id, "description")}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm">Camas</label>
                            <select
                              value={room.beds}
                              onChange={(e) => handleSelectChange(e, room.id, "beds")}
                              className="w-full p-2 border rounded"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bed) => (
                                <option key={bed} value={bed}>
                                  {bed}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 text-sm">Max. Huéspedes</label>
                            <select
                              value={room.capacity}
                              onChange={(e) => handleSelectChange(e, room.id, "capacity")}
                              className="w-full p-2 border rounded"
                            >
                              {[1, 2, 4, 6, 8, 10, 20].map((cap) => (
                                <option key={cap} value={cap}>
                                  {cap}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm">Precio x Noche</label>
                            <Input
                              type="number"
                              min=""
                              placeholder=""
                              value={room.pricePerNight}
                              onChange={(e) => updateRoom(room.id, "pricePerNight", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm">Precio x limpieza</label>
                            <Input
                              type="number"
                              min=""
                              placeholder=""
                              value={room.cleaningFee}
                              onChange={(e) => updateRoom(room.id, "cleaningFee", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="py-12">
                          <h3 className="block mb-1 text-sm">Subir Fotos de la Habitación</h3>
                          <GalleryUpload
                            initialIds={room.photos}
                            onGalleryChange={(newGallery) => updateRoom(room.id, "photos", newGallery)}
                          />
                        </div>
                        <label className="block mb-1 text-sm">Servicios Generales</label>
                        <CollectionServiceTags
                          onChange={(tags) => handleServiceTagsChange(tags, room.id)}
                          servicesTags={servicesTags}
                          initialSelectedTags={room.servicesTags}
                        />

                        <div className="py-4">
                          <label className="block mb-1 text-sm">Servicios Extras</label>

                          <CollectionExtraTags
                            onChange={(tags) => handleTagsChange(tags, room.id)}
                            extraTags={extraTags}
                            initialSelectedTags={room.extraTags}
                            enable="property"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default RoomAccordion

