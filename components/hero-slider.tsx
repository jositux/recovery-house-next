"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./hero-slider.module.css"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    zIndex: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
  }),
}

interface HeroSliderProps {
  lang?: string
}

export function HeroSlider({ lang = "es" }: HeroSliderProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const sliderRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const slides = [
    {
      title:
        lang === "es"
          ? "¡Conectamos pacientes con casas de recuperación en todo el mundo!"
          : "We connect patients with recovery homes around the world!",
      image: "/assets/hero/1.png",
      backgroundImage: "/assets/hero/hero-bg.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title:
        lang === "es"
          ? "Los facilitadores de experiencia se encargarán de tu cuidado"
          : "Experience facilitators will take care of your recovery",
      image: "/assets/hero/2.png",
      backgroundImage: "/assets/hero/hero-bg.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title:
        lang === "es"
          ? "Proveedores de todo el mundo en áreas de salud esperan para atenderte"
          : "Health providers from all over the world are ready to assist you",
      image: "/assets/hero/3.png",
      backgroundImage: "/assets/hero/hero-bg.jpg",
      url: `/${lang}/rooms`,
    },
    {
      title:
        lang === "es"
          ? "Un espacio pensado para tu recuperación, bienestar y tranquilidad en cada paso"
          : "A space designed for your recovery, wellness, and peace of mind at every step",
      image: "/assets/hero/4.png",
      backgroundImage: "/assets/hero/hero-bg.jpg",
      url: `/${lang}/rooms`,
    },
  ]

  const slideIndex = Math.abs(page) % slides.length

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const draggedDistance = info.offset.x
    const draggedVelocity = info.velocity.x

    if (draggedDistance > 80 || draggedVelocity > 400) {
      paginate(-1)
    } else if (draggedDistance < -80 || draggedVelocity < -400) {
      paginate(1)
    } else {
      controls.start({ x: 0 })
    }
  }

  return (
    <div className={`${styles.sliderContainer} container mx-auto rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing`}>
      <motion.div
        ref={sliderRef}
        className="w-full h-full relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.65 },
            }}
            className={styles.slide}
          >
            <div className={`${styles.backgroundImage} pointer-events-none select-none`}>
              <Image
                src={slides[slideIndex].backgroundImage}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className={styles.contentContainer}>
              <div className={styles.textContent}>
                <h1
                  className={`${fraunces.className} ${styles.hContent} text-3xl text-[#162F40] md:text-4xl lg:text-5xl mb-6 font-normal select-none`}
                >
                  {slides[slideIndex].title}
                </h1>

                {/* 🛑 Detiene la propagación del evento de arrastre sobre el botón */}
                <div
                  className="w-fit cursor-pointer"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <Link href={slides[slideIndex].url}>
                    <Button className="bg-[#39759E] hover:bg-[#39759E] w-fit">
                      {lang === "es" ? "Ver más" : "See more"}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className={`${styles.imageContainer} pointer-events-none select-none`}>
                <Image
                  src={slides[slideIndex].image}
                  alt="Hero"
                  fill
                  className="object-contain"
                  priority
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Botones de navegación */}
      <button
        onClick={() => paginate(-1)}
        className={`${styles.navigationButton} ${styles.navigationButtonLeft}`}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => paginate(1)}
        className={`${styles.navigationButton} ${styles.navigationButtonRight}`}
        aria-label="Siguiente slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}