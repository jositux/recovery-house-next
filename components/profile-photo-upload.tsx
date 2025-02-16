"use client"

import { ArrowLeft, UserCircle2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProfilePhotoDialog() {
  const [open, setOpen] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[440px] p-0">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-4" onClick={() => setOpen(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-base font-normal text-muted-foreground">Create your profile</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center px-6 py-8">
          <h2 className="text-xl font-semibold mb-2">Agregar foto de perfil</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Elige una imagen que muestre tu rostro. Los anfitriones no podrán ver tu foto de perfil hasta que se
            confirme tu reserva.
          </p>

          <div className="mb-8">
            <UserCircle2 className="h-32 w-32 text-muted" />
          </div>

          <Button className="w-full mb-4 bg-[#4A89DC] hover:bg-[#4A89DC]/90" size="lg">
            Subir foto
          </Button>

          <Button
            variant="ghost"
            className="text-[#4A89DC] hover:text-[#4A89DC]/90 hover:bg-transparent"
            onClick={() => setOpen(false)}
          >
            Lo hago luego
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

