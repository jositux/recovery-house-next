import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { locales, defaultLocale } from "@/lib/i18n";

const apiKey = process.env.NEXT_STRIPE_KEY as string;
const stripe = new Stripe(apiKey);

export const GET = async (request: NextRequest) => {
  const { searchParams, pathname } = new URL(request.url);

  // El idioma viene en la propia ruta (/es/checkout-return, /en/checkout-return);
  // hay que recuperarlo para no perderlo en los redirects de abajo.
  const segment = pathname.split("/").filter(Boolean)[0];
  const lang = locales.includes(segment as (typeof locales)[number]) ? segment : defaultLocale;

  const stripeSessionId = searchParams.get("session_id");

  if (!stripeSessionId?.length) return redirect(`/${lang}/checkout`);

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  if (session.status === "complete") {
    // Trae datos del payment
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (paymentIntentId) {
      return redirect(`/${lang}/checkout/success/?rel=${paymentIntentId}`);
    }
  }

  if (session.status === "open") {
    // Here you'll likely want to head back to some pre-payment page in your checkout
    // so the user can try again
    return redirect(`/${lang}/checkout`);
  }

  return redirect(`/${lang}/rooms`);
};
