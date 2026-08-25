"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Eye, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/userService"
import { getProvidersByUserId } from "@/services/providerCollectionService"
import { syncAuthCookies } from "@/utils/syncAuthCookies"

interface RegisterServiceTriggerProps {
  lang: string
  className?: string
  children: React.ReactNode
  onTriggerClick?: () => void
}

const texts = {
  es: {
    title: "Ya tienes un servicio registrado",
    description: "Ya cuentas con un servicio activo en la plataforma. Puedes revisarlo o editarlo según tus necesidades.",
    view: "Ver",
    edit: "Editar",
  },
  en: {
    title: "You already have a registered service",
    description: "You already have an active service on the platform. You can review it or edit it as needed.",
    view: "View",
    edit: "Edit",
  },
}

// Botón/link que chequea si ya existe un servicio ANTES de navegar: si ya
// existe, avisa en un popup ahí mismo (sin cambiar de página); si no, recién
// ahí navega al formulario de registro.
export function RegisterServiceTrigger({ lang, className, children, onTriggerClick }: RegisterServiceTriggerProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [showExisting, setShowExisting] = useState(false)
  const t = texts[lang === "en" ? "en" : "es"]

  const handleClick = async () => {
    if (checking) return
    onTriggerClick?.()
    setChecking(true)
    syncAuthCookies()

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push(`/${lang}/login`)
      return
    }

    try {
      const currentUser = await getCurrentUser(token)
      const data = await getProvidersByUserId(currentUser.id, token)

      if (data.length > 0) {
        setShowExisting(true)
      } else {
        router.push(`/${lang}/mi-panel/registrar-servicio`)
      }
    } catch (error) {
      console.error("Error al chequear servicio existente:", error)
      router.push(`/${lang}/mi-panel/registrar-servicio`)
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={checking}
        className={className}
        style={{ opacity: checking ? 0.6 : 1 }}
      >
        {children}
      </button>

      <Dialog open={showExisting} onOpenChange={setShowExisting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              {t.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">{t.description}</p>
          <DialogFooter className="sm:justify-center gap-2">
            <Link href={`/${lang}/mi-panel/mi-servicio`} className="w-full" onClick={() => setShowExisting(false)}>
              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                {t.view}
              </Button>
            </Link>
            <Link href={`/${lang}/mi-panel/editar-servicio`} className="w-full" onClick={() => setShowExisting(false)}>
              <Button className="w-full bg-[#39759E] hover:bg-[#2c5a7a]">
                <Edit className="mr-2 h-4 w-4" />
                {t.edit}
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
