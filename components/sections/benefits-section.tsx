import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Fraunces } from "next/font/google"
import Link from "next/link"
import { Search } from "lucide-react"

const fraunces = Fraunces({ subsets: ["latin"] })

interface BenefitsSectionProps {
  lang?: string
}

export function BenefitsSection({ lang }: BenefitsSectionProps) {
  const isSpanish = lang === "es"

console.log(isSpanish)

  return (
    <section className="py-16 bg-[#f8f8f7] px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src="/assets/benefits/0.jpg"
              alt={
                isSpanish
                  ? "Beneficios de Recovery Care Solutions"
                  : "Benefits of Recovery Care Solutions"
              }
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <h2
              className={`${fraunces.className} text-3xl md:text-4xl text-[#162F40]`}
            >
              {isSpanish
                ? "Beneficios de usar Recovery Care Solutions"
                : "Benefits of using Recovery Care Solutions"}
            </h2>

            <p className="text-[#162F40]">
              {isSpanish
                ? `La atención profesional y personalizada 24/7 garantiza un proceso
                de recuperación seguro y cómodo. Además se puede contar con
                servicios de enfermería continua, nutrición especializada,
                transporte seguro y lavandería, entre otros. Esto permite que los
                pacientes se enfoquen únicamente en su recuperación.`
                : `Professional and personalized 24/7 care ensures a safe and comfortable
                recovery process. Patients can rely on continuous nursing,
                specialized nutrition, safe transportation, and laundry services,
                among others. This allows them to focus solely on their recovery.`}
            </p>

            <div className="flex gap-4 sm:justify-start justify-center">
              <Link href="/rooms">
                <Button className="bg-[#39759E] hover:bg-[#39759E] flex items-center gap-2">
                  <Search size={16} />
                  {isSpanish ? "Buscar" : "Search"}
                </Button>
              </Link>

              <Link href="/registro">
                <Button variant="outline">
                  {isSpanish ? "Registrarse" : "Register"}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
