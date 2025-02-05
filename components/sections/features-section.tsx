import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { Search } from "lucide-react";

const fraunces = Fraunces({ subsets: ["latin"] });

const features = [
  {
    title: "Facilidad de búsqueda",
    description:
      "Nuestra plataforma te permite buscar de manera sencilla y rápida las opciones de estadías disponibles para tu tipo de intervención médica.",
    imageSrc: "/assets/features/2.jpg",
  },
  {
    title: "Variedad de opciones",
    description:
      "Contamos con una amplia selección de casas y apartamentos en todo el mundo, para que puedas elegir la opción que mejor se adapte a tus necesidades.",
    imageSrc: "/assets/features/1.jpg",
  },
  {
    title: "Seguridad y confianza",
    description:
      "Nos preocupamos por tu seguridad y confianza. Todas las estadías disponibles en nuestra plataforma han sido verificadas y cumplen con altos estándares de calidad.",
    imageSrc: "/assets/features/0.jpg",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2
            className={`${fraunces.className} text-3xl md:text-4xl text-[#162F40] mb-4`}
          >
            Encuentra la mejor opción para tu recuperación
          </h2>
          <p className="text-[#162F40]">
            En Recovery Care Solutions, te ofrecemos una plataforma fácil de
            usar donde podrás encontrar una amplia variedad de opciones de
            estadías para tu recuperación. Nuestra prioridad es garantizar tu
            seguridad y confianza en todo momento.
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
          <Link href="/rooms">
            <Button className="bg-[#39759E] hover:bg-[#39759E] flex items-center gap-2">
              <Search size={16} />
              Buscar
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Registrarse</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
