"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface SimpleTermsCheckboxProps {
  onAccept: (accepted: boolean) => void
}

export function SimpleTermsCheckbox({ onAccept }: SimpleTermsCheckboxProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = (checked: boolean) => {
    setAccepted(checked)
    onAccept(checked)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 space-y-3">
      
        <p className="text-xs text-muted-foreground leading-tight">
          Acepto tratar a todos los miembros de la comunidad independientemente de su raza, religión, origen nacional,
          etnia, color de piel, discapacidad, sexo, identidad de género, orientación sexual o edad, con respeto y sin
          juicios ni prejuicios.
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={handleAccept} />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acepto los términos y condiciones
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}

