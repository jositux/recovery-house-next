import { NewsCard } from "@/components/ui/news-card"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

type NewsSectionProps = {
  lang?: "es" | "en"
}

export function NewsSection({ lang = "es" }: NewsSectionProps) {
  const isSpanish = lang === "es"

  const newsItems = [
    {
      title: isSpanish
        ? "Turismo médico"
        : "Medical Tourism",
      description: isSpanish
        ? "Descubre cómo nos hemos convertido en la plataforma ideal para la recuperación postoperatoria de cirugías plásticas. Ofrecemos atención profesional las 24 horas del día, enfermería continua y servicios especializados para asegurar tu comodidad y bienestar durante el proceso de recuperación."
        : "Discover how we have become the ideal platform for post-operative recovery after plastic surgery. We offer 24/7 professional care, continuous nursing, and specialized services to ensure comfort and well-being throughout the healing process.",
      imageSrc: "/assets/news/0.jpg"
    },
    {
      title: isSpanish
        ? "Atención Personalizada 24/7"
        : "24/7 Personalized Care",
      description: isSpanish
        ? "Tu salud es nuestra prioridad. Contamos con un equipo de profesionales de la salud disponibles las 24 horas para atender todas tus necesidades postoperatorias, brindándote la tranquilidad y el apoyo que necesitas para una recuperación óptima."
        : "Your health is our priority. Our team of healthcare professionals is available 24/7 to assist with all post-operative needs, providing the peace of mind and support required for an optimal recovery.",
      imageSrc: "/assets/news/1.jpg"
    },
    {
      title: isSpanish
        ? "Ubicación Estratégica y Servicios Completos"
        : "Strategic Location & Full Services",
      description: isSpanish
        ? "Ubicados cerca de las mejores centros médicos, ofrecemos transporte seguro, nutrición especializada y servicios de lavandería. Todo está diseñado para que te sientas cómodo y bien cuidado mientras te recuperas."
        : "Located near top medical centers, we offer safe transportation, specialized nutrition, and laundry services. Everything is designed to keep you comfortable and well cared for during recovery.",
      imageSrc: "/assets/news/2.jpg"
    }
  ]

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2
              className={`${fraunces.className} text-3xl md:text-4xl font-normal text-[#162F40] mb-4`}
            >
              {isSpanish ? "Noticias & Tendencias" : "News & Trends"}
            </h2>

            <p className="text-[#162F40] max-w-2xl">
              {isSpanish
                ? "Descubre artículos informativos, consejos útiles y experiencias de otros pacientes que te guiarán en tu proceso postoperatorio."
                : "Explore informational articles, helpful tips, and real patient experiences to guide you through your post-operative journey."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <NewsCard
              key={index}
              title={item.title}
              description={item.description}
              imageSrc={item.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
