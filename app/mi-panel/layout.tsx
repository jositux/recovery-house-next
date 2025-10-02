"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Building2, CalendarArrowDown, CalendarArrowUp, PlusCircle, Menu, X } from "lucide-react"

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
        className="fixed top-4 left-4 z-40 lg:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200"
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

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
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
    </aside>
  )
}
