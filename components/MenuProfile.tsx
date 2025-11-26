"use client"

import { useState, useEffect, useRef } from "react"
import { LayoutGrid, CalendarClock, SquareArrowDown, Building, User, LogOut, HandHelping } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/services/LogoutService"


export function MenuProfile({ name, lang = "es" }: { name: string; lang?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const isSpanish = lang === "es"

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

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
        console.error("No refresh token found")
        return
      }

      await logoutUser(refreshToken)

      window.dispatchEvent(new Event("storage"))
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
    closeMenu()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700"
        onClick={toggleMenu}
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
            <Link href="/mi-panel/" className="flex items-center gap-2" onClick={closeMenu}>
              <LayoutGrid className="w-4 h-4" />
              {isSpanish ? "Mi Panel" : "Dashboard"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Link href="/mi-panel/mis-propiedades" className="flex items-center gap-2" onClick={closeMenu}>
              <Building className="w-4 h-4" />
              {isSpanish ? "Mis propiedades" : "My Properties"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/mi-panel/reservas-realizadas" className="flex items-center gap-2" onClick={closeMenu}>
              <CalendarClock className="w-4 h-4" />
              {isSpanish ? "Mis Reservas" : "My Bookings"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/mi-panel/reservas-recibidas" className="flex items-center gap-2" onClick={closeMenu}>
              <SquareArrowDown className="w-4 h-4" />
              {isSpanish ? "Reservas recibidas" : "Received Bookings"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/mi-panel/mi-servicio" className="flex items-center gap-2" onClick={closeMenu}>
              <HandHelping className="w-4 h-4" />
              {isSpanish ? "Mi Servicio" : "My Service"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/mi-panel/mi-perfil" className="flex items-center gap-2" onClick={closeMenu}>
              <User className="w-4 h-4" />
              {isSpanish ? "Editar Perfil" : "Edit Profile"}
            </Link>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            {isSpanish ? "Salir" : "Logout"}
          </li>
        </ul>

        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-[#162F40]">
          <p>{name}</p>
        </div>
      </div>
    </div>
  )
}
