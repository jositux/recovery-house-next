"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import SelectionSearch from "@/components/selection-search"
import { RoomCard } from "@/components/ui/room-card"
import { RoomSearch } from "@/components/ui/room-search"
import { MapRooms } from "@/components/ui/mapRooms"
import axios from 'axios'
import styles from './RoomsPage.module.css'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const roomsPerPage = 9
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["all"])

  const prevPropertiesRef = useRef<Property[]>([]); // Ref para almacenar el estado anterior de properties

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedOptions(newSelection)
  }

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get('/webapi/items/Property', {
          params: {
            'fields': '*,photos.directus_files_id.*, Rooms.*, Rooms.photos.directus_files_id.*, Rooms.extraTags.*, Rooms.servicesTags.*'
          },
        });

        // Solo actualizamos el estado si los datos han cambiado
        if (JSON.stringify(response.data.data) !== JSON.stringify(prevPropertiesRef.current)) {
          setProperties(response.data.data);
          prevPropertiesRef.current = response.data.data; // Guardamos los datos anteriores
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Error al cargar las habitaciones. Por favor, intenta de nuevo más tarde.');
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []); // Dependencia vacía para ejecutar solo una vez al montar

  const allRooms = useMemo(() => {
    return properties.flatMap(property => 
      property.Rooms.map(room => ({
        ...room,
        propertyName: property.name,
        propertyLocation: `${property.city}, ${property.state}, ${property.country}`,
        coordinates: property.place?.coordinates
      }))
    );
  }, [properties]);

  const filteredRooms = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = allRooms.filter(room => 
      room.name.toLowerCase().includes(lowercasedSearchTerm) ||
      room.description.toLowerCase().includes(lowercasedSearchTerm) ||
      room.propertyName.toLowerCase().includes(lowercasedSearchTerm) ||
      room.propertyLocation.toLowerCase().includes(lowercasedSearchTerm) ||
      room.pricePerNight.includes(lowercasedSearchTerm)
    );
    return filtered.reverse();
  }, [allRooms, searchTerm]);

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const mapMarkers = useMemo(() => {
    return properties
      .filter(property => property.place && property.place.coordinates)
      .map(property => ({
        id: property.id,
        name: property.name,
        lat: property.place.coordinates[0],
        lng: property.place.coordinates[1],
        rooms: property.Rooms.length,
        image: property.mainImage,
      }));
  }, [properties]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <main className="flex flex-col min-h-screen pl-8">
      <div className="mx-auto w-full">
        {/*<h1 className="text-3xl font-bold text-[#162F40] mb-6">
          Habitaciones disponibles
        </h1>
  <RoomSearch onSearch={handleSearch} />*/}
        <div className="flex py-8">
          <SelectionSearch initialSelected={selectedOptions} onChange={handleSelectionChange} />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentRooms.map((room) => (
                <div
                  key={room.id}
                  id={`room-${room.id}`}
                  className={`${styles.fade} ${styles['fade-visible']}`}
                >
                 
                  <RoomCard
                    id={room.id}
                    name={room.name}
                    description={room.description}
                    price={parseFloat(room.pricePerNight)}
                    image={`/webapi/assets/${room.mainImage}?key=medium`}
                    propertyName={room.propertyName}
                  />
                </div>
              ))}
            </div>
            {filteredRooms.length === 0 && (
              <p className="text-center text-[#162F40] mt-8">No se encontraron habitaciones que coincidan con tu búsqueda.</p>
            )}
            {filteredRooms.length > 0 && (
           
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      page === currentPage ? 'bg-[#39759E] text-white' : 'bg-gray-200 text-[#162F40]'
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
          <div className="lg:w-1/3 h-[calc(100vh-200px)] rounded-full sticky top-6">
            <MapRooms markers={mapMarkers} />
          </div>
        </div>
      </div>
    </main>
  )
}
