"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { loadStripe } from "@stripe/stripe-js";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Definición simple de tipos de idioma (simulando la importación de i18n)
type Locale = "es" | "en"; 
// NOTA: Se eliminó la importación de "@/lib/translations"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string
);

function SubscriptionPlans() {
  const router = useRouter();
  
  // 🌐 Lógica de Idioma
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const isSpanish = lang === "es";



  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Redirección con idioma
        router.push(`/${lang}/login`);
        return;
      }

      const tokenNew = localStorage.getItem("new_service");
      if (!tokenNew) {
        // Redirección con idioma
        router.push(`/${lang}/registrar-servicio`);
        return;
      }
    };

    checkAuthAndFetchData();
  }, [router, lang]); // Dependencias actualizadas

  const handleSubscribe = async (
    priceId: string,
    subscriptionType: string,
    price: string
  ) => {
    // Obtener "new_service" de localStorage si existe
    const newService = localStorage.getItem("new_service");

    if (!newService) {
      console.warn(
        "No se encontró 'new_service' en localStorage. No se realizó la suscripción."
      );
      return; // Sale de la función si no hay localStorage
    }

    try {
      const newServiceData = JSON.parse(newService);

      // Mantiene valores previos si existen, de lo contrario usa los nuevos valores
      const updatedService = {
        ...newServiceData,
        subscriptionPrice: newServiceData.subscriptionPrice?.trim()
          ? newServiceData.subscriptionPrice
          : priceId,
        subscriptionType: newServiceData.subscriptionType?.trim()
          ? newServiceData.subscriptionType
          : subscriptionType,
        price: newServiceData.price?.trim() ? newServiceData.price : price,
      };

      // Guardar "new_service" actualizado en localStorage
      localStorage.setItem("new_service", JSON.stringify(updatedService));

      // Llamar a Stripe solo si "new_service" existe en localStorage
      console.log(priceId);
      const stripe = await stripePromise;
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, lang }),
      });

      const { sessionId } = await response.json();

      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId });
        if (result.error) {
          console.error(result.error);
        }
      }
    } catch (error) {
      console.error("Error al manejar la suscripción:", error);
    }
  };


  // --- Textos Localizados ---
  const texts = {
    pageTitle: isSpanish
      ? "Elija su Plan para Profesionales"
      : "Choose Your Professional Plan",
    pageDescription: isSpanish
      ? "Ofrezca sus servicios de recuperación a más pacientes. Nuestras suscripciones le brindan visibilidad y las herramientas necesarias para conectar con pacientes y expandir su alcance profesional."
      : "Offer your recovery services to more patients. Our subscriptions provide you with visibility and the necessary tools to connect with patients and expand your professional reach.",
    
    // Plan Anual
    annualTitle: isSpanish ? "Plan Anual (Piloto)" : "Annual Plan (Pilot)",
    annualDescription: isSpanish ? "Máxima visibilidad y herramientas" : "Maximum visibility and tools",
    annualDuration: isSpanish ? " por año" : " per month",
    annualFeatures: [
      isSpanish ? "Aparición prioritaria en búsquedas" : "Priority appearance in searches",
      isSpanish ? "Visible en todas las habitaciones relacionadas" : "Visible in all related rooms",
      isSpanish ? "Pacientes ilimitados" : "Unlimited patients",
      isSpanish ? "Herramientas avanzadas de seguimiento" : "Advanced tracking tools",
    ],
    annualButton: isSpanish ? "Comenzar Plan Anual" : "Start Annual Plan",

    // Plan Trimestral
    quarterlyTitle: isSpanish ? "Piloto" : "Pilot",
    quarterlyDescription: isSpanish ? "Ideal para comenzar" : "Ideal for starting out",
    quarterlyDuration: isSpanish ? "" : "",
    quarterlyFeatures: [
      isSpanish ? "Aparición prioritaria en búsquedas" : "Priority appearance in searches",
      isSpanish ? "Visible en todas las habitaciones relacionadas" : "Visible in all related rooms",
      isSpanish ? "Pacientes ilimitados" : "Unlimited patients",
      isSpanish ? "Herramientas avanzadas de seguimiento" : "Advanced tracking tools",
    ],
    quarterlyButton: isSpanish ? "Iniciar Plan Trimestral" : "Start Quarterly Plan",
  };


  return (
    <div>
      <div className="container min-h-screen mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {texts.pageTitle}
          </h2>
          <p className="text-sm text-[#162F40] max-w-2xl mx-auto">
            {texts.pageDescription}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Plan Anual */}
          <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">{texts.annualTitle}</CardTitle>
              <CardDescription className="text-xs">
                {texts.annualDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              <p className="text-2xl font-bold mb-2">
                ${process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL_AMOUNT} USD<span className="text-sm font-normal">{texts.annualDuration}</span>
              </p>
              <ul className="space-y-1 text-sm">
                {texts.annualFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  handleSubscribe(
                    process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL as string,
                    "annual",
                    `$${process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL_AMOUNT}`
                  )
                }
                className="bg-[#39759E] w-full text-sm"
              >
                {texts.annualButton}
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Trimestral */}
          <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                {texts.quarterlyTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                {texts.quarterlyDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              <p className="text-2xl font-bold mb-2">
                ${process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_AMOUNT} USD
                <span className="text-sm font-normal">{texts.quarterlyDuration}</span>
              </p>
              <ul className="space-y-1 text-sm">
                {texts.quarterlyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  handleSubscribe(
                    process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY as string,
                    "quarterly",
                    `$${process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_AMOUNT}`
                  )
                }
                className="w-full text-sm bg-[#39759E]"
              >
                {texts.quarterlyButton}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;