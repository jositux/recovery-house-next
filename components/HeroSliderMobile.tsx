"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

const cards = [
  { title: "Conectamos pacientes con casas de recuperación", imageSrc: "/assets/hero-mobile/0.jpg" },
  { title: "Factores importantes de la experiencia del paciente", imageSrc: "/assets/hero-mobile/1.jpg" },
  { title: "Cuidado personalizado para tu recuperación", imageSrc: "/assets/hero-mobile/0.jpg" },
]

export function HeroSliderMobile() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current && !isDragging) {
        sliderRef.current.scrollLeft += sliderRef.current.offsetWidth
        if (sliderRef.current.scrollLeft >= sliderRef.current.scrollWidth - sliderRef.current.offsetWidth) {
          sliderRef.current.scrollLeft = 0
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="relative w-full overflow-hidden py-4 rounded-2xl">
      <button
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-2 hover:bg-white/90"
        onClick={() => sliderRef.current && (sliderRef.current.scrollLeft -= sliderRef.current.offsetWidth)}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>

      <div
        ref={sliderRef}
        className="flex w-full overflow-x-scroll scroll-smooth no-scrollbar snap-x snap-mandatory rounded-2xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cards.concat(cards).map((card, index) => (
          <div key={index} className="w-full flex-shrink-0 snap-start">
            <Card className="w-full shadow-none border-none">
              <CardContent className="p-0">
                <img src={card.imageSrc} alt={card.title} className="w-full rounded-2xl" />
                <p className={`${fraunces.className} mt-2 text-center text-xl font-normal leading-1.3 color-[162F40]`}>{card.title}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <button
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-2 hover:bg-white/90"
        onClick={() => sliderRef.current && (sliderRef.current.scrollLeft += sliderRef.current.offsetWidth)}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>
    </div>
  )
}
