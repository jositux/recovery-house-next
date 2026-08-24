"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { MenuProfile } from "@/components/MenuProfile"
import { MenuActions } from "@/components/MenuActions"
import {
  Search,
  Menu,
  X,
  Mail,
  Info,
  FileText,
  ShieldCheck,
  Globe,
  Home,
  Instagram,
  Facebook,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/search-bar2"
import MedicalSearchMobile from "@/components/MedicalSearchMobile"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { LocationOption } from "@/services/LocationService"
import { Fraunces } from "next/font/google"

// 🛑 Carga de la fuente Fraunces
const fraunces = Fraunces({ subsets: ["latin"] })

const assistanceLinks = [
  { 
    href: "/about", 
    labelEs: "Acerca de", 
    labelEn: "About Us", 
    icon: Info 
  },
  { 
    href: "/terms", 
    labelEs: "Términos y condiciones", 
    labelEn: "Terms & Conditions", 
    icon: FileText 
  },
  { 
    href: "/policy", 
    labelEs: "Políticas de uso", 
    labelEn: "Usage Policies", 
    icon: FileText 
  },
  { 
    href: "/privacidad", 
    labelEs: "Política de privacidad", 
    labelEn: "Privacy Policy", 
    icon: ShieldCheck 
  },
]

export function Header({
  lang = "es",
  availableLocations = []
}: {
  lang?: string
  availableLocations?: LocationOption[]
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [userName, setUserName] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const pathname = usePathname()
  const isSpanish = lang === "es"
  const currentLang: "es" | "en" = lang === "en" ? "en" : "es"

  const showSearchBar =
    pathname === `/` ||
    pathname === `/rooms` ||
    pathname === `/${lang}` ||
    pathname === `/${lang}/rooms`

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("access_token")

        const rawName = localStorage.getItem("nombre")
        const name =
          rawName && rawName.trim() !== "" && rawName !== "null"
            ? rawName
            : isSpanish
            ? "Usuario sin nombre"
            : "Unnamed user"

        setIsLoggedIn(!!token)
        setUserName(name)
      } catch (e) {
        console.error("Auth check failed:", e)
      }

      setIsReady(true)
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)

    return () => window.removeEventListener("storage", checkAuth)
  }, [isSpanish])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <header className="bg-[#39759E] p-4 relative z-1">
        <div className="container mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Image
                src="/assets/logo.svg"
                alt="Recovery Care Solutions"
                width={140}
                height={50}
              />
            </div>
            <div className="block sm:hidden">
              <Image
                src="/assets/logo-mini.svg"
                alt="Recovery Care Solutions"
                width={40}
                height={40}
              />
            </div>
          </Link>

          {/* AUTH / MENU SECTION */}
          <div className="flex items-center gap-4">

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5 text-[#39759E]" />
            </Button>

            {!isReady ? (
              <div className="opacity-0 pointer-events-none flex items-center gap-4">
                <MenuProfile name="placeholder" lang={lang} />
                <MenuActions lang={lang} />
              </div>
            ) : !isLoggedIn ? (
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <Link href={`/${lang}/login`}>
                  {isSpanish ? "Ingresar" : "Login"}
                </Link>
              </Button>
            ) : (
              <>
                <MenuProfile name={userName} lang={lang} />
                <MenuActions lang={lang} />
              </>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0"
              onClick={toggleMenu}
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

          </div>
        </div>
      </header>

      {/* MOBILE SEARCH DROPDOWN */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden"
          >
            <div className="container mx-auto">
              <MedicalSearchMobile
                onSearch={() => setIsSearchOpen(false)}
                lang={lang}
                availableLocations={availableLocations}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SEARCH */}
      {showSearchBar && (
        <SearchBar lang={lang} availableLocations={availableLocations} />
      )}

      {/* SLIDE-OVER HAMBURGUESA */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto p-6"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <Image
                    src="/assets/logo2.svg"
                    alt="Recovery Care Solutions"
                    width={130}
                    height={38}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-gray-100"
                    onClick={toggleMenu}
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </Button>
                </div>

                {/* 🛑 TÍTULO CON FUENTE FRAUNCES */}
                <div>
                  <h3 className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-4`}>
                    {isSpanish ? "Configuración y legal" : "Settings and legal"}
                  </h3>
                  <ul className="space-y-4">
                    {assistanceLinks.map((link) => {
                      const IconComponent = link.icon
                      return (
                        <li key={link.href}>
                          <Link
                            href={`/${lang}${link.href}`}
                            className="flex items-center gap-3 text-gray-800 hover:text-[#39759E] font-medium transition-colors"
                          >
                            <IconComponent className="h-5 w-5 text-gray-600 shrink-0" />
                            <span>{isSpanish ? link.labelEs : link.labelEn}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-3`}>
                    {isSpanish ? "Anfitrión" : "Host"}
                  </h3>
                  <Link
                    href={`/${lang}/registro`}
                    className="flex items-center gap-3 text-gray-800 hover:text-[#39759E] font-medium transition-colors"
                  >
                    <Home className="h-5 w-5 text-gray-600 shrink-0" />
                    <span>{isSpanish ? "Pon tu espacio" : "List your space"}</span>
                  </Link>
                </div>

                <div className="border-t pt-4">
                  <h3 className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-3`}>
                    {isSpanish ? "Síguenos" : "Follow us"}
                  </h3>
                  <div className="flex items-center gap-4">
                    <Link
                      href="https://www.tiktok.com/@recovery.care.sol?_r=1&_t=ZS-998gxKYMmhw"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="text-gray-800 hover:text-[#39759E] transition-colors"
                    >
                      <svg viewBox="0 0 32 32" className="h-5 w-5 fill-gray-600">
                        <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
                      </svg>
                    </Link>
                    <Link
                      href="https://www.instagram.com/recoverycaresolutions?igsi=MTdsN2IyZjlpb29keA%3D%3D&utm_source=qr"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-gray-800 hover:text-[#39759E] transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-gray-600" />
                    </Link>
                    <Link
                      href="https://www.facebook.com/share/1BujQP8msm/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-gray-800 hover:text-[#39759E] transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-gray-600" />
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-3`}>
                    {isSpanish ? "Idioma" : "Language"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600 shrink-0" />
                    <LanguageSwitcher lang={currentLang} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-8">
                <p className="text-xs text-gray-500 mb-1">
                  {isSpanish ? "Contáctenos:" : "Contact us:"}
                </p>
                <a
                  href="mailto:admin@recoverycaresolutions.com"
                  className="text-xs font-semibold text-[#39759E] hover:underline flex items-center gap-1.5"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  admin@recoverycaresolutions.com
                </a>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}