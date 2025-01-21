// src/server-actions/stripeSession.tsx

"use server";

import { Stripe } from "stripe";

const apiKey = process.env.NEXT_STRIPE_KEY as string;

const stripe = new Stripe(apiKey);

interface NewSessionOptions {
  priceId: string;
  name: string;
  description: string;
  unit_amount: number;
}

export const postStripeSession = async ({
  priceId,
  name,
  description,
  unit_amount,
}: NewSessionOptions) => {
  const returnUrl =
    "http://localhost:3000/checkout-return?session_id={CHECKOUT_SESSION_ID}";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: "cop",
          product_data: {
            name,
            description,
          },
          unit_amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: returnUrl,
  });

  if (!session.client_secret) {
    throw new Error("Error initiating Stripe session");
  }

  return {
    clientSecret: session.client_secret,
  };
};
