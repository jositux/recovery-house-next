import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/components/ui/feature-card"

const features = [
  {
    title: "Facilidad de búsqueda",
    description: "Nuestra plataforma te permite buscar de manera sencilla y rápida las opciones de estadías disponibles para tu tipo de intervención médica.",
    imageSrc: "/assets/features/2.jpg"
  },
  {
    title: "Variedad de opciones",
    description: "Contamos con una amplia selección de casas y apartamentos en todo el mundo, para que puedas elegir la opción que mejor se adapte a tus necesidades.",
    imageSrc: "/assets/features/1.jpg"
  },
  {
    title: "Seguridad y confianza",
    description: "Nos preocupamos por tu seguridad y confianza. Todas las estadías disponibles en nuestra plataforma han sido verificadas y cumplen con altos estándares de calidad.",
    imageSrc: "/assets/features/0.jpg"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Encuentra la mejor opción para tu recuperación
          </h2>
          <p className="text-gray-600">
            En Recovery Care Solutions, te ofrecemos una plataforma fácil de usar donde podrás encontrar una amplia variedad de opciones de estadías para tu recuperación. Nuestra prioridad es garantizar tu seguridad y confianza en todo momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              imageSrc={feature.imageSrc}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button className="bg-[#4A7598] hover:bg-[#3A5F7A]">
            Buscar
          </Button>
          <Button variant="outline">
            Registrarse
          </Button>
        </div>
      </div>
    </section>
  )
}

