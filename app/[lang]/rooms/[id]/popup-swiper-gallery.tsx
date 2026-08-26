"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

// Swiper (~pesado) se separa en su propio chunk: no viaja en el bundle inicial
// de la página de la habitación, solo lo descargan quienes ven este botón.
const GalleryContent = dynamic(() => import("./gallery-content").then((m) => m.GalleryContent), {
  ssr: false,
})

interface PopupSwiperGalleryProps {
  images: {
    src: string
    alt: string
  }[]
  buttonText?: string
  autoplay?: boolean
}

export function PopupSwiperGallery({
  images,
  buttonText = "Ver galería de imágenes",
  autoplay = true,
}: PopupSwiperGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Precarga el chunk de la galería en segundo plano una vez que el navegador
  // queda libre, para que al hacer click en el botón abra sin demora.
  const [shouldPreload, setShouldPreload] = useState(false)

  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (id: number) => void
    }
    const idle = win.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1))
    const cancelIdle = win.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setShouldPreload(true))
    return () => cancelIdle(id as number)
  }, [])

  return (
    <>
      <Button className="flex gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsOpen(true)}>
        <ImageIcon className="h-4 w-4" />
        {buttonText}
      </Button>

      {(shouldPreload || isOpen) && (
        <GalleryContent images={images} autoplay={autoplay} isOpen={isOpen} onOpenChange={setIsOpen} />
      )}
    </>
  )
}
