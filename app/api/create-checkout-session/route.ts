import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { AUTH_COOKIE_ACCESS, DIRECTUS_URL } from '@/lib/directus';

const stripe = new Stripe(process.env.NEXT_STRIPE_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {

    // Requiere sesión: sin esto, cualquiera podía crear checkout sessions con
    // cualquier priceId sin estar logueado.
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

    const body = await request.json();
    const { priceId, lang } = body;

    if (!priceId || !lang) {
        return NextResponse.json({ error: 'Missing priceId or lang' }, { status: 400 });
    }

  try {
    // URL fija del sitio en vez del header Origin (que el cliente controla):
    // usarlo permitiría a un atacante redirigir el success/cancel a otro dominio.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/${lang}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${lang}/subscriptions`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}