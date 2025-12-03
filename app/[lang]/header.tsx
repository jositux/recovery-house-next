"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { MenuProfile } from "@/components/MenuProfile"
import { MenuActions } from "@/components/MenuActions"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/search-bar2"
import MedicalSearchMobile from "@/components/MedicalSearchMobile"
import type { LocationOption } from "@/services/LocationService"

export function Header({
  lang = "es",
  availableLocations = []
}: {
  lang?: string
  availableLocations?: LocationOption[]
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isReady, setIsReady] = useState(false) // evita parpadeo + salto
  const [userName, setUserName] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const pathname = usePathname()
  const isSpanish = lang === "es"

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

      setIsReady(true) // 💥 evita salto
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)

    return () => window.removeEventListener("storage", checkAuth)
  }, [isSpanish])

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  return (
    <>
      <header className="bg-[#39759E] p-4 relative z-1">
        <div className="container mx-auto flex items-center justify-between">

          {/* ------------------------- LOGO ------------------------- */}
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

          {/* ------------------ AUTH / MENU SECTION ------------------ */}
          <div className="flex items-center gap-4">

            {/* Mobile Search */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5 text-[#39759E]" />
            </Button>

            {/* ----------------------------------------------
                🔥 NO SALTO, NO PARPADEO:
                Usa un placeholder INVISIBLE mientras carga.
               ---------------------------------------------- */}
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

          </div>
        </div>
      </header>

      {/* ------------------ MOBILE SEARCH DROPDOWN ------------------ */}
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

      {/* ----------------------- DESKTOP SEARCH --------------------- */}
      
      {showSearchBar && (
        <SearchBar lang={lang} availableLocations={availableLocations} />
      )}
    </>
  )
}
