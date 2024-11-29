import { Button } from "@/components/ui/button"
import { ChevronRight } from 'lucide-react'
import Image from "next/image"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

export function BenefitsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src="/assets/benefits/0.jpg"
              alt="Beneficios de Recovery Care Solutions"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className={`${fraunces.className} text-3xl md:text-4xl text-gray-800`}>
              Beneficios de usar Recovery Care Solutions
            </h2>
            <p className="text-gray-600">
              La atención profesional y personalizada 24/7 garantiza un proceso de recuperación seguro y cómodo. 
              Además se puede contar con servicios de enfermería continua, nutrición especializada, transporte seguro y 
              lavandería, entre otros. Esto permite que los pacientes se enfoquen únicamente en su recuperación.
            </p>
            <div className="flex gap-4">
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

