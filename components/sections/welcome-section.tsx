import { Fraunces } from "next/font/google"
import styles from "./welcome-section.module.css"

const fraunces = Fraunces({ subsets: ["latin"] })

interface WelcomeSectionProps {
  lang?: string // 👈 idioma recibido como prop (es, en, etc.)
}

export function WelcomeSection({ lang }: WelcomeSectionProps) {
  const isSpanish = lang === "es"

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col gap-4 sm:flex-row w-full">
        <div className={styles.pWelcome}>
          {/* ✅ Título según idioma */}
          <h2
            className={`${fraunces.className} block sm:hidden text-3xl text-[#162F40]`}
          >
            {isSpanish
              ? "¡Bienvenido a Recovery Care Solutions!"
              : "Welcome to Recovery Care Solutions!"}
          </h2>

          <h2
            className={`${fraunces.className} hidden sm:block text-4xl text-[#162F40]`}
          >
            {isSpanish
              ? "¡Bienvenido a Recovery Care Solutions!"
              : "Welcome to Recovery Care Solutions!"}
          </h2>
        </div>

        {/* ✅ Texto según idioma */}
        <div>
          <p className="text-[#162F40]">
            {isSpanish
              ? `Ofrecemos soluciones de cuidado de la salud y belleza, conectando las necesidades de los pacientes con casas de recuperación en todo el mundo. Nuestros servicios incluyen estadías para pacientes que se están recuperando de cirugías plásticas, cirugías bariátricas, implantes de cabello, salud mental y rehabilitación.`
              : `We provide health and beauty care solutions, connecting patient needs with recovery homes around the world. Our services include stays for patients recovering from plastic surgery, bariatric surgery, hair implants, mental health treatments, and rehabilitation.`}
          </p>
        </div>
      </div>
    </div>
  )
}
