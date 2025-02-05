"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import styles from "./hero-slider.module.css"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

const slides = [
  {
    title: "¡Conectamos pacientes con casas de recuperación en todo el mundo!",
    image: "/assets/hero/2.png?height=600&width=600",
    backgroundImage: "/assets/hero/background.jpg?height=1080&width=1920",
    url: "/rooms",
  },
  {
    title: "Los facilitadores de experiencia se encargarán de tu cuidado",
    image: "/assets/hero/1.png?height=600&width=600",
    backgroundImage: "/assets/hero/background.jpg?height=1080&width=1920",
    url: "/rooms",
  },
  {
    title: "Proveedores de todo el mundo en áreas de salud esperan para atenderte",
    image: "/assets/hero/2.png?height=600&width=600",
    backgroundImage: "/assets/hero/background.jpg?height=1080&width=1920",
    url: "/rooms",
  },
]

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
}

export function HeroSlider() {
  const [[page, direction], setPage] = useState([0, 0])
  const sliderRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const slideIndex = Math.abs(page) % slides.length

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const draggedDistance = info.offset.x
    const draggedVelocity = info.velocity.x
    
    if (draggedDistance > 100 || draggedVelocity > 500) {
      paginate(-1)
    } else if (draggedDistance < -100 || draggedVelocity < -500) {
      paginate(1)
    } else {
      controls.start({ x: 0 })
    }
  }

  return (
    <div className={` ${styles.sliderContainer} container mx-auto rounded-3xl`}>
      <motion.div
        ref={sliderRef}
        className="w-full h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={styles.slide}
          >
            <div className={styles.backgroundImage}>
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
                <h1 className={`${fraunces.className} ${styles.hContent} text-3xl text-[#162F40] md:text-4xl lg:text-5xl mb-6`}>
                  {slides[slideIndex].title}
                </h1>
                <Link href={slides[slideIndex].url}>
                  <Button className="bg-[#39759E] hover:bg-[#39759E] w-fit">
                    Ver más
                  </Button>
                </Link>
              </div>
              <div className={styles.imageContainer}>
                <Image
                  src={slides[slideIndex].image}
                  alt="Hero"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
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
