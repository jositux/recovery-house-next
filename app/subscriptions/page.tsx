'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string);

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  price_id: string;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // Fetch subscription plans from your API
    fetch('/api/subscription-plans')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;
    const { sessionId } = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    }).then(res => res.json());

    if(stripe) {
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error);
    }

  }
  };


function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center space-x-1">
      <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
      <span>{children}</span>
    </li>
  )
}

  

  return (
    <div>
       <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Planes para Profesionales de la Salud</h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Ofrezca sus servicios de recuperación a más pacientes. Nuestras suscripciones le brindan visibilidad y las
          herramientas necesarias para conectar con pacientes y expandir su alcance profesional.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Plan Premium</CardTitle>
            <CardDescription className="text-xs">Máxima visibilidad y herramientas</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-4">
            <p className="text-2xl font-bold mb-2">
              $199.99<span className="text-sm font-normal">/mes</span>
            </p>
            <ul className="space-y-1 text-sm">
              <BenefitItem>Aparición prioritaria en búsquedas</BenefitItem>
              <BenefitItem>Visible en todas las habitaciones relacionadas</BenefitItem>
              <BenefitItem>Pacientes ilimitados</BenefitItem>
              <BenefitItem>Videoconferencias HD sin límite</BenefitItem>
              <BenefitItem>Herramientas avanzadas de seguimiento</BenefitItem>
              <BenefitItem>Integración con sistemas de salud</BenefitItem>
              <BenefitItem>Soporte prioritario 24/7</BenefitItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSubscribe("price_1Qk9b2J7zGXf4A6t6SrPr0ba")} className="w-full text-sm">Comenzar Plan Premium</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Plan Básico</CardTitle>
            <CardDescription className="text-xs">Ideal para comenzar</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-4">
            <p className="text-2xl font-bold mb-2">
              $99.99<span className="text-sm font-normal">/mes</span>
            </p>
            <ul className="space-y-1 text-sm">
              <BenefitItem>Aparición estándar en búsquedas</BenefitItem>
              <BenefitItem>Visible en 5 habitaciones relacionadas</BenefitItem>
              <BenefitItem>Hasta 50 pacientes activos</BenefitItem>
              <BenefitItem>100 horas de videoconferencia/mes</BenefitItem>
              <BenefitItem>Herramientas básicas de seguimiento</BenefitItem>
              <BenefitItem>Portal de pacientes personalizable</BenefitItem>
              <BenefitItem>Soporte por email y chat</BenefitItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-sm">Iniciar Plan Básico</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
      <h1>Choose a Subscription Plan</h1>
      {plans.map(plan => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>{plan.price_id}</p>
          <p>Price: ${plan.price / 100} / {plan.interval}</p>
          <button onClick={() => handleSubscribe(plan.price_id)}>Subscribe</button>
        </div>
      ))}
    </div>
  );
}
