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
import { SearchBar } from "@/components/search-bar"
import MedicalSearchMobile from "@/components/MedicalSearchMobile"
import styles from "./header.module.css"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const pathname = usePathname()

  const showSearchBar = pathname === "/" || pathname === "/rooms"

  useEffect(() => {
    // Función para verificar autenticación y obtener nombre
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")
      const name = localStorage.getItem("nombre") || "Usuario"
      setIsLoggedIn(!!token)
      setUserName(name)
    }

    // Verificar en el montaje
    checkAuth()

    // Escuchar cambios en localStorage
    window.addEventListener("storage", checkAuth)

    // Cleanup del evento al desmontar
    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const cerrarSearch = () => {
    setIsSearchOpen(false)
  }

  return (
    <>
      <header className={`${styles.Container} bg-[#39759E] p-4 relative z-1`}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* Logo grande visible en pantallas medianas y grandes */}
            <div className="hidden sm:block">
              <Image src="/assets/logo.svg" alt="Recovery Care Solutions" width={140} height={50} />
            </div>
            {/* Logo mini visible en pantallas pequeñas */}
            <div className="block sm:hidden">
              <Image src="/assets/logo-mini.svg" alt="Recovery Care Solutions" width={40} height={40} />
            </div>
          </Link>

          {/* Botones */}
          <div className="flex items-center gap-4">
            {/* Botón de búsqueda móvil */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5 text-[#39759E]" />
            </Button>

            {!isLoggedIn ? (
              <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700" asChild>
                <Link href="/login">Ingresar</Link>
              </Button>
            ) : (
              <>
                <MenuProfile name={userName} />
                <MenuActions />
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
              <MedicalSearchMobile onSearch={cerrarSearch} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSearchBar && <SearchBar />}
    </>
  )
}

