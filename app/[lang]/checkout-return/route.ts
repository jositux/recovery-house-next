import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";

const apiKey = process.env.NEXT_STRIPE_KEY as string;
const stripe = new Stripe(apiKey);

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const stripeSessionId = searchParams.get("session_id");

  if (!stripeSessionId?.length) return redirect("/checkout");

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  if (session.status === "complete") {
    // Trae datos del payment
    if (
      typeof session.payment_intent === "string"
    ) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      // Go to a success page!
      return redirect(`/checkout/success/?rel=${paymentIntent.id}`);
      // Seguí con tu lógica aquí...
    } else {
      
    }
  }

  if (session.status === "open") {
    // Here you'll likely want to head back to some pre-payment page in your checkout
    // so the user can try again
    return redirect(`/checkout`);
  }

  return redirect("/rooms");
};
