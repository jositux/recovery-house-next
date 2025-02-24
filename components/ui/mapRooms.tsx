"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"

interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  rooms: number
  image: string
}

interface MapProps {
  markers: MapMarker[]
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const colombiaCenter = {
  lat: 4.570868,
  lng: -74.297333,
}

export function MapRooms({ markers }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  console.log(map)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map
    setMap(map)
    
  }, [])

  const onUnmount = useCallback(function callback() {
    mapRef.current = null
    setMap(null)
  }, [])

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      markers.forEach((marker) => {
        bounds.extend({ lat: marker.lat, lng: marker.lng })
      })
      mapRef.current.fitBounds(bounds)
    }
  }, [markers, mapRef]) // Removed unnecessary dependency: map

  if (!isLoaded) return <div>Cargando...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={colombiaCenter}
      zoom={6}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (

       <InfoWindow
         position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
         onCloseClick={() => setSelectedMarker(null)}
         options={{ disableAutoPan: false }}
       >
         <div className="relative max-w-xs bg-white rounded-lg shadow-lg overflow-hidden p-0">
           {/* Botón de cerrar personalizado */}
           <button
             onClick={() => setSelectedMarker(null)}
             className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors duration-200"
             aria-label="Cerrar"
           >
             <X size={16} />
           </button>
       
           <Link href={`/propiedades/${selectedMarker.id}`} className="block">
             {selectedMarker.image && (
               <Image
                 src={`${selectedMarker.image}?key=small`}
                 alt={selectedMarker.name}
                 width={200}
                 height={150}
                 className="w-full h-auto object-cover mb-3 rounded-lg"
               />
             )}
             <div className="px-4">
             <h3 className="font-bold text-lg text-[#39759E] hover:underline transition-all duration-200">
               {selectedMarker.name}
             </h3>
             <p className="text-[#162F40] mt-2">
             <span className="font-bold">{selectedMarker.rooms}</span> habitación(es) disponible(s)
           </p>
           </div>
           </Link>
           
         </div>
       </InfoWindow>
       
      )}
    </GoogleMap>
  )
}

