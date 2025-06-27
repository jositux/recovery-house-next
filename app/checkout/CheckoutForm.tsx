"use client"

import { useCallback, useMemo } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"

import { postStripeSession } from "@/server-actions/stripeSession"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string)

interface CheckoutFormProps {
  bookingData: {
    name?: string
    description?: string
    unit_amount: number
  }
}

// Función para limpiar HTML y dejar solo texto plano
const cleanHtmlDescription = (htmlString: string): string => {
  if (!htmlString) return "Sin descripción"

  // Crear un elemento temporal para parsear el HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = htmlString

  // Extraer solo el texto, preservando espacios
  const textContent = tempDiv.textContent || tempDiv.innerText || ""

  // Limpiar espacios extra y saltos de línea múltiples
  return (
    textContent
      .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
      .trim() || // Eliminar espacios al inicio y final
    "Sin descripción"
  ) // Fallback si queda vacío
}

export const CheckoutForm = ({ bookingData }: CheckoutFormProps) => {
  // Función para obtener el clientSecret
  const fetchClientSecret = useCallback(async () => {
    if (!bookingData || Object.keys(bookingData).length === 0) {
      throw new Error("No se encontró información de la reserva.")
    }
    try {
      const stripeResponse = await postStripeSession({
        name: bookingData.name || "Sin nombre",
        description: cleanHtmlDescription(bookingData.description || ""),
        unit_amount: bookingData.unit_amount,
      })
      return stripeResponse.clientSecret
    } catch (error) {
      console.error("Error obteniendo clientSecret:", error)
      throw new Error("No se pudo generar la sesión de Stripe.")
    }
  }, [bookingData])

  // Opciones del EmbeddedCheckoutProvider
  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret])

  // Verifica que bookingData no esté vacío
  if (!bookingData || Object.keys(bookingData).length === 0) {
    return <p>No se encontró información de la reserva.</p>
  }

  // Ya que los hooks se han ejecutado, renderizamos el componente
  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
