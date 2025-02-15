'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getProvidersByUserId } from "@/services/providerCollectionService";
import { getCurrentUser } from "@/services/userService";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string);


interface ProviderData {
  id: string
  name?: string
  email?: string
}
function SubscriptionPlans() {
  const [providerData, setProviderData] = useState<ProviderData[]>([])

  useEffect(() => {
    const fetchProviderData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
  
      try {
        const currentUser = await getCurrentUser(token);
        const data = await getProvidersByUserId(currentUser.id, token);
        setProviderData(data);
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error);
      }
    };
  
    fetchProviderData();
  }, []);

  const handleSubscribe = async (priceId: string, subscriptionType: string, price: string) => {
    // Guardar en localStorage la suscripción como un objeto
    const subscription = {
      subscriptionPrice: priceId,
      subscriptionType,
      price,
    };
    localStorage.setItem("subscription", JSON.stringify(subscription));

    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });
    const { sessionId } = await response.json();

    if (stripe) {
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
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-16">
        {providerData.length > 0 ? (
          <Card className="bg-white rounded-xl p-8 shadow-md text-center max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Servicio Cargado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Parece que ya cargaste tu servicio.</p>
            </CardContent>
            <CardFooter>
              <Link href="/editar-servicio">
                <Button variant="outline" className="w-full">Editar</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Planes para Profesionales de la Salud</h2>
              <p className="text-sm text-[#162F40] max-w-2xl mx-auto">
                Ofrezca sus servicios de recuperación a más pacientes. Nuestras suscripciones le brindan visibilidad y las
                herramientas necesarias para conectar con pacientes y expandir su alcance profesional.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Plan Anual</CardTitle>
                  <CardDescription className="text-xs">Máxima visibilidad y herramientas</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <p className="text-2xl font-bold mb-2">
                    $100.00<span className="text-sm font-normal">/año</span>
                  </p>
                  <ul className="space-y-1 text-sm">
                    <BenefitItem>Aparición prioritaria en búsquedas</BenefitItem>
                    <BenefitItem>Visible en todas las habitaciones relacionadas</BenefitItem>
                    <BenefitItem>Pacientes ilimitados</BenefitItem>
                    <BenefitItem>Herramientas avanzadas de seguimiento</BenefitItem>
                    <BenefitItem>Integración con sistemas de salud</BenefitItem>
                    <BenefitItem>Soporte prioritario 24/7</BenefitItem>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe("price_1Qk9kjJ7zGXf4A6tew2ueobK", "annual", "$100.00")}
                    className="bg-[#39759E] w-full text-sm"
                  >
                    Comenzar Plan Premium
                  </Button>
                </CardFooter>
              </Card>
  
              <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Plan Trimestral</CardTitle>
                  <CardDescription className="text-xs">Ideal para comenzar</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-4">
                  <p className="text-2xl font-bold mb-2">
                    $40.00<span className="text-sm font-normal">/cada 3 meses</span>
                  </p>
                  <ul className="space-y-1 text-sm">
                    <BenefitItem>Aparición prioritaria en búsquedas</BenefitItem>
                    <BenefitItem>Visible en todas las habitaciones relacionadas</BenefitItem>
                    <BenefitItem>Pacientes ilimitados</BenefitItem>
                    <BenefitItem>Herramientas avanzadas de seguimiento</BenefitItem>
                    <BenefitItem>Integración con sistemas de salud</BenefitItem>
                    <BenefitItem>Soporte prioritario 24/7</BenefitItem>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe("price_1QsVaEJ7zGXf4A6t3m8k0BLq", "quarterly", "$40.00")}
                    className="w-full text-sm bg-[#39759E]"
                  >
                    Iniciar Plan Básico
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPlans;
