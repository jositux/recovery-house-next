"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Importaciones de Swiper (pesadas: se separan en su propio chunk, ver popup-swiper-gallery.tsx)
import { Swiper, SwiperSlide } from "swiper/react"
import { Swiper as SwiperType } from "swiper"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface GalleryContentProps {
  images: {
    src: string
    alt: string
  }[]
  autoplay?: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function GalleryContent({ images, autoplay = true, isOpen, onOpenChange }: GalleryContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.realIndex)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Detalles de la propiedad</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="sm:max-w-4xl p-0 bg-transparent border-none shadow-none">
        <div className="relative rounded-lg overflow-hidden">
          {/* Swiper principal */}
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            autoplay={
              autoplay
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                  }
                : false
            }
            loop={true}
            onSwiper={() => {}}
            onSlideChange={handleSlideChange}
            className="w-full h-[70vh] rounded-lg bg-black/90"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </SwiperSlide>
            ))}

            {/* Botones de navegación personalizados */}
            <div className="swiper-button-prev !w-8 !h-8 !bg-white/80 hover:!bg-white !shadow-md !rounded-full !text-gray-800 !left-4">
              <ChevronLeft className="!h-4 !w-4 !fill-none" />
            </div>
            <div className="swiper-button-next !w-8 !h-8 !bg-white/80 hover:!bg-white !shadow-md !rounded-full !text-gray-800 !right-4">
              <ChevronRight className="!h-4 !w-4 !fill-none" />
            </div>
          </Swiper>

          {/* Paginación personalizada */}
          <div className="swiper-pagination !bottom-4 !z-10"></div>
          <div className="absolute bottom-4 left-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1}/{images.length}
          </div>

          {/* Botón para cerrar */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            aria-label="Cerrar galería"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
