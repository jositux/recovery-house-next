"use client"

import { useState } from "react"
import { useActionState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Definición del esquema de validación
const creditCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "El número de tarjeta debe tener 16 dígitos"),
  cardHolder: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  expirationMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Mes inválido"),
  expirationYear: z.string().regex(/^\d{4}$/, "Año inválido"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
})

type CreditCardFormData = z.infer<typeof creditCardSchema>

interface FormState {
  errors: {
    [key: string]: string[]
  }
  message: string | null
  success: boolean
}

// Server Action
async function submitCreditCard(prevState: FormState, formData: FormData): Promise<FormState> {
  "use server"

  const rawFormData = Object.fromEntries(formData.entries())
  const validationResult = creditCardSchema.safeParse(rawFormData)

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: "Por favor, corrija los errores en el formulario.",
      success: false,
    }
  }

  // Aquí iría la lógica para procesar la tarjeta de crédito
  // Por ahora, solo simularemos un retraso y devolveremos un mensaje de éxito
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    errors: {},
    success: true,
    message: "Tarjeta de crédito procesada con éxito.",
  }
}

export default function CreditCardForm() {
  const initialState: FormState = { errors: {}, message: null, success: false }
  const [state, formAction, isPending] = useActionState(submitCreditCard, initialState)
  const [formData, setFormData] = useState<CreditCardFormData>({
    cardNumber: "",
    cardHolder: "",
    expirationMonth: "",
    expirationYear: "",
    cvv: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Datos de Tarjeta de Crédito</CardTitle>
        <CardDescription>Ingrese los detalles de su tarjeta de crédito</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleChange}
            />
            {state.errors.cardNumber && <p className="text-sm text-red-500">{state.errors.cardNumber[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardHolder">Nombre del Titular</Label>
            <Input
              id="cardHolder"
              name="cardHolder"
              placeholder="Juan Pérez"
              value={formData.cardHolder}
              onChange={handleChange}
            />
            {state.errors.cardHolder && <p className="text-sm text-red-500">{state.errors.cardHolder[0]}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expirationMonth">Mes</Label>
              <Input
                id="expirationMonth"
                name="expirationMonth"
                placeholder="MM"
                value={formData.expirationMonth}
                onChange={handleChange}
              />
              {state.errors.expirationMonth && (
                <p className="text-sm text-red-500">{state.errors.expirationMonth[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationYear">Año</Label>
              <Input
                id="expirationYear"
                name="expirationYear"
                placeholder="YYYY"
                value={formData.expirationYear}
                onChange={handleChange}
              />
              {state.errors.expirationYear && <p className="text-sm text-red-500">{state.errors.expirationYear[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" name="cvv" placeholder="123" value={formData.cvv} onChange={handleChange} />
              {state.errors.cvv && <p className="text-sm text-red-500">{state.errors.cvv[0]}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Procesando..." : "Enviar"}
          </Button>
        </CardFooter>
      </form>
      {state.message && (
        <p className={`text-center mt-4 ${state.success ? "text-green-500" : "text-red-500"}`}>{state.message}</p>
      )}
    </Card>
  )
}

