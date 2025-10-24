"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
//import { MobileSidebar } from "./components/MobileSidebar"
import { DesktopSidebar } from "./components/DesktopSidebar"
import { logoutUser } from "@/services/LogoutService"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
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
      window.dispatchEvent(new Event("storage"))
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar mobile 
      <MobileSidebar userName={userName} onLogout={handleLogout} />
*/}

      {/* Sidebar desktop */}
      <DesktopSidebar userName={userName} onLogout={handleLogout} />

      {/* Contenido principal */}
      <main className="flex-1 p-4 pt-4 md:pt-16 lg:p-8 lg:pt-8">{children}</main>
    </div>
  )
}
