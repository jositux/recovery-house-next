"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { MenuProfile } from "@/components/MenuProfile"
import { MenuActions } from "@/components/MenuActions"
import { Search, Menu, X } from "lucide-react"
import { SearchBar } from "@/components/search-bar2"
import type { LocationOption } from "@/services/LocationService"

// Estas dos usan framer-motion (pesado): se separan en su propio chunk y se
// precargan en segundo plano (ver useEffect más abajo) en vez de viajar en el
// bundle inicial del header, que se renderiza en cada página del sitio.
const MobileSearchDropdown = dynamic(() => import("@/components/mobile-search-dropdown"), { ssr: false })
const MobileMenuOverlay = dynamic(() => import("@/components/mobile-menu-overlay"), { ssr: false })

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
  // Precarga en segundo plano el búsqueda-mobile y el menú-hamburguesa (y con
  // ellos framer-motion) una vez que el navegador queda libre, para que abran
  // sin demora al hacer click.
  const [shouldPreload, setShouldPreload] = useState(false)

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

  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (id: number) => void
    }
    const idle = win.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1))
    const cancelIdle = win.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setShouldPreload(true))
    return () => cancelIdle(id as number)
  }, [])

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
      {(shouldPreload || isSearchOpen) && (
        <MobileSearchDropdown
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          lang={lang}
          availableLocations={availableLocations}
        />
      )}

      {/* DESKTOP SEARCH */}
      {showSearchBar && (
        <SearchBar lang={lang} availableLocations={availableLocations} />
      )}

      {/* SLIDE-OVER HAMBURGUESA */}
      {(shouldPreload || isMenuOpen) && (
        <MobileMenuOverlay
          isOpen={isMenuOpen}
          onClose={toggleMenu}
          lang={lang}
          isSpanish={isSpanish}
          currentLang={currentLang}
        />
      )}
    </>
  )
}