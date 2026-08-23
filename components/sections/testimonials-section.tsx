import { TestimonialCard } from "@/components/ui/testimonial-card"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

interface TestimonialsSectionProps {
  lang?: string
}

export function TestimonialsSection({ lang = "en" }: TestimonialsSectionProps) {
  const isSpanish = lang === "es"

  const testimonials = [
    {
      name: isSpanish ? "María López" : "Maria Lopez",
      location: isSpanish ? "Estados Unidos" : "United States",
      testimonial: isSpanish
        ? "¡Esta plataforma ha sido una bendición para mi recuperación! Me permitió encontrar un lugar cómodo y tranquilo para descansar después de mi cirugía plástica."
        : "This platform has been a blessing during my recovery! It allowed me to find a comfortable and quiet place to rest after my plastic surgery.",
      avatarUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      name: isSpanish ? "Mario Restrepo" : "Mario Restrepo",
      location: isSpanish ? "España" : "Spain",
      testimonial: isSpanish
        ? "La plataforma de Recovery Care Solutions fue una gran ayuda para mi proceso de recuperación. Pude encontrar una casa de recuperación perfecta cerca del lugar donde me iba a realizar la cirugía plástica. ¡Altamente recomendado!"
        : "The Recovery Care Solutions platform was a huge help during my recovery process. I found a perfect recovery home near the clinic where I had my plastic surgery. Highly recommended!",
      avatarUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      name: isSpanish ? "Laura Smith" : "Laura Smith",
      location: isSpanish ? "Estados Unidos" : "United States",
      testimonial: isSpanish
        ? "La plataforma de Recovery Care Solutions fue clave en mi proceso de recuperación. Pude encontrar una casa de recuperación perfecta para mi cirugía plástica y tuve una experiencia maravillosa."
        : "The Recovery Care Solutions platform was key to my recovery. I found the perfect recovery home for my plastic surgery and had a wonderful experience.",
      avatarUrl: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mb-12">
          <h2
            className={`${fraunces.className} text-4xl md:text-4xl text-[#162F40] mb-4`}
          >
            {isSpanish ? "Testimonios" : "Testimonials"}
          </h2>

          <p className="text-[#162F40]">
            {isSpanish ? "Nuestros usuarios hablan" : "What our users say"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
