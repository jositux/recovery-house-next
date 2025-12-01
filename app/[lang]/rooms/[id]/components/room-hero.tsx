import { MagicBackButton } from "@/components/ui/magic-back-button"
import { PopupSwiperGallery } from "../popup-swiper-gallery"
import Image from "next/image"

interface RoomHeroProps {
  imageSrc: string
  propertyName: string
  images: { src: string; alt: string }[]
  lang: string
}

export function RoomHero({ imageSrc, propertyName, images, lang }: RoomHeroProps) {
  
  const isSpanish = lang === "es";

  return (
    <>
      <div className="relative h-[500px] w-full">
      <Image
  src={imageSrc || "/placeholder.svg"}
  alt={propertyName}
  fill
  className="object-cover"
  sizes="100vw"
/>
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="container mx-auto px-4 lg:px-20">
            <MagicBackButton />
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="container relative mx-auto px-4 lg:px-20">
          <div className="absolute left-20 bottom-8">
            <PopupSwiperGallery
  images={images}
  buttonText={isSpanish ? "Ver todas las fotos" : "View all photos"}
  autoplay={true}
/>
          </div>
        </div>
      )}
    </>
  )
}
