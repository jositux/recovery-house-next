import { MagicBackButton } from "@/components/ui/magic-back-button"
import { PopupSwiperGallery } from "../popup-swiper-gallery"

interface RoomHeroProps {
  imageSrc: string
  propertyName: string
  images: { src: string; alt: string }[]
}

export function RoomHero({ imageSrc, propertyName, images }: RoomHeroProps) {
  return (
    <>
      <div className="relative h-[500px] w-full">
        <img src={imageSrc || "/placeholder.svg"} alt={propertyName} className="w-full h-full object-cover" />

        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="container mx-auto px-4 lg:px-20">
            <MagicBackButton />
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="container relative mx-auto px-4 lg:px-20">
          <div className="absolute left-20 bottom-8">
            <PopupSwiperGallery images={images} buttonText="Ver todas las fotos" autoplay={true} />
          </div>
        </div>
      )}
    </>
  )
}
