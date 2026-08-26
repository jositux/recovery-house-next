import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { AUTH_COOKIE_ACCESS, DIRECTUS_URL } from '@/lib/directus';

const stripe = new Stripe(process.env.NEXT_STRIPE_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  // Requiere sesión: sin esto, cualquiera podía mandar cualquier sessionId y
  // confirmar si existe y si está pagado, sin login, gastando cuota de la API
  // de Stripe.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_ACCESS)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
  }

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
