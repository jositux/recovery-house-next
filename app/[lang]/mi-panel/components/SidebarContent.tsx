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


import { type Locale } from "@/lib/i18n"
import { RegisterServiceTrigger } from "@/components/RegisterServiceTrigger"

interface SidebarContentProps {
  userName: string
  lang: Locale // Usamos el tipo Locale
  onLogout: () => void
  onNavigate?: () => void
}

export function SidebarContent({ userName, lang, onLogout, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  
  // 1. Lógica de traducción
  const isSpanish = lang === "es";
  const t = (es: string, en: string) => isSpanish ? es : en;

  // 2. Definición de elementos de navegación con traducción
  const navItems = [
    {
      name: t("Mi Panel", "My Dashboard"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel`, 
      icon: LayoutGrid,
    },
    {
      name: t("Mis Propiedades", "My Properties"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/mis-propiedades`,
      icon: Building2,
    },
    {
      name: t("Mis Reservas", "My Bookings"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/reservas-realizadas`,
      icon: CalendarArrowUp,
    },
    {
      name: t("Reservas recibidas", "Received Bookings"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/reservas-recibidas`,
      icon: CalendarArrowDown,
    },
    {
      name: t("Mi Servicio", "My Service"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/mi-servicio`,
      icon: HandHelpingIcon,
    },
    {
      name: t("Nueva Propiedad", "New Property"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/registrar-propiedad`,
      icon: PlusCircle,
    },
    {
      name: t("Nuevo Servicio", "New Service"),
      // Rutas corregidas para incluir el prefijo de idioma
      href: `/${lang}/mi-panel/registrar-servicio`,
      icon: PlusCircle,
      isServiceTrigger: true,
    },
  ]

  // 3. Textos para el área de usuario y logout
  //const profileLinkText = t("Mi Perfil", "My Profile");
  const logoutText = t("Cerrar sesión", "Logout");

  return (
    <>
      <nav className="space-y-2 mt-12 lg:mt-0">
        {navItems.map((item) => {
          // Para que el enlace activo funcione correctamente con las rutas localizadas
          const isActive = pathname === item.href
          const Icon = item.icon
          const itemClassName = `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
            isActive ? "bg-[#39759E] text-white" : "text-gray-700 hover:bg-gray-100"
          }`

          if (item.isServiceTrigger) {
            return (
              <RegisterServiceTrigger key={item.href} lang={lang} className={itemClassName} onTriggerClick={onNavigate}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </RegisterServiceTrigger>
            )
          }

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={itemClassName}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        {/* Perfil de usuario */}
        <Link
          // Rutas corregidas para incluir el prefijo de idioma
          href={`/${lang}/mi-panel/mi-perfil`}
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
          <span className="font-medium">{logoutText}</span>
        </button>
      </div>
    </>
  )
}