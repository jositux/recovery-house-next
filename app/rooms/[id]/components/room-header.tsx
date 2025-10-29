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
}

export function RoomHeader({ roomName, propertyName, isPrivate, bedName, beds, capacity, bedType }: RoomHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
        {isPrivate === false && bedName?.trim() ? `${bedName} - ` : ""}
        {roomName}
      </h1>
      <p className="text-xl text-[#162F40] mb-4">{propertyName}</p>

      {isPrivate === true && beds && capacity && (
        <div className="flex items-center space-x-4 text-[#162F40]">
          <div className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            <span>
              {beds} {beds === 1 ? "cama en total" : "camas en total"}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>
              Capacidad: {capacity} {capacity === 1 ? "persona" : "personas"}
            </span>
          </div>
        </div>
      )}

      {isPrivate === false && bedType && (
        <div className="flex items-center mt-4 space-x-4 text-[#162F40]">
          {bedType === "double" ? (
            <div className="flex items-center">
              <BedDouble className="w-5 h-5 mr-2" />
              <span>1 cama doble</span>
            </div>
          ) : (
            <div className="flex items-center">
              <BedSingle className="w-5 h-5 mr-2" />
              <span>1 cama sencilla</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
