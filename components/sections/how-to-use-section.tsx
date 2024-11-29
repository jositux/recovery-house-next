import { Button } from "@/components/ui/button"
import { ChevronRight } from 'lucide-react'

import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })


const steps = [
  {
    number: "1.",
    title: "Busca tu lugar de recuperación",
    description: "Nuestra plataforma te ofrece una forma rápida y sencilla de encontrar opciones de alojamiento adaptadas a tu tipo de intervención médica."
  },
  {
    number: "2.",
    title: "Selecciona tus Preferencias de Recuperación",
    description: "Elige el tipo de intervención médica que te vas a realizar y el lugar en el mundo donde deseas hacerlo."
  },
  {
    number: "3.",
    title: "Explora las Opciones Disponibles",
    description: "Navega por nuestra amplia selección de casas de recuperación y encuentra la opción perfecta para ti."
  }
]

export function HowToUseSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div>
            <h2 className={`${fraunces.className} text-3xl md:text-4xl text-gray-800 mb-4`}>
              Cómo utilizar nuestra plataforma de recuperación
            </h2>
            <p className="text-gray-600">
              Nuestra plataforma de recuperación te permite encontrar una casa de recuperación de manera fácil y rápida. Sigue estos pasos para utilizarla:
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <span className={`${fraunces.className} text-7xl font-medium text-[#4A7598]`}>
                  {step.number}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 font-fraunces">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <Button className="bg-[#4A7598] hover:bg-[#3A5F7A]">
                Buscar
              </Button>
              <Button variant="outline" className="group">
                Registrarse
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

