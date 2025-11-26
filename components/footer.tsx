import Link from "next/link"
import Image from "next/image"
import { Fraunces } from 'next/font/google'
//import { LanguageSwitcher } from "@/components/language-switcher";

const fraunces = Fraunces({ subsets: ['latin'] })

type FooterProps = {
  lang: "es" | "en"
}

const assistanceLinks = [
  { href: "/terms" },
  { href: "/policy" },
  { href: "/privacidad" },
]

const socialLinks = [
  {
    title: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current">
        <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 ..." />
      </svg>
    )
  },
]

export function Footer({ lang }: FooterProps) {
  const isSpanish = lang === "es"

  return (
    <footer className="bg-[#E5EEF6] pt-16 pb-8">
      <div className="container mx-auto p-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">

          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image
                src="/assets/logo2.svg"
                alt="Recovery Care Solutions"
                width={140}
                height={40}
              />
            </Link>

            <p className="text-[#162F40] mb-6">
              {isSpanish
                ? "Encuentra y reserva casas de recuperación postoperatoria en todo el mundo. Ofrecemos una red de alojamientos especializados con servicios profesionales, garantizando un entorno ideal para una recuperación cómoda y efectiva."
                : "Find and book post-operative recovery homes worldwide. We offer a network of specialized accommodations with professional services, ensuring an ideal environment for a comfortable and effective recovery."
              }
            </p>

            <p className="text-[#162F40]">
              {isSpanish ? "Contáctenos:" : "Contact us:"}{" "}
              <Link href="mailto:manager@recoverycaresolutions.com" className="hover:text-[#39759E]">
                manager@recoverycaresolutions.com
              </Link>
            </p>
          </div>

          {/* Assistance */}
          <div className="lg:col-span-2">
            <h3 className={`${fraunces.className} font-semibold text-lg mb-4`}>
              {isSpanish ? "Asistencia" : "Support"}
            </h3>
            <ul className="space-y-3">
              {assistanceLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-[#162F40] hover:text-[#39759E]">
                    {isSpanish
                      ? ["Términos y condiciones", "Políticas de uso", "Política de privacidad"][index]
                      : ["Terms & Conditions", "Usage Policies", "Privacy Policy"][index]
                    }
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Host */}
          <div className="lg:col-span-2">
            <h3 className={`${fraunces.className} font-semibold text-lg mb-4`}>
              {isSpanish ? "Anfitrión" : "Host"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/registro" className="text-[#162F40] hover:text-[#39759E]">
                  {isSpanish ? "Pon tu espacio" : "List your space"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-3">
            <h3 className={`${fraunces.className} font-semibold text-lg mb-4`}>
              {isSpanish ? "Síguenos" : "Follow us"}
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="flex items-center gap-2 text-[#162F40] hover:text-[#39759E]">
                    {link.icon}
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#162F40] text-sm">
              © 2025 Recovery Care Solutions.{" "}
              {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}
            </p>
            {/*<LanguageSwitcher lang={lang} />*/}
          </div>
        </div>


        
      </div>
    </footer>
  )
}
