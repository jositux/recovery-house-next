"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Building2, CalendarArrowDown, CalendarArrowUp, PlusCircle, Menu, Pencil, LogOut, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-16 z-40 lg:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 p-4 pt-16 lg:p-8 lg:pt-8">{children}</main>
    </div>
  )
}

function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/mi-panel",
      icon: LayoutGrid,
    },
    {
      name: "Mis Propiedades",
      href: "/mi-panel/mis-propiedades",
      icon: Building2,
    },
    {
      name: "Reservas realizadas",
      href: "/mi-panel/reservas-realizadas",
      icon: CalendarArrowUp,
    },
    {
      name: "Reservas recibidas",
      href: "/mi-panel/reservas-recibidas",
      icon: CalendarArrowDown,
    },
    {
      name: "Nueva Propiedad",
      href: "/mi-panel/registrar-propiedad",
      icon: PlusCircle,
    },
    {
      name: "Nuevo Servicio",
      href: "/mi-panel/registrar-servicio",
      icon: PlusCircle,
    },
  ]

  const handleLogout = () => {
    // Aquí puedes agregar la lógica de logout (ej: limpiar sesión, redirigir, etc.)
    console.log("Cerrando sesión...")
  }

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 lg:hidden p-1 rounded-lg hover:bg-gray-100"
        aria-label="Cerrar menú"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      <nav className="space-y-2 mt-12 lg:mt-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-[#39759E] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
        <Link
          href="/mi-panel/mi-perfil"
          onClick={onClose}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Juan Pérez</p>
            <p className="text-xs text-gray-500 truncate">juan@example.com</p>
          </div>
          <Pencil className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
