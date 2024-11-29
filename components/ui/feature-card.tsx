import Image from "next/image"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

interface FeatureCardProps {
  title: string
  description: string
  imageSrc: string
}


export function FeatureCard({ title, description, imageSrc }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <h3 className={`${fraunces.className} text-2xl text-gray-800`}>{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

