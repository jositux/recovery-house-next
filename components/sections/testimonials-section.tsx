import { TestimonialCard } from "@/components/ui/testimonial-card"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

const testimonials = [
  {
    name: "María López",
    location: "Estados Unidos",
    testimonial: "¡Esta plataforma ha sido una bendición para mi recuperación! Me permitió encontrar un lugar cómodo y tranquilo para descansar después de mi cirugía plástica.",
    avatarUrl: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Mario Restrepo",
    location: "España",
    testimonial: "La plataforma de Recovery Care Solutions fue una gran ayuda para mi proceso de recuperación. Pude encontrar una casa de recuperación perfecta cerca del lugar donde me iba a realizar la cirugía plástica. ¡Altamente recomendado!",
    avatarUrl: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Laura Smith",
    location: "Estados Unidos",
    testimonial: "La plataforma de Recovery Care Solutions fue clave en mi proceso de recuperación. Pude encontrar una casa de recuperación perfecta para mi cirugía plástica y tuve una experiencia maravillosa.",
    avatarUrl: "/placeholder.svg?height=100&width=100"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="text-center mb-12">
          <h2 className={`${fraunces.className} md:text-4xl text-[#162F40] mb-4`}>
            Testimonios
          </h2>
          <p className="text-[#162F40]">
            Nuestros usuarios hablan
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

