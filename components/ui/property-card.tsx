import Image from "next/image"
import Link from "next/link"

interface PropertyCardProps {
  title: string
  description: string
  price: number
  image: string
  id: string
}

export function PropertyCard({ title, description, price, image, id }: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-lg text-[#162F40]">{title}</h3>
        <p className="text-[#162F40] text-sm line-clamp-2">{description}</p>
        <p className="font-bold text-[#39759E]">
          ${price.toLocaleString('en-US')} <span className="text-[#162F40] font-normal">por noche</span>
        </p>
      </div>
    </Link>
  )
}

