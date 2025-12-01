import { Bed, Users, BedSingle, BedDouble } from "lucide-react"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

interface RoomHeaderProps {
  roomName: string
  propertyName: string
  isPrivate: boolean
  bedName?: string
  beds?: number
  capacity?: number
  bedType?: string
  lang: string
}

export function RoomHeader({ roomName, propertyName, isPrivate, bedName, beds, capacity, bedType, lang }: RoomHeaderProps) {
  const isSpanish = lang === "es";
  
  // Variables de traducción
  const totalBedsText = isSpanish 
    ? (beds === 1 ? "cama en total" : "camas en total") 
    : (beds === 1 ? "total bed" : "total beds");
    
  const capacityText = isSpanish 
    ? `Capacidad: ${capacity} ${capacity === 1 ? "persona" : "personas"}` 
    : `Capacity: ${capacity} ${capacity === 1 ? "person" : "people"}`;
    
  const doubleBedText = isSpanish 
    ? "1 cama doble" 
    : "1 double bed";
    
  const singleBedText = isSpanish 
    ? "1 cama sencilla" 
    : "1 single bed";
  
  return (
    <div className="mb-6">
      <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
        {/* Lógica para mostrar el nombre de la cama en habitaciones compartidas */}
        {isPrivate === false && bedName?.trim() ? `${bedName} - ` : ""}
        {roomName}
      </h1>
      <p className="text-xl text-[#162F40] mb-4">{propertyName}</p>

      {/* Bloque para Habitaciones Privadas (Private) */}
      {isPrivate === true && beds !== undefined && capacity !== undefined && ( // Usamos !== undefined para tipado seguro
        <div className="flex items-center space-x-4 text-[#162F40]">
          <div className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            <span>
              {beds} {totalBedsText}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>
              {capacityText}
            </span>
          </div>
        </div>
      )}

      {/* Bloque para Habitaciones Compartidas (Shared Bed) */}
      {isPrivate === false && bedType && (
        <div className="flex items-center mt-4 space-x-4 text-[#162F40]">
          {bedType === "double" ? (
            <div className="flex items-center">
              <BedDouble className="w-5 h-5 mr-2" />
              <span>{doubleBedText}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <BedSingle className="w-5 h-5 mr-2" />
              <span>{singleBedText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}