import { NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.NEXT_STRIPE_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {
    
    const body = await request.json();
    const { priceId, lang } = body; 
  
    if (!priceId || !lang) {
        return NextResponse.json({ error: 'Missing priceId or lang' }, { status: 400 });
    }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/${lang}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/${lang}/subscriptions`,
    });

    console.log(session.id)
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}