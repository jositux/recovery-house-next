import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, User } from "lucide-react";

interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  propertyName: string;
  country: string;
  state: string;
  city: string;
  lang: string;
}

export function RoomCard({
  id,
  name,
  price,
  image,
  propertyName,
  country,
  state,
  city,
  lang,
}: RoomCardProps) {
  const isSpanish = lang === "es";

  return (
    <Card className="overflow-hidden h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/rooms/${id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover rounded-t-xl"
          />

          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white px-2 py-1 rounded-full shadow-md">
            <User size={16} color="#333" />
            <span className="text-sm text-gray-800">
              {isSpanish ? "Habitación Privada" : "Private Room"}
            </span>
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
        {price > 0 ? (
          <span className="text-lg font-bold text-gray-800">
            {price.toLocaleString(isSpanish ? "es-ES" : "en-US")}{" "}
            <span className="text-sm font-normal">
              {isSpanish ? "USD / noche" : "USD / night"}
            </span>
          </span>
        ) : (
          <span className="text-sm text-gray-500 italic">
            {isSpanish ? "Precio no disponible" : "Price not available"}
          </span>
        )}

        <Link href={`/rooms/${id}`}>
          <Button variant="outline" className="rounded-full">
            {isSpanish ? "Ver" : "View"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
