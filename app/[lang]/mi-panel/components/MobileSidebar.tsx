"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { SidebarContent } from "./SidebarContent"

interface MobileSidebarProps {
  userName: string
  onLogout: () => void
}

export function MobileSidebar({ userName, onLogout }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-16 z-40 lg:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay oscuro */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar deslizable */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden
          w-64 bg-white border-r border-gray-200 p-4
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Contenido del sidebar */}
        <SidebarContent userName={userName} onLogout={onLogout} onNavigate={() => setIsOpen(false)} />
      </aside>
    </>
  )
}
