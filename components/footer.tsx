import Link from "next/link"
import Image from "next/image"
//import { LanguageSelector } from "@/components/ui/language-selector"

import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })

const assistanceLinks = [
  { title: "Términos y condiciones", href: "/terms" },
  { title: "Políticas de uso", href: "/policy" },
  { title: "Política de privacidad", href: "/privacidad" },
]

const hostLinks = [
  { title: "Pon tu espacio", href: "/registro" },
]

const socialLinks = [
  { 
    title: "TikTok", 
    href: "#", 
    icon: (
      <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current">
<path xmlns="http://www.w3.org/2000/svg" d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"/>      </svg>
    )
  },
  /*
  { 
    title: "Facebook", 
    href: "#", 
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  { 
    title: "Instagram", 
    href: "#", 
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
      </svg>
    )
  },*/
 
]

export function Footer() {
  return (
    <footer className="bg-[#E5EEF6] pt-16 pb-8">
      <div className="container mx-auto  p-4">
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
              Encuentra y reserva casas de recuperación postoperatoria en todo el mundo. 
              Ofrecemos una red de alojamientos especializados con servicios profesionales, garantizando un 
              entorno ideal para una recuperación cómoda y efectiva.
            </p>
            <p className="text-[#162F40]">
              Contáctenos: <Link href="mailto:manager@recoverycaresolutions.com" className="hover:text-[#39759E]">manager@recoverycaresolutions.com</Link>
            </p>
          </div>

          {/* Assistance Links */}
          <div className="lg:col-span-2">
            <h3 className={`${fraunces.className} font-fraunces font-semibold text-lg mb-4`}>Asistencia</h3>
            <ul className="space-y-3">
              {assistanceLinks.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-[#162F40] hover:text-[#39759E]">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Host Links */}
          <div className="lg:col-span-2">
            <h3 className={`${fraunces.className} font-fraunces font-semibold text-lg mb-4`}>Anfitrión</h3>
            <ul className="space-y-3">
              {hostLinks.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-[#162F40] hover:text-[#39759E]">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-3">
            <h3 className={`${fraunces.className} font-fraunces font-semibold text-lg mb-4`}>Síguenos</h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.title}>
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 text-[#162F40] hover:text-[#39759E]"
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#162F40] text-sm">
              © 2025 Recovery Care Solutions. Todos los derechos reservados.
            </p>
            <div className="flex hidden flex-wrap justify-center gap-4 text-sm items-center">
             
              <Link href="/terms" className="text-[#162F40] hover:text-[#39759E]">
                Términos y condiciones
              </Link>
              <Link href="/policy" className="text-[#162F40] hover:text-[#39759E]">
                Políticas de uso
              </Link>
              <Link href="/privacidad" className="text-[#162F40] hover:text-[#39759E]">
                Política de Privacidad
              </Link>
              
              {/*<LanguageSelector />*/}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

