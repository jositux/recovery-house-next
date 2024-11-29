import Image from "next/image"
import { Button } from "@/components/ui/button"
import styles from "./mobile-hero-card.module.css"

interface MobileHeroCardProps {
  title: string
  imageSrc: string
}

export function MobileHeroCard({ title, imageSrc }: MobileHeroCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>
        <Button className={styles.button}>
          Ver más
        </Button>
      </div>
    </div>
  )
}

