'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";
import { Fraunces } from "next/font/google";
import { type Locale } from '@/lib/i18n';

const fraunces = Fraunces({ subsets: ["latin"] });

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const isSpanish = lang === "es";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Ruta relativa (no la URL absoluta de NEXT_PUBLIC_SITE_BACKEND_URL): así el
      // navegador la ve same-origin y pasa por el rewrite /webapi/* del propio Next.js
      // en vez de pegarle directo al dominio público (que en local da CORS).
      const response = await fetch(`/webapi/auth/password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          // Sin el segmento de idioma: así coincide con las entradas de
          // PASSWORD_RESET_URL_ALLOW_LIST en Directus (no tienen /es//en/).
          // El middleware detecta el idioma y redirige preservando el ?token=.
          reset_url: `${window.location.origin}/user/reset-password`
        }),
      });
      
      if (response.ok) {
        router.push(isSpanish ? `/${lang}/login?message=reset` : `/${lang}/login?message=reset`); // Puedes usar query distinto si quieres
      } else if (response.status === 429) {
        const data = await response.json().catch(() => null);
        setError(
          data?.message ||
            (isSpanish
              ? 'Demasiados intentos. Probá de nuevo en unos minutos.'
              : 'Too many attempts. Try again in a few minutes.')
        );
      } else {
        setError(
          isSpanish
            ? 'No pudimos procesar la solicitud. Verifica el correo e intenta de nuevo.'
            : "We couldn't process the request. Check the email and try again."
        );
      }
    } catch {
      setError(
        isSpanish
          ? 'Ocurrió un error de conexión. Intenta de nuevo.'
          : 'A connection error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
       <Image
          src="/assets/logo2.svg"
          alt="Recovery Care Solutions"
          width={180}
          height={80}
        />
      <div className="w-full max-w-md m-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2
            className={`${fraunces.className} text-2xl text-center font-medium mb-6`}
          >
            {isSpanish ? "Restablecer contraseña" : "Reset Password"}
          </h2>
        </div>
       
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email" className="sr-only">
                {isSpanish ? "Correo electrónico" : "Email"}
              </Label>
              <p className="mt-2 text-center text-sm text-[#162F40] py-6">
                {isSpanish
                  ? "Atención: Se enviará un correo electrónico a la dirección proporcionada con instrucciones para restablecer tu contraseña."
                  : "Attention: An email will be sent to the provided address with instructions to reset your password."}
              </p>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[#162F40] rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={isSpanish ? "Correo electrónico" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#39759E] hover:bg-[#39759E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading
                ? isSpanish ? 'Enviando...' : 'Sending...'
                : isSpanish ? 'Enviar' : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
