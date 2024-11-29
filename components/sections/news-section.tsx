import { NewsCard } from "@/components/ui/news-card"
import { ChevronRight } from 'lucide-react'
import Link from "next/link"

const newsItems = [
  {
    title: "Turismo médico",
    description: "Descubre cómo nos hemos convertido en la plataforma ideal para la recuperación postoperatoria de cirugías plásticas. Ofrecemos atención profesional las 24 horas del día, enfermería continua y servicios especializados para asegurar tu comodidad y bienestar durante el proceso de recuperación.",
    imageSrc: "/assets/news/0.jpg?height=400&width=600"
  },
  {
    title: "Atención Personalizada 24/7",
    description: "Tu salud es nuestra prioridad. Contamos con un equipo de profesionales de la salud disponibles las 24 horas para atender todas tus necesidades postoperatorias, brindándote la tranquilidad y el apoyo que necesitas para una recuperación óptima.",
    imageSrc: "/assets/news/1.jpg?height=400&width=600"
  },
  {
    title: "Ubicación Estratégica y Servicios Completos",
    description: "Ubicados cerca de las mejores centros médicos, ofrecemos transporte seguro, nutrición especializada y servicios de lavandería. Todo está diseñado para que te sientas cómodo y bien cuidado mientras te recuperas.",
    imageSrc: "/assets/news/2.jpg?height=400&width=600"
  }
]

export function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-fraunces">
              News & Trends
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Descubre artículos informativos, consejos útiles y experiencias de otros pacientes que te guiarán en tu proceso postoperatorio
            </p>
          </div>
          <Link 
            href="#" 
            className="text-[#4A7598] hover:text-[#3A5F7A] flex items-center gap-1 font-medium"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </Link>
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

