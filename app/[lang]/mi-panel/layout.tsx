import type React from "react"
// Importamos el tipo Locale desde la biblioteca de i18n
import { type Locale } from "@/lib/i18n" 
// Importamos el componente de cliente que contiene la lógica del layout
// Ajusta la ruta si DashboardLayoutClient no está en el directorio 'components' relativo a este layout.
import LayoutClient from "./LayoutClient"

// ----------------------------------------------------------------------
// 1. Tipado del Server Component (LayoutWrapper)
// ----------------------------------------------------------------------



/**
 * @component LayoutWrapper
 * @description Wrapper de Layout (SERVIDOR). Este es el 'default' export que Next.js espera.
 * Captura el parámetro 'lang' de la ruta y lo pasa al componente de cliente.
 */
 export default async function LayoutWrapper({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  // Debe ser Promise<{ lang: Locale }>
  params: Promise<{ lang: Locale }>
}>) {

  const { lang } = await params // El 'await' es necesario
  // Aquí no necesitamos esperar (await) si params no es una Promise.
  // Si la ruta es app/[lang]/mi-panel, 'lang' se extrae directamente de params.
  
  
  // --------------------------------------------------------------------
  // 2. Renderiza el Client Component con la prop 'lang'
  // --------------------------------------------------------------------
  return (
    <LayoutClient lang={lang}>
      {children}
    </LayoutClient>
  );
}