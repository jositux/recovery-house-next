import Link from "next/link"

interface RoomCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  propertyName: string
}

export function RoomCard({ id, name, description, price, image, propertyName }: RoomCardProps) {
  
  console.log(image)
  const imageSrc = image || "/placeholder.svg?height=300&width=400";

  return (
    <Link href={`/rooms/${id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3">
        <img
          src={imageSrc}
          alt={name}
          className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-lg text-[#162F40]">{name || 'Habitación sin nombre'}</h3>
        <p className="text-sm text-[#162F40]">{propertyName || 'Propiedad desconocida'}</p>
        <p className="text-[#162F40] text-sm line-clamp-2">{description || 'Sin descripción'}</p>
        <p className="font-bold text-[#39759E]">
          ${(price || 0).toLocaleString('es-CO')} <span className="text-[#162F40] font-normal">COP por noche</span>
        </p>
      </div>
    </Link>
  )
}
