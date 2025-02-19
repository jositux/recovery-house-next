"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  capacity?: number
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
  patology: string
}

interface Booking {
  id: string
  status: string
  checkOut: string
  checkIn: string
  patient: string | null
  room: string
  guests: number
  price: string
  cleaning: string
}

function RoomsPageContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const roomsPerPage = 100
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["all"])
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [visibleRooms, setVisibleRooms] = useState<string[]>([])

  const prevPropertiesRef = useRef<Property[]>([])

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedOptions(newSelection)
  }

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => !prev)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [propertiesResponse, bookingsResponse] = await Promise.all([
          axios.get("/webapi/items/Property", {
            params: {
              fields:
                "*,photos.directus_files_id.*, Rooms.*, Rooms.photos.directus_files_id.*, Rooms.extraTags.*, Rooms.servicesTags.*",
            },
          }),
          axios.get("/webapi/items/Booking"),
        ])

        if (JSON.stringify(propertiesResponse.data.data) !== JSON.stringify(prevPropertiesRef.current)) {
          setProperties(propertiesResponse.data.data)
          prevPropertiesRef.current = propertiesResponse.data.data
        }

        setBookings(bookingsResponse.data.data)
        setIsLoading(false)
        setRefreshKey((prev) => prev + 1) // Increment refresh key to trigger animation
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const allRooms = useMemo(() => {
    return properties.flatMap((property) =>
      property.Rooms.map((room) => ({
        ...room,
        propertyName: property.name,
        propertyLocation: `${property.city}, ${property.state}, ${property.country}`,
        coordinates: property.place?.coordinates,
        patology: property.patology ? property.patology.split(",").map((p) => p.trim()) : [],
      })),
    )
  }, [properties])

  const isRoomAvailable = useMemo(
    () => (roomId: string, checkIn: string, checkOut: string, bookings: Booking[]) => {
      const requestedCheckIn = new Date(checkIn)
      const requestedCheckOut = new Date(checkOut)

      return !bookings.some((booking) => {
        if (booking.room !== roomId) return false

        const bookingCheckIn = new Date(booking.checkIn)
        const bookingCheckOut = new Date(booking.checkOut)

        return (
          (requestedCheckIn >= bookingCheckIn && requestedCheckIn < bookingCheckOut) ||
          (requestedCheckOut > bookingCheckIn && requestedCheckOut <= bookingCheckOut) ||
          (requestedCheckIn <= bookingCheckIn && requestedCheckOut >= bookingCheckOut)
        )
      })
    },
    [],
  )

  const filteredRooms = useMemo(() => {
    const procedures = searchParams?.get("procedures")?.split(",") || []
    const location = searchParams?.get("location") || ""
    const checkIn = searchParams?.get("checkIn") || ""
    const checkOut = searchParams?.get("checkOut") || ""
    const travelers = Number.parseInt(searchParams?.get("travelers") || "1", 10)

    return allRooms
      .filter((room) => {
        const matchesProcedures =
          procedures.length === 0 ||
          procedures.some((proc) => room.patology.some((pat) => pat.toLowerCase().includes(proc.toLowerCase())))
        const matchesLocation = room.propertyLocation.toLowerCase().includes(location.toLowerCase())
        const hasEnoughCapacity = room.capacity === undefined || room.capacity >= travelers
        const isAvailable = isRoomAvailable(room.id, checkIn, checkOut, bookings)

        return matchesProcedures && matchesLocation && hasEnoughCapacity && isAvailable
      })
      .reverse()
  }, [allRooms, searchParams, bookings, isRoomAvailable])

  useEffect(() => {
    const newVisibleRooms = filteredRooms.map((room) => room.id)
    setVisibleRooms((prevVisibleRooms) => {
      const roomsToRemove = prevVisibleRooms.filter((id) => !newVisibleRooms.includes(id))
      //const roomsToAdd = newVisibleRooms.filter((id) => !prevVisibleRooms.includes(id))

      // Trigger fade-out for rooms that are being removed
      roomsToRemove.forEach((id) => {
        const element = document.getElementById(`room-${id}`)
        if (element) {
          element.classList.remove(styles.fadeIn)
          element.classList.add(styles.fadeOut)
        }
      })

      // After fade-out animation, update the visible rooms
      setTimeout(() => {
        setVisibleRooms(newVisibleRooms)
      }, 500) // Match this with the animation duration

      return prevVisibleRooms
    })
  }, [filteredRooms])

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
    <div className="mx-auto w-full">
      <div className="flex py-8 hidden">
        <SelectionSearch initialSelected={selectedOptions} onChange={handleSelectionChange} />
      </div>
      <div className={`flex mt-8 mb-16 transition-all duration-300 ease-in-out ${isMapVisible ? "gap-6" : "gap-0"}`}>
        <div className={`transition-all duration-300 ease-in-out ${isMapVisible ? "w-2/3" : "w-full pr-8"}`}>
          {/* Add the results counter here */}
          <div className="mb-4 text-lg font-semibold text-[#162F40]">
            {filteredRooms.length} {filteredRooms.length === 1 ? "resultado" : "resultados"}
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${isMapVisible ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 auto-rows-fr`}
          >
            {currentRooms.map((room, index) => (
              <div
                key={`${room.id}-${refreshKey}`}
                id={`room-${room.id}`}
                className={`${styles.roomCard} ${visibleRooms.includes(room.id) ? styles.fadeIn : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RoomCard
                  id={room.id}
                  name={room.name}
                  description={room.description}
                  price={Number.parseFloat(room.pricePerNight)}
                  image={`/webapi/assets/${room.mainImage}?key=medium`}
                  propertyName={room.propertyName}
                  country={room.propertyLocation.split(", ")[2]}
                  state={room.propertyLocation.split(", ")[1]}
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
            <div className="hidden flex justify-center mt-8 mb-8 gap-2">
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
  )
}

export default function RoomsPage() {
  return (
    <main className="flex flex-col min-h-screen pl-8">
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Cargando...</div>}>
        <RoomsPageContent />
      </Suspense>
    </main>
  )
}

