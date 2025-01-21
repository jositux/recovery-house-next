'use client'
import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";

import { postStripeSession } from "@/server-actions/stripeSession";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string,
);

interface CheckoutFormProps {
    priceId: string;
    bookingData: {
        name?: string;
        description?: string;
        unit_amount?: number;
    };
}

export const CheckoutForm = ({ priceId, bookingData }: CheckoutFormProps) => {
    const fetchClientSecret = useCallback(async () => {
        const stripeResponse = await postStripeSession({
            priceId,
            name: bookingData.name || "", // Valor predeterminado: cadena vacía
            description: bookingData.description || "", // Valor predeterminado: cadena vacía
            unit_amount: bookingData.unit_amount || 0, // Valor predeterminado: 0
        });
        return stripeResponse.clientSecret;
    }, [priceId, bookingData]);

    const options = { fetchClientSecret };

    return (
        <div id="checkout">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
};
