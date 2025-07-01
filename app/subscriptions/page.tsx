"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE as string
);

function SubscriptionPlans() {
  const router = useRouter();
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const tokenNew = localStorage.getItem("new_service");
      if (!tokenNew) {
        router.push("/registrar-servicio");
        return;
      }
    };

    checkAuthAndFetchData();
  }, [router]);

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
        body: JSON.stringify({ priceId }),
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

  return (
    <div>
      <div className="container min-h-screen mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Elija su Plan para Profesionales
          </h2>
          <p className="text-sm text-[#162F40] max-w-2xl mx-auto">
            Ofrezca sus servicios de recuperación a más pacientes. Nuestras
            suscripciones le brindan visibilidad y las herramientas necesarias
            para conectar con pacientes y expandir su alcance profesional.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Plan Anual</CardTitle>
              <CardDescription className="text-xs">
                Máxima visibilidad y herramientas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              <p className="text-2xl font-bold mb-2">
                $100.00 USD<span className="text-sm font-normal"> / año</span>
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Aparición prioritaria en búsquedas</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Visible en todas las habitaciones relacionadas</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Pacientes ilimitados</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Herramientas avanzadas de seguimiento</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  handleSubscribe(
                    //josi"price_1Qk9kjJ7zGXf4A6tew2ueobK",
                    
                    //test
                    //"price_1R7cqLGDJ9gekygzcT6RrHD8",
                    //prod
                    "price_1R7fIeGDJ9gekygzgS7tXPiV",
                    "annual",
                    "$100.00"
                  )
                }
                className="bg-[#39759E] w-full text-sm"
              >
                Comenzar Plan Anual
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                Plan Trimestral
              </CardTitle>
              <CardDescription className="text-xs">
                Ideal para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              <p className="text-2xl font-bold mb-2">
                $40.00 USD<span className="text-sm font-normal"> / cada 3 meses</span>
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Aparición prioritaria en búsquedas</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Visible en todas las habitaciones relacionadas</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Pacientes ilimitados</span>
                </li>
                <li className="flex items-center space-x-1">
                  <Check className="text-green-500 flex-shrink-0 w-4 h-4" />
                  <span>Herramientas avanzadas de seguimiento</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  handleSubscribe(
                    //josi"price_1QsVaEJ7zGXf4A6t3m8k0BLq",
                    //test
                    //"price_1R7ctQGDJ9gekygzhq6qw9Eo",
                    //prod
                    "price_1R7fGXGDJ9gekygzgEmpQf0f",
                    "quarterly",
                    "$40.00"
                  )
                }
                className="w-full text-sm bg-[#39759E]"
              >
                Iniciar Plan Trimestral
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
