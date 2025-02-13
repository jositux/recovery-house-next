import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RoomCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  propertyName: string
}

export function RoomCard({ id, name, price, image, propertyName }: RoomCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/rooms/${id}`}>
      <div className="relative h-48 w-full">
        <Image src={image || "/placeholder.svg"} alt={name} layout="fill" objectFit="cover" className="rounded-t-xl" />
      </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-2">{propertyName}</p>
       {/* <p className="text-sm text-gray-500 line-clamp-2">{description}</p>  */}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
        <span className="text-lg font-bold text-gray-800">
          ${price} <span className="text-sm font-normal">/ noche</span>
        </span>
        <Link href={`/rooms/${id}`}>
        <Button variant="outline" className="rounded-full">
          Ver
        </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

