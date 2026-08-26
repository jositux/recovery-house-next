"use server";

import { Stripe } from "stripe";

const apiKey = process.env.NEXT_STRIPE_KEY as string;

const stripe = new Stripe(apiKey);

interface NewSessionOptions {
  /*priceId: string;*/
  name: string;
  description: string;
  unit_amount: number;
  lang: string
}

export const postStripeSession = async ({
  /*priceId,*/
  name,
  description,
  unit_amount,
  lang
}: NewSessionOptions) => {
  // NODE_ENV es server-only (no lo puede manipular el cliente), a diferencia de
  // leer el header Origin de la request.
  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL;
  const returnUrl = `${baseUrl}/${lang}/checkout-return-modify?session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: "usd",
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
    allow_promotion_codes: true,
  });

  if (!session.client_secret) {
    throw new Error("Error initiating Stripe session");
  }

  return {
    clientSecret: session.client_secret,
  };
};
