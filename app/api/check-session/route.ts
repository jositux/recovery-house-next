import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Solo se expone lo que el cliente realmente necesita (el estado del pago).
    // La sesión completa de Stripe trae PII (email, dirección, monto) que
    // cualquiera con el sessionId podría leer si la devolviéramos entera.
    return NextResponse.json({
      session: {
        status: session.status,
        payment_status: session.payment_status,
      },
    });
  } catch (error) {
    // Narrow the type of error to properly access its properties
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 400 });
  }
}
