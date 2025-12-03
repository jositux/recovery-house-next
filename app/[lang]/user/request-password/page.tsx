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

  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const isSpanish = lang === "es";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const directusUrl = process.env.NEXT_PUBLIC_SITE_BACKEND_URL;
      const response = await fetch(`${directusUrl}/auth/password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, 
          reset_url: `https://recoverycaresolutions.com/${lang}/user/reset-password`
        }),
      });
      
      if (response.ok) {
        router.push(isSpanish ? `/${lang}/login?message=reset` : `/${lang}/login?message=reset`); // Puedes usar query distinto si quieres
      } else {
        // Manejar error si es necesario
      }
    } catch (error) {
      console.log(error);
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
