"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SelectionSearch from "@/components/selection-search"
import { RoomCard } from "@/components/ui/room-card"
import { MapRooms } from "@/components/ui/mapRooms"
import axios from "axios"
import styles from "./RoomsPage.module.css"
import { EyeOff, Eye } from "lucide-react"
import { RoomCardShared } from "@/components/ui/room-card3"

interface Image {
  id: string
  isModerated: boolean
}

type ImageRoom = {
  directus_files_id: {
    id: string
    isModerated: boolean
  }
}

interface Room {
  id: string
  name: string
  description: string
  isPrivate: boolean
  // Configuración de camas
  singleBeds: number
  doubleBeds: number
  // Total de camas y capacidad
  beds: number
  capacity: number
  // Precios para habitación privada o cama
  privateRoomPrice: string
  privateRoomCleaning: number

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: number
  sharedRoomCleaning: number

  bedType: string
  bedName: string
  photos: ImageRoom[]
  extraTags: { ExtraTags_id: string }[]
  servicesTags: { serviceTags_id: string }[]
  disableDates: string | null
  propertyLocation: {
    city: string
    state: string
    country: string
  }
}

interface Property {
  id: string
  name: string
  country: string
  region: string
  state: string
  city: string
  mainImage: Image
  taxIdApproved: boolean
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

const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

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
      const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

