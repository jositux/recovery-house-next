"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  HandHelpingIcon,
  LayoutGrid,
  Building2,
  LucideSquareArrowDown as CalendarArrowDown,
  CalendarClock as CalendarArrowUp,
  PlusCircle,
  Pencil,
  LogOut,
} from "lucide-react"

interface SidebarContentProps {
  userName: string
  onLogout: () => void
  onNavigate?: () => void
}

export function SidebarContent({ userName, onLogout, onNavigate }: SidebarContentProps) {
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
      name: "Mi Servicio",
      href: "/mi-panel/mi-servicio",
      icon: HandHelpingIcon,
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
    <>
      <nav className="space-y-2 mt-12 lg:mt-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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

      <div className="border-t border-gray-200 pt-4 space-y-2">
        {/* Perfil de usuario */}
        <Link
          href="/mi-panel/mi-perfil"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          </div>
          <Pencil className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
        </Link>

        {/* Botón de logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </>
  )
}
