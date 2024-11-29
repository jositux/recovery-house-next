"use client"

import { useRef/*, useState, useEffect*/ } from "react"
import { motion, useMotionValue, useAnimationControls, useTransform } from "framer-motion"
import { MobileHeroCard } from "@/components/ui/mobile-hero-card"
import styles from "./mobile-hero-slider.module.css"

const cards = [
  {
    title: "¡Conectamos pacientes con casas de recuperación en todo el mundo!",
    imageSrc: "/assets/hero-mobile/0.jpg?height=300&width=400",
  },
  {
    title: "Los factores más importantes de la experiencia del paciente y la logística",
    imageSrc: "/assets/hero-mobile/0.jpg?height=300&width=400",
  },
  {
    title: "Cuidado personalizado para tu recuperación",
    imageSrc: "/assets/hero-mobile/0.jpg?height=300&width=400",
  },
]

const CARD_WIDTH = 280
const CARD_GAP = 16

export function MobileHeroSlider() {
  //const [width, setWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimationControls()

  /*useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth)
    }
  }, [])*/

  const contentWidth = cards.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP

  const handleDragEnd = () => {
    const currentX = x.get()
    const maxDrag = contentWidth

    if (currentX > 0) {
      controls.start({ x: -maxDrag + currentX })
    } else if (currentX < -maxDrag) {
      controls.start({ x: -currentX - maxDrag })
    }
  }

  const infiniteX = useTransform(x, (value) => {
    const normalized = ((value % contentWidth) + contentWidth) % contentWidth
    return normalized - contentWidth
  })

  return (
    <div className={styles.container} ref={containerRef}>
      <motion.div
        className={styles.slider}
        drag="x"
        dragConstraints={{ left: -contentWidth, right: 0 }}
        style={{ x: infiniteX }}
        animate={controls}
        onDragEnd={handleDragEnd}
      >
        {[...cards, ...cards, ...cards].map((card, index) => (
          <MobileHeroCard
            key={index}
            title={card.title}
            imageSrc={card.imageSrc}
          />
        ))}
      </motion.div>
    </div>
  )
}