      try {
        const [propertiesResponse, bookingsResponse] = await Promise.all([
          axios.get("/webapi/items/Property", {
            params: {
              fields:
                "*,mainImage.id, mainImage.isModerated,Rooms.*, Rooms.photos.directus_files_id.id, Rooms.photos.directus_files_id.isModerated, Rooms.extraTags.*, Rooms.servicesTags.*",
            },
          }),
          axios.get(`/webapi/items/Booking?filter[checkOut][_gt]=${today}`),
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
        propertyLocation: {
          city: property.city,
          state: property.state,
          country: property.country,
        },
        coordinates: property.place?.coordinates,
        patology: property.patology ? property.patology.split(",").map((p) => p.trim()) : [],
      })),
    )
  }, [properties])

  // Función para convertir el string disableDates en un array de fechas
  const parseDisabledDates = (disableDates: string | null): string[] => {
    if (!disableDates) return []

    try {
      return JSON.parse(disableDates)
    } catch (error) {
      console.error("Error parsing disabled dates:", error)
      return []
    }
  }

  const isRoomAvailable = useMemo(
    () =>
      (roomId: string, checkIn: string, checkOut: string, bookings: Booking[], disabledDates: string[] = []) => {
        if (!checkIn || !checkOut) return true

        const requestedCheckIn = new Date(checkIn)
        const requestedCheckOut = new Date(checkOut)

        // Verificar si alguna fecha deshabilitada cae dentro del rango solicitado
        const hasDisabledDateInRange = disabledDates.some((disabledDate) => {
          const date = new Date(disabledDate)
          return date >= requestedCheckIn && date < requestedCheckOut
        })

        if (hasDisabledDateInRange) return false

        // Verificar si hay reservas que se solapan con las fechas solicitadas
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

    console.log("=== DEBUGGING ROOM FILTERING ===")
    console.log("Total rooms from API:", allRooms.length)

    return allRooms.filter((room) => {
      const property = properties.find((p) => p.Rooms.some((r) => r.id === room.id))

      // Debug: Check taxIdApproved
      if (!property || !property.taxIdApproved) {
        console.log(`Room ${room.id} filtered out - No property or taxIdApproved:`, {
          hasProperty: !!property,
          taxIdApproved: property?.taxIdApproved,
        })
        return false
      }

      const matchesProcedures =
        procedures.length === 0 ||
        procedures.some((proc) => room.patology.some((pat) => pat.toLowerCase().includes(proc.toLowerCase())))

      // Debug: Check procedures
      if (!matchesProcedures) {
        console.log(`Room ${room.id} filtered out - Procedures don't match:`, {
          roomPatology: room.patology,
          searchProcedures: procedures,
        })
        return false
      }

      const matchesLocation = location
        ? location
            .toLowerCase()
            .replace(/,/g, "")
            .split(" ")
            .every(
              (word) =>
                normalizeString(room.propertyLocation.city).includes(normalizeString(word)) ||
                normalizeString(room.propertyLocation.state).includes(normalizeString(word)) ||
                normalizeString(room.propertyLocation.country).includes(normalizeString(word)),
            )
        : true

      // Debug: Check location
      if (!matchesLocation) {
        console.log(`Room ${room.id} filtered out - Location doesn't match:`, {
          roomLocation: room.propertyLocation,
          searchLocation: location,
        })
        return false
      }

      const hasEnoughCapacity =
        room.isPrivate === false ? true : room.capacity === undefined || room.capacity >= travelers

      // Debug: Check capacity
      if (!hasEnoughCapacity) {
        console.log(`Room ${room.id} filtered out - Not enough capacity:`, {
          roomCapacity: room.capacity,
          requiredTravelers: travelers,
          isPrivate: room.isPrivate,
          note:
            room.isPrivate === false ? "Shared room - capacity check skipped" : "Private room - capacity check applied",
        })
        return false
      }

      const disabledDates = parseDisabledDates(room.disableDates)
      const isAvailable = isRoomAvailable(room.id, checkIn, checkOut, bookings, disabledDates)

      // Debug: Check availability
      if (!isAvailable) {
        console.log(`Room ${room.id} filtered out - Not available:`, {
          checkIn,
          checkOut,
          disabledDates,
          hasBookingConflict: bookings.some((booking) => booking.room === room.id),
        })
        return false
      }

      console.log(`Room ${room.id} PASSED all filters`)
      return true
    })

    console.log("Filtered rooms count:", filteredRooms.length)
    console.log("=== END DEBUGGING ===")
  }, [allRooms, searchParams, bookings, isRoomAvailable, properties])

  useEffect(() => {
    const newVisibleRooms = filteredRooms.map((room) => room.id)
    setVisibleRooms((prevVisibleRooms) => {
      const roomsToRemove = prevVisibleRooms.filter((id) => !newVisibleRooms.includes(id))

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

  const transformImageRoomToImage = (fileData: ImageRoom): Image => {
    if (!fileData || !fileData.directus_files_id) {
      return { id: "", isModerated: false }
    }
    return {
      id: fileData.directus_files_id.id || "",
      isModerated: fileData.directus_files_id.isModerated || false,
    }
  }

  const getImageSrc = useMemo(
    () => (image: Image) => {
      return image.isModerated ? "/assets/empty.jpg" : `/webapi/assets/${image.id}`
    },
    [],
  )

  const mapMarkers = useMemo(() => {
    const markerMap = new Map()

    filteredRooms.forEach((room) => {
      const property = properties.find((p) => p.Rooms.some((r) => r.id === room.id))
      if (property && room.coordinates) {
        const [lat, lng] = room.coordinates
        const key = `${lat},${lng}`

        if (!markerMap.has(key)) {
          markerMap.set(key, {
            id: property.id,
            name: room.propertyName,
            lat,
            lng,
            rooms: 1,
            image: getImageSrc(property.mainImage) || "/assets/empty.jpg",
          })
        } else {
          const marker = markerMap.get(key)
          marker.rooms += 1
        }
      }
    })

    return Array.from(markerMap.values())
  }, [filteredRooms, properties])

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
      <div
        className={`flex lg:flex-row mt-8 p-4 lg:p-0 md:p-0 mb-16 transition-all duration-300 ease-in-out ${
          isMapVisible ? "gap-0 lg:gap-6" : "gap-0"
        }`}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isMapVisible ? "w-full lg:w-2/3 hidden lg:block" : "w-full pr-0 lg:pr-8"
          }`}
        >
          <div className="mb-4 text-lg font-semibold text-[#162F40]">
            {filteredRooms.length} {filteredRooms.length === 1 ? "resultado" : "resultados"}
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              isMapVisible ? "lg:grid-cols-3" : "lg:grid-cols-4"
            } gap-6 auto-rows-fr`}
          >
            {currentRooms.map((room, index) => {
              const roomId =
                searchParams?.get("checkIn") || searchParams?.get("checkOut") || searchParams?.get("travelers")
                  ? `${room.id}?${new URLSearchParams({
                      checkIn: searchParams.get("checkIn") || "",
                      checkOut: searchParams.get("checkOut") || "",
                      travelers: searchParams.get("travelers") || "1",
                    }).toString()}`
                  : room.id

              const imageSrc =
                room.photos && room.photos.length > 0 && getImageSrc(transformImageRoomToImage(room.photos[0]))
                  ? `${getImageSrc(transformImageRoomToImage(room.photos[0]))}?key=medium`
                  : "/assets/empty.jpg"

              return (
                <div
                  key={`${room.id}-${refreshKey}`}
                  id={`room-${room.id}`}
                  className={`${styles.roomCard} ${
                    visibleRooms.includes(room.id) ? styles.fadeIn : ""
                  } h-full flex flex-col`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {room.isPrivate === false ? (
                    <RoomCardShared
                      id={roomId}
                      name={room.name}
                      description={room.description || ""}
                      bedPrice={room.sharedRoomPrice || 0}
                      bedCleaning={room.sharedRoomCleaning || 0}
                      bedType={room.bedType || "single"}
                      bedName={room.bedName || ""}
                      image={imageSrc}
                      propertyName={room.propertyName || ""}
                      country={room.propertyLocation?.country || ""}
                      state={room.propertyLocation?.state || ""}
                      city={room.propertyLocation?.city || ""}
                    />
                  ) : (
                    <RoomCard
                      id={roomId}
                      name={room.name}
                      description={room.description || ""}
                      price={room.privateRoomPrice ? Number.parseFloat(room.privateRoomPrice) : 0}
                      image={imageSrc}
                      propertyName={room.propertyName || ""}
                      country={room.propertyLocation?.country || ""}
                      state={room.propertyLocation?.state || ""}
                      city={room.propertyLocation?.city || ""}
                    />
                  )}
                </div>
              )
            })}
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
          className={`transition-all duration-300 ease-in-out ${
            isMapVisible ? "w-full lg:w-1/3 opacity-100 visible" : "w-0 opacity-0 invisible"
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
        aria-label={isMapVisible ? "Mostrar habitaciones" : "Mostrar mapa"}
      >
        {isMapVisible ? (
          <>
            <EyeOff className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">Mostrar habitaciones</span>
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
    <main className="flex flex-col min-h-screen lg:pl-8 md:pl-8">
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Cargando...</div>}>
        <RoomsPageContent />
      </Suspense>
    </main>
  )
}
