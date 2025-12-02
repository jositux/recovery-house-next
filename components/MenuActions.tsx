"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Building, HandHeart, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { syncAuthCookies } from "@/utils/syncAuthCookies"


export function MenuActions({ lang = "es" }: { lang?: string }) { // Usamos directamente la prop 'lang'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // 1. Eliminamos el estado 'currentLang' y su inicialización
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 2. Variable booleana derivada de la prop 'lang'
  const isSpanish = lang === "es"

  // 3. Eliminamos el useEffect que manejaba localStorage


  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  // 4. Función de navegación que usa la prop 'lang' para el prefijo de ruta
  const navigateWithAuth = (path: string) => {
    closeMenu()
    syncAuthCookies()
    // Construye la ruta con el prefijo de idioma: /es/mi-panel/... o /en/mi-panel/...
    const finalPath = `/${lang}${path}`; // Usamos la prop 'lang'
    router.push(finalPath)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label={isSpanish ? "Menú de acciones" : "Actions menu"}
      >
        <Plus className="w-5 h-5" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-10 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >
        <ul className="text-sm text-[#162F40]">
          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <button
              // La ruta aquí no necesita el prefijo, lo añade navigateWithAuth
              onClick={() => navigateWithAuth("/mi-panel/registrar-propiedad")} 
              className="flex items-center gap-2 w-full text-left"
            >
              <Building className="w-4 h-4" />
              {isSpanish ? "Agregar Propiedad" : "Add Property"}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <button
              // La ruta aquí no necesita el prefijo, lo añade navigateWithAuth
              onClick={() => navigateWithAuth("/mi-panel/registrar-servicio")} 
              className="flex items-center gap-2 w-full text-left"
            >
              <HandHeart className="w-4 h-4" />
              {isSpanish ? "Agregar Servicio" : "Add Service"}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            {/* 5. Enlaces estáticos deben usar el prefijo directamente con la prop 'lang' */}
            <Link href={`/${lang}/rooms`} className="flex items-center gap-2" onClick={closeMenu}>
              <Search className="w-4 h-4" />
              {isSpanish ? "Buscar Alojamiento" : "Search Room"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}