import Image from "next/image"

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
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

