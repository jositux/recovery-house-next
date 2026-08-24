"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

interface HeroSliderMobileProps {
  lang?: string
}

export function HeroSliderMobile({ lang = "es" }: HeroSliderMobileProps) {
  const isSpanish = lang === "es"

  const baseCards = [
    {
      title: isSpanish
        ? "¡Conectamos pacientes con casas de recuperación en todo el mundo!"
        : "We connect patients with recovery homes around the world!",
      imageSrc: "/assets/hero-mobile/1.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title: isSpanish
        ? "Los facilitadores de experiencia se encargarán de tu cuidado"
        : "Experience facilitators will take care of your recovery",
      imageSrc: "/assets/hero-mobile/2.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title: isSpanish
        ? "Proveedores de todo el mundo en áreas de salud esperan para atenderte"
        : "Health providers from all over the world are ready to assist you",
      imageSrc: "/assets/hero-mobile/3.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title: isSpanish
        ? "Un espacio pensado para tu recuperación, bienestar y tranquilidad en cada paso"
        : "A space designed for your recovery, wellness, and peace of mind at every step",
      imageSrc: "/assets/hero-mobile/4.jpg",
      url: `/${lang}/rooms`,
    },
  ]

  const cards = [...baseCards, ...baseCards, ...baseCards]

  const sliderRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const isAdjustingRef = useRef(false)

  // Loop infinito silencioso al scrollear
  const checkInfiniteLoop = useCallback(() => {
    const slider = sliderRef.current
    if (!slider || isAdjustingRef.current) return

    const singleSetWidth = slider.scrollWidth / 3
    const currentScroll = slider.scrollLeft

    if (currentScroll <= 5) {
      isAdjustingRef.current = true
      slider.style.scrollBehavior = "auto"
      slider.scrollLeft = singleSetWidth + currentScroll
      slider.style.scrollBehavior = ""
      isAdjustingRef.current = false
    } else if (currentScroll >= singleSetWidth * 2 - 5) {
      isAdjustingRef.current = true
      slider.style.scrollBehavior = "auto"
      slider.scrollLeft = currentScroll - singleSetWidth
      slider.style.scrollBehavior = ""
      isAdjustingRef.current = false
    }
  }, [])

  // Posicionar en el set central al cargar
  useEffect(() => {
    const slider = sliderRef.current
    if (slider) {
      slider.style.scrollBehavior = "auto"
      slider.scrollLeft = slider.scrollWidth / 3
      slider.style.scrollBehavior = ""
    }
  }, [])

  // Iniciar autoplay
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const slider = sliderRef.current
      if (slider && !isDragging) {
        slider.style.scrollBehavior = "smooth"
        const step = slider.clientWidth * 0.82 + 16
        slider.scrollBy({ left: step, behavior: "smooth" })
      }
    }, 4000)
  }, [isDragging])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startAutoplay])

  // Obtener coordenada X unificada para Mouse y Touch
  const getPageX = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return e.touches[0].pageX
    }
    return e.pageX
  }

  // Handlers unificados
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)

    setIsDragging(true)
    sliderRef.current.style.scrollBehavior = "auto"
    sliderRef.current.style.scrollSnapType = "none"

    const pageX = getPageX(e)
    setStartX(pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return

    const pageX = getPageX(e)
    const x = pageX - sliderRef.current.offsetLeft
    const walk = x - startX
    sliderRef.current.scrollLeft = scrollLeft - walk
    checkInfiniteLoop()
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (sliderRef.current) {
      sliderRef.current.style.scrollSnapType = "x mandatory"
    }

    startAutoplay()
  }

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div
        ref={sliderRef}
        onScroll={checkInfiniteLoop}
        className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 pl-4 pr-12 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="w-[82vw] flex-shrink-0 snap-start"
          >
            <Card className="w-full border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex flex-col">
                <div className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl bg-[#E0EDF6]">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="w-full h-full object-cover rounded-2xl"
                    draggable={false}
                  />
                </div>
                <div className="mt-4">
                  <p
                    className={`${fraunces.className} text-left text-xl font-normal leading-[1.2] text-[#162F40]`}
                  >
                    {card.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}