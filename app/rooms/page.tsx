"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import SelectionSearch from "@/components/selection-search"
import { RoomCard } from "@/components/ui/room-card"
import { MapRooms } from "@/components/ui/mapRooms"
import axios from "axios"
import styles from "./RoomsPage.module.css"
import { EyeOff, Eye } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string
  pricePerNight: string
  mainImage: string
  photos: {
    directus_files_id: {
      filename_download: string
    }
  }[]
  extraTags: { ExtraTags_id: string }[]
  servicesTags: { serviceTags_id: string }[]
}

interface Property {
  id: string
  name: string
  country: string
  region: string
  state: string
  city: string
  mainImage: string
  place: {
    type: string
    coordinates: [number, number]
  }
  description: string | null
  photos: {
    directus_files_id: {
      filename_download: string
    }
  }[]
  Rooms: Room[]
}

export default function RoomsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  //const searchTerm = ""
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const roomsPerPage = 12
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["all"])
  const [isMapVisible, setIsMapVisible] = useState(false)

  const prevPropertiesRef = useRef<Property[]>([])

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedOptions(newSelection)
  }

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => !prev)
  }

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get("/webapi/items/Property", {
          params: {
            fields:
              "*,photos.directus_files_id.*, Rooms.*, Rooms.photos.directus_files_id.*, Rooms.extraTags.*, Rooms.servicesTags.*",
          },
        })

        // Solo actualizamos el estado si los datos han cambiado
        if (JSON.stringify(response.data.data) !== JSON.stringify(prevPropertiesRef.current)) {
          setProperties(response.data.data)
          prevPropertiesRef.current = response.data.data // Guardamos los datos anteriores
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching rooms:", error)
        setError("Error al cargar las habitaciones. Por favor, intenta de nuevo más tarde.")
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const allRooms = useMemo(() => {
    return properties.flatMap((property) =>
      property.Rooms.map((room) => ({
        ...room,
        propertyName: property.name,
        propertyLocation: `${property.city}, ${property.state}, ${property.country}`,
        coordinates: property.place?.coordinates,
      })),
    )
  }, [properties])

  const filteredRooms = useMemo(() => {
    const filtered = allRooms.filter(
      (room) =>
        room.name.toLowerCase().includes("") ||
        room.description.toLowerCase().includes("") ||
        room.propertyName.toLowerCase().includes("") ||
        room.propertyLocation.toLowerCase().includes("") ||
        room.pricePerNight.includes(""),
    )
    return filtered.reverse()
  }, [allRooms])

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)

  const indexOfLastRoom = currentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)

  const mapMarkers = useMemo(() => {
    return properties
      .filter((property) => property.place && property.place.coordinates)
      .map((property) => ({
        id: property.id,
        name: property.name,
        lat: property.place.coordinates[0],
        lng: property.place.coordinates[1],
        rooms: property.Rooms.length,
        image: property.mainImage,
      }))
  }, [properties])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <main className="flex flex-col min-h-screen pl-8">
      <div className="mx-auto w-full">
        <div className="flex py-8">
          <SelectionSearch initialSelected={selectedOptions} onChange={handleSelectionChange} />
        </div>
        <div className={`flex transition-all duration-300 ease-in-out ${isMapVisible ? "gap-6" : "gap-0"}`}>
          <div className={`transition-all duration-300 ease-in-out ${isMapVisible ? "w-2/3" : "w-full pr-8"}`}>
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${isMapVisible ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 auto-rows-fr`}
            >
              {currentRooms.map((room) => (
                <div
                  key={room.id}
                  id={`room-${room.id}`}
                  className={`${styles.fade} ${styles["fade-visible"]}`}
                >
                  <RoomCard
                    id={room.id}
                    name={room.name}
                    description={room.description}
                    price={Number.parseFloat(room.pricePerNight)}
                    image={`/webapi/assets/${room.mainImage}?key=medium`}
                    propertyName={room.propertyName}
                  />
                </div>
              ))}
            </div>
            {filteredRooms.length === 0 && (
              <p className="text-center text-[#162F40] mt-8">
                No se encontraron habitaciones que coincidan con tu búsqueda.
              </p>
            )}
            {filteredRooms.length > 0 && (
              <div className="flex justify-center mt-8 mb-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      page === currentPage ? "bg-[#39759E] text-white" : "bg-gray-200 text-[#162F40]"
                    } flex items-center justify-center`}
                    aria-label={`Página ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMapVisible ? "w-1/3 opacity-100 visible" : "w-0 opacity-0 invisible"
            }`}
          >
            <div className="h-[calc(100vh-0px)] rounded-lg sticky top-0">
              <MapRooms markers={mapMarkers} />
            </div>
          </div>
        </div>
        <button
          onClick={toggleMapVisibility}
          className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-lg z-10 flex items-center"
          aria-label={isMapVisible ? "Ocultar mapa" : "Mostrar mapa"}
        >
          {isMapVisible ? (
            <>
              <EyeOff className="w-6 h-6 mr-2" />
              <span className="text-sm font-medium">Ocultar mapa</span>
            </>
          ) : (
            <>
              <Eye className="w-6 h-6 mr-2" />
              <span className="text-sm font-medium">Mostrar mapa</span>
            </>
          )}
        </button>
      </div>
    </main>
  )
}

