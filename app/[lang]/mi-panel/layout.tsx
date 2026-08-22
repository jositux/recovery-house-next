import type React from "react"
import { type Locale } from "@/lib/i18n" 
import LayoutClient from "./LayoutClient"

/**
 * @component LayoutWrapper
 * @description Wrapper de Layout (SERVIDOR). 
 * Captura el parámetro 'lang' de la ruta como 'string' para Next.js 15,
 * lo valida a 'Locale' y lo pasa al componente de cliente.
 */
export default async function LayoutWrapper({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang: rawLang } = await params

  // Validamos y forzamos el tipo 'Locale' de manera segura
  const lang: Locale = rawLang === "en" ? "en" : "es"

  return (
    <LayoutClient lang={lang}>
      {children}
    </LayoutClient>
  )
}