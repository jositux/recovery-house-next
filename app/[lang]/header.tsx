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
// 🛑 Importar el tipo de dato para las ubicaciones
import type { LocationOption } from "@/services/LocationService"; 

// 🛑 MODIFICAR LA INTERFAZ DE PROPS
export function Header({ lang = "es", availableLocations = [] }: 
    { 
        lang?: string; 
        availableLocations?: LocationOption[]; // ✅ Nueva prop
    }
) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const pathname = usePathname()

  

  const isSpanish = lang === "es"

  // La lógica para mostrar la barra de búsqueda se mantiene igual
  const showSearchBar =
  pathname === `/`||
  pathname === `/rooms`||
  pathname === `/es`||
  pathname === `/en`||
  pathname === `/${lang}` ||
  pathname === `/${lang}/rooms`;

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")

      const rawName = localStorage.getItem("nombre")
      const name =
        rawName && rawName !== "null" && rawName.trim() !== ""
          ? rawName
          : isSpanish
          ? "Usuario sin nombre"
          : "Unnamed user"

      setIsLoggedIn(!!token)
      setUserName(name)
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

          {/* Logo */}
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

          <div className="flex items-center gap-4">

            {/* Search mobile */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5 text-[#39759E]" />
            </Button>

            {!isLoggedIn ? (
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <Link href="/login">
                  {isSpanish ? "Ingresar" : "Login"}
                </Link>
              </Button>
            ) : (
              <>
                <MenuProfile name={userName} lang={lang}/>
                <MenuActions lang={lang} />
              </>
            )}
          </div>
        </div>
      </header>

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
              <MedicalSearchMobile onSearch={() => setIsSearchOpen(false)} lang={lang}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛑 PASAR EL PROP availableLocations a SearchBar */}
      {showSearchBar && <SearchBar lang={lang} availableLocations={availableLocations} />}
    </>
  )
}