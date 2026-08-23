"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Fraunces } from "next/font/google"
import Link from "next/link"

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
  ]

  // Multiplicamos para crear el buffer de loop infinito
  const cards = [...baseCards, ...baseCards, ...baseCards]

  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const isAdjustingRef = useRef(false)

  // Loop infinito silencioso al hacer scroll
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

  // Autoplay continuo
  useEffect(() => {
    const interval = setInterval(() => {
      const slider = sliderRef.current
      if (slider && !isDragging) {
        slider.style.scrollBehavior = "smooth"
        // Avanza el ancho exacto de una tarjeta + el gap
        const step = slider.clientWidth * 0.82 + 16
        slider.scrollBy({ left: step, behavior: "smooth" })
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isDragging])

  // Soporte Drag para mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    sliderRef.current.style.scrollBehavior = "auto"
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    sliderRef.current.scrollLeft = scrollLeft - walk
    checkInfiniteLoop()
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div
        ref={sliderRef}
        onScroll={checkInfiniteLoop}
        /* 
           pl-4 pr-12: Padding izquierdo para alinear la primera tarjeta con el margen del sitio
           gap-4: Espaciado entre la tarjeta visible y el "peek" de la siguiente
           [scrollbar-width:none] / [&::-webkit-scrollbar]:hidden: Oculta la barra de scroll completamente
        */
        className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 pl-4 pr-12 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            /* 🛑 w-[82vw] hace que ocupe el 82% del ancho y deje asomar un ~15% de la tarjeta a la derecha */
            className="w-[82vw] flex-shrink-0 snap-start"
          >
            <Card className="w-full border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex flex-col">
                <Link href={card.url} className="block w-full">
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
                      className={`${fraunces.className} text-left text-[12px] font-regular leading-[1.2] text-[#162F40]`}
                    >
                      {card.title}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}