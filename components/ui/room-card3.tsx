import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, BedSingle, BedDouble } from "lucide-react";

interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  bedType: string;
  bedName: string;
  bedPrice: number;
  bedCleaning: number;
  image: string;
  propertyName: string;
  country: string;
  state: string;
  city: string;
  lang: string;
}

export function RoomCardShared({
  id,
  name,
  image,
  propertyName,
  country,
  state,
  city,
  bedType,
  bedName,
  bedPrice,
  lang,
}: RoomCardProps) {
  const isSpanish = lang === "es";

  return (
    <Card className="overflow-hidden h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/${lang}/rooms/${id}`}>
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
            {bedType === "single" ? (
              <BedSingle size={16} color="#333" />
            ) : (
              <BedDouble size={16} color="#333" />
            )}
            <span className="text-sm text-gray-800">
            {isSpanish ? "Habitación compartida" : "Shared Room"}
              {/*
              {isSpanish ? "1 Cama" : "1 Bed"}{" "}
              {bedType === "single"
                ? isSpanish
                  ? "Sencilla - Hab. compartida"
                  : "Single - Shared Room"
                : isSpanish
                ? "Doble - Hab. compartida"
            : "Double - Sahred Room"}*/}
            </span>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {bedName && `${bedName} - `}
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{propertyName}</p>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          <span>{`${city}, ${state}, ${country}`}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
        <div className="text-gray-800 space-y-1">
          {bedPrice > 0 && (
            <div className="text-base font-bold flex items-center space-x-1">
              <BedSingle size={16} />
              <span className="inline-flex items-baseline gap-1">
                <span className="text-lg font-semibold">
                  {bedPrice?.toLocaleString(isSpanish ? "es-ES" : "en-US")}
                </span>

                <span className="text-sm font-normal">
                  {isSpanish ? "USD / noche" : "USD / night"}
                </span>
              </span>
            </div>
          )}

          {bedPrice <= 0 && (
            <div className="text-sm text-gray-500 italic">
              {isSpanish ? "Precio no disponible" : "Price not available"}
            </div>
          )}
        </div>
        <Link href={`/${lang}/rooms/${id}`}>
          <Button variant="outline" className="rounded-full">
            {isSpanish ? "Ver" : "View"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
