import { Button } from "@/components/ui/button"
import Image from "next/image"

import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

export function HostCTASection() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/cta/0.jpg?height=1200&width=2000"
        alt="Background"
        fill
        className="object-cover brightness-[0.85]"
        priority
      />
      
      {/* Content Container */}
      <div className="container relative h-full mx-auto">
        <div className="flex flex-col justify-center h-full max-w-lg">
          <h2 className={`${fraunces.className} text-4xl md:text-5xl text-white mb-4`}>
            Tu espacio vale la pena compartirlo
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Convierte tu casa en tu próxima oportunidad
          </p>
          <Button 
            className="bg-white text-gray-900 hover:bg-white/90 w-fit"
            size="lg"
          >
            Conviértete en Host
          </Button>
        </div>
      </div>
    </section>
  )
}

