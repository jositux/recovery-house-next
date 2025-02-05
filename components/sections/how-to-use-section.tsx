"use client";

import { Button } from "@/components/ui/button";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import { Search } from "lucide-react";

const fraunces = Fraunces({ subsets: ["latin"] });

const steps = [
  {
    number: "1.",
    title: "Busca tu lugar de recuperación",
    description:
      "Nuestra plataforma te ofrece una forma rápida y sencilla de encontrar opciones de alojamiento adaptadas a tu tipo de intervención médica.",
  },
  {
    number: "2.",
    title: "Selecciona tus Preferencias de Recuperación",
    description:
      "Elige el tipo de intervención médica que te vas a realizar y el lugar en el mundo donde deseas hacerlo.",
  },
  {
    number: "3.",
    title: "Explora las Opciones Disponibles",
    description:
      "Navega por nuestra amplia selección de casas de recuperación y encuentra la opción perfecta para ti.",
  },
];

export function HowToUseSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div>
            <h2
              className={`${fraunces.className} text-3xl md:text-4xl text-[#162F40] mb-4`}
            >
              Cómo utilizar nuestra plataforma de recuperación
            </h2>
            <p className="text-[#162F40]">
              Nuestra plataforma de recuperación te permite encontrar una casa
              de recuperación de manera fácil y rápida. Sigue estos pasos para
              utilizarla:
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className={`${fraunces.className} flex items-center justify-center w-20 h-20 text-7xl font-medium text-[#162F40] flex-shrink-0`}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    className={`${fraunces.className} text-xl font-medium text-[#162F40] mb-2`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#162F40]">{step.description}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Link href="/rooms">
                <Button className="bg-[#3184B4] hover:bg-[#39759E] flex items-center gap-2">
                  <Search size={16} />
                  Buscar
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
