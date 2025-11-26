import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
      type: 'recurring',
    });

    const plans = prices.data
      .filter(price => typeof price.product !== 'string' && !price.product.deleted) // Ensure product is not a string or deleted
      .map(price => {
        const product = price.product as Stripe.Product; // Narrow type to Product
        return {
          id: price.id,
          name: product.name,
          description: product.description || '',
          price: price.unit_amount || 0,
          interval: price.recurring?.interval || 'unknown',
          price_id: price.id,
        };
      });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription plans. Please try again later.' },
      { status: 500 }
    );
  }
}
