"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DesktopSidebar } from "./components/DesktopSidebar" 
// import { MobileSidebar } from "./MobileSidebar"
import { logoutUser } from "@/services/LogoutService"
import { type Locale } from "@/lib/i18n" 

interface LayoutClientProps {
  children: React.ReactNode;
  lang: Locale; 
}

/**
 * @component DashboardLayoutClient
 * @description Layout principal (CLIENTE). Maneja la autenticación, el estado de usuario,
 * y la estructura de la interfaz de usuario, recibiendo 'lang'.
 */
export default function LayoutClient({
  children,
  lang
}: LayoutClientProps) {
  
  const [userName, setUserName] = useState("")
  const router = useRouter()

  // Lógica para verificar la autenticación y obtener el nombre de usuario
  useEffect(() => {
    const checkAuth = () => {
      // Nota: En un entorno de producción, la autenticación debe basarse en cookies seguras/sesión.
      const rawName = localStorage.getItem("nombre")
      const name = rawName && rawName !== "null" && rawName.trim() !== "" ? rawName : "Usuario sin nombre"

      setUserName(name)
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        console.error("No se encontró el token de refresco")
        return
      }

      await logoutUser(refreshToken)
      
      // Limpiar tokens y disparar evento para actualizar el estado en otros tabs/ventanas
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("nombre")
      
      window.dispatchEvent(new Event("storage"))
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar userName={userName} onLogout={handleLogout} lang={lang} />

      {/* Contenido principal (page.tsx) */}
      <main className="flex-1 p-4 pt-4 md:pt-16 lg:p-8 lg:pt-8">{children}</main>
    </div>
  )
}