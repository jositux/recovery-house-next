"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { RoomCard } from "@/components/ui/room-card"
import { RoomSearch } from "@/components/ui/room-search"
import { MapRooms } from "@/components/ui/mapRooms"
import axios from 'axios'

interface Room {
  id: string
  name: string
  description: string
  pricePerNigth: string
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
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const roomsPerPage = 9

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get('/api/items/Property', {
          params: {
            'fields': '*,photos.directus_files_id.*, Rooms.*, Rooms.photos.directus_files_id.*, Rooms.extraTags.*, Rooms.servicesTags.*'
          },
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        })
        setProperties(response.data.data)
      } catch (error) {
        console.error('Error fetching rooms:', error)
        setError('Error al cargar las habitaciones. Por favor, intenta de nuevo más tarde.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const allRooms = useMemo(() => {
    return properties.flatMap(property => 
      property.Rooms.map(room => ({
        ...room,
        propertyName: property.name,
        propertyLocation: `${property.city}, ${property.state}, ${property.country}`,
        coordinates: property.place?.coordinates
      }))
    )
  }, [properties])

  const filteredRooms = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return allRooms.filter(room => 
      room.name.toLowerCase().includes(lowercasedSearchTerm) ||
      room.description.toLowerCase().includes(lowercasedSearchTerm) ||
      room.propertyName.toLowerCase().includes(lowercasedSearchTerm) ||
      room.propertyLocation.toLowerCase().includes(lowercasedSearchTerm) ||
      room.pricePerNigth.includes(lowercasedSearchTerm)
    )
  }, [allRooms, searchTerm])

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, [])

  const indexOfLastRoom = currentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)

  const mapMarkers = useMemo(() => {
    return properties
      .filter(property => property.place && property.place.coordinates)
      .map(property => ({
        id: property.id,
        name: property.name,
        lat: property.place.coordinates[1],
        lng: property.place.coordinates[0],
        rooms: property.Rooms.length,
        image: property.photos && property.photos[0] ? property.photos[0].directus_files_id.filename_download : undefined
      }))
  }, [properties])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <main className="flex flex-col min-h-screen p-6">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Habitaciones disponibles
        </h1>
        <RoomSearch onSearch={handleSearch} />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentRooms.map((room) => (
                <div key={room.id} id={`room-${room.id}`}>
                  <RoomCard
                    id={room.id}
                    name={room.name}
                    description={room.description}
                    price={parseFloat(room.pricePerNigth)}
                    image={`/api/assets/${room.mainImage}`}
                    propertyName={room.propertyName}
                  />
                </div>
              ))}
            </div>
            {filteredRooms.length === 0 && (
              <p className="text-center text-gray-500 mt-8">No se encontraron habitaciones que coincidan con tu búsqueda.</p>
            )}
            {filteredRooms.length > 0 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      page === currentPage ? 'bg-[#4A7598] text-white' : 'bg-gray-200 text-gray-600'
                    } flex items-center justify-center`}
                    aria-label={`Página ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:w-1/3 h-[calc(100vh-200px)] sticky top-6">
            <MapRooms markers={mapMarkers} />
          </div>
        </div>
      </div>
    </main>
  )
}

