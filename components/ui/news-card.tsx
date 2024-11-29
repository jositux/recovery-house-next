import Image from "next/image"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })


interface NewsCardProps {
  title: string
  description: string
  imageSrc: string
}

export function NewsCard({ title, description, imageSrc }: NewsCardProps) {
  return (
    <div className="flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg mb-4">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className={`${fraunces.className} className="text-xl md:text-2xl font-medium text-gray-800 mb-2 font-fraunces`}>
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

