import Link from "next/link";
import Image from "next/image";
import { Fraunces } from "next/font/google";
import { LanguageSwitcher } from "@/components/language-switcher";

const fraunces = Fraunces({ subsets: ["latin"] });

type FooterProps = {
  lang: "es" | "en";
};

const assistanceLinks = [
  { href: "/terms" },
  { href: "/policy" },
  { href: "/privacidad" },
  { href: "/about" },
];

const socialLinks = [
  {
    title: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current">
        <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
      </svg>
    ),
  },
];

export function Footer({ lang }: FooterProps) {
  const isSpanish = lang === "es";

  return (
    <footer className="bg-[#E5EEF6] pt-16 pb-8">
      <div className="container mx-auto p-4">
        {/* Main Grid: 33% (4 cols) + 66% (8 cols) = 12 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Company Info - 33% Width (4 columns out of 12) */}
          <div className="md:col-span-2 lg:col-span-4">
            <Link href={`/${lang}`} className="flex items-center gap-2 mb-6">
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
                : "Find and book post-operative recovery homes worldwide. We offer a network of specialized accommodations with professional services, ensuring an ideal environment for a comfortable and effective recovery."}
            </p>

            <p className="text-[#162F40]">
              {isSpanish ? "Contáctenos:" : "Contact us:"}{" "}
              <Link
                href="mailto:manager@recoverycaresolutions.com"
                className="hover:text-[#39759E]"
              >
                manager@recoverycaresolutions.com
              </Link>
            </p>
          </div>

          {/* Links Section - 66% Width (8 columns out of 12) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Assistance */}
            <div>
              <h3
                className={`${fraunces.className} font-semibold text-lg mb-4`}
              >
                {isSpanish ? "Asistencia" : "Support"}
              </h3>
              <ul className="space-y-3">
                {assistanceLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={`/${lang}${link.href}`}
                      className="text-[#162F40] hover:text-[#39759E]"
                    >
                      {isSpanish
                        ? [
                            "Términos y condiciones",
                            "Políticas de uso",
                            "Política de privacidad",
                            "Acerca de",
                          ][index]
                        : [
                            "Terms & Conditions",
                            "Usage Policies",
                            "Privacy Policy",
                            "About",
                          ][index]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Host */}
            <div>
              <h3
                className={`${fraunces.className} font-semibold text-lg mb-4`}
              >
                {isSpanish ? "Anfitrión" : "Host"}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={`/${lang}/registro`}
                    className="text-[#162F40] hover:text-[#39759E]"
                  >
                    {isSpanish ? "Pon tu espacio" : "List your space"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3
                className={`${fraunces.className} font-semibold text-lg mb-4`}
              >
                {isSpanish ? "Síguenos" : "Follow us"}
              </h3>
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

            {/* Language */}
            <div>
              <h3
                className={`${fraunces.className} font-semibold text-lg mb-4`}
              >
                {isSpanish ? "Idioma" : "Language"}
              </h3>
              <LanguageSwitcher lang={lang} />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#162F40] text-sm">
              © 2026 Recovery Care Solutions.{" "}
              {isSpanish
                ? "Todos los derechos reservados."
                : "All rights reserved."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}