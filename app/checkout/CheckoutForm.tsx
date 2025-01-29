"use client"

import React, { useCallback, useMemo } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"

import { postStripeSession } from "@/server-actions/stripeSession"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string)

interface CheckoutFormProps {
  bookingData: {
    name?: string
    description?: string
    unit_amount: number
    guests?: number
  }
}

export const CheckoutForm = ({ bookingData }: CheckoutFormProps) => {
  console.log("viene aca ", bookingData)

  // Función para obtener el clientSecret
  const fetchClientSecret = useCallback(async () => {
    if (!bookingData || Object.keys(bookingData).length === 0) {
      throw new Error("No se encontró información de la reserva.")
    }
    try {
      const stripeResponse = await postStripeSession({
        name: bookingData.name || "Sin nombre", // Valor predeterminado si no existe
        description: bookingData.description || "Sin descripción", // Valor predeterminado si no existe
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

