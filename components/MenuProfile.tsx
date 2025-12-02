"use client"

import { useState, useEffect, useRef } from "react"
import { LayoutGrid, CalendarClock, SquareArrowDown, Building, User, LogOut, HandHelping } from "lucide-react"
//import Link from "next/link"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/services/LogoutService"
import { syncAuthCookies } from "@/utils/syncAuthCookies" // ✅ IMPORT AGREGADO

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type MenuText = {
  dashboard: string;
  myProperties: string;
  myBookings: string;
  receivedBookings: string;
  myService: string;
  editProfile: string;
  logout: string;
  noRefreshToken: string;
  logoutError: string;
};

const translations: Record<string, MenuText> = {
  es: {
    dashboard: "Mi Panel",
    myProperties: "Mis propiedades",
    myBookings: "Mis Reservas",
    receivedBookings: "Reservas recibidas",
    myService: "Mi Servicio",
    editProfile: "Editar Perfil",
    logout: "Salir",
    noRefreshToken: "No se encontró el token de refresco",
    logoutError: "Error al cerrar sesión:",
  },
  en: {
    dashboard: "Dashboard",
    myProperties: "My Properties",
    myBookings: "My Bookings",
    receivedBookings: "Received Bookings",
    myService: "My Service",
    editProfile: "Edit Profile",
    logout: "Logout",
    noRefreshToken: "No refresh token found",
    logoutError: "Logout error:",
  },
};

// ===============================================================
// 💻 Componente MenuProfile
// ===============================================================

export function MenuProfile({ name, lang = "es" }: { name: string; lang?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const texts = translations[lang] || translations.en;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  // ✅ FUNCIÓN AUXILIAR AGREGADA
  const navigateWithAuth = (path: string) => {
    closeMenu()
    syncAuthCookies() // Sincroniza las cookies de autenticación
    router.push(path)
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

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        console.error(texts.noRefreshToken)
        return
      }

      await logoutUser(refreshToken)

      window.dispatchEvent(new Event("storage")) 
      // 🛑 CAMBIO: Redirección de logout prefijada con el idioma
      router.push(`/${lang}/login`)
    } catch (error) {
      console.error(texts.logoutError, error)
    }
    closeMenu()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label={texts.editProfile}
      >
        <User className="w-5 h-5" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-10 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >
        <ul className="text-sm text-[#162F40]">

          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
            <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <LayoutGrid className="w-4 h-4" />
              {texts.dashboard}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
             {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
             <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/mis-propiedades`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <Building className="w-4 h-4" />
              {texts.myProperties}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
             {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
             <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/reservas-realizadas`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <CalendarClock className="w-4 h-4" />
              {texts.myBookings}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
             {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
             <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/reservas-recibidas`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <SquareArrowDown className="w-4 h-4" />
              {texts.receivedBookings}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
             {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
             <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/mi-servicio`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <HandHelping className="w-4 h-4" />
              {texts.myService}
            </button>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            {/* 🛑 CAMBIO: Prefijo de idioma agregado al path */}
            <button
              onClick={() => navigateWithAuth(`/${lang}/mi-panel/mi-perfil`)}
              className="flex items-center gap-2 w-full text-left"
            >
              <User className="w-4 h-4" />
              {texts.editProfile}
            </button>
          </li>

          <li 
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {texts.logout}
          </li>
        </ul>

        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-[#162F40]">
          <p>{name}</p>
        </div>
      </div>
    </div>
  )
}