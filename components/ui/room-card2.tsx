import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Users, BedSingle, BedDouble } from "lucide-react"

interface RoomCardProps {
  id: string
  name: string
  description: string
  singleBedPrice: number
  doubleBedPrice: number
  image: string
  propertyName: string
  country: string
  state: string
  city: string
}

export function RoomCardShared({
  id,
  name,
  image,
  propertyName,
  country,
  state,
  city,
  singleBedPrice,
  doubleBedPrice,
}: RoomCardProps) {
  
  return (
    <Card className="overflow-hidden h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/rooms/${id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-xl"
          />
          {/* Icono y texto de habitación compartida */}
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white py-1 px-2 rounded-full shadow-md">
            <Users size={16} color="#333" />
            <span className="text-sm text-gray-800">Compartido</span>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-2">{propertyName}</p>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          <span>{`${city}, ${state}, ${country}`}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
        <div className="text-gray-800 space-y-1">
          {singleBedPrice > 0 && (
            <div className="text-base font-bold flex items-center space-x-1">
              <BedSingle size={16} />
              <span>${singleBedPrice} <span className="text-sm font-normal">USD / noche (simple)</span></span>
              
            </div>
          )}
          {doubleBedPrice > 0 && (
            <div className="text-base font-bold flex items-center space-x-1">
             <BedDouble size={16} />
              <span>${doubleBedPrice} <span className="text-sm font-normal">USD / noche (doble)</span></span>
              
            </div>
          )}
          {singleBedPrice <= 0 && doubleBedPrice <= 0 && (
            <div className="text-sm text-gray-500 italic">Precio no disponible</div>
          )}
        </div>
        <Link href={`/rooms/${id}`}>
          <Button variant="outline" className="rounded-full">
            Ver
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
