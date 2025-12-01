"use client"

import { Suspense } from "react"
import Image from "next/image"
import { useParams, useSearchParams } from "next/navigation" // Importamos useParams y useSearchParams
import { LoginForm } from "@/components/forms/LoginForm"
import { LucideUserCheck, Mail } from 'lucide-react'
import { type Locale } from "@/lib/i18n" 

// --- Translation Data ---

interface MessageTranslation {
  title: string
  message: string
}

const translations: Record<string, Record<string, MessageTranslation>> = {
  es: {
    aceptado: {
      title: "¡Bienvenido!",
      message: "Ingresa a la plataforma y puedes continuar configurando tu perfil.",
    },
    reset: {
      title: "Atención:",
      message: "Revisa tu casilla de Email para recuperar tu contraseña.",
    },
    "reset-ok": {
      title: "¡Éxito!",
      message: "Puedes ingresar con tu nueva contraseña.",
    },
  },
  en: {
    aceptado: {
      title: "Welcome!",
      message: "Log into the platform and you can continue configuring your profile.",
    },
    reset: {
      title: "Attention:",
      message: "Check your Email inbox to recover your password.",
    },
    "reset-ok": {
      title: "Success!",
      message: "You can log in with your new password.",
    },
  },
}

function MessageBanner({ lang }: { lang: string }) {
  const searchParams = useSearchParams()
  const messageKey = searchParams.get("message")
  
  // Select the appropriate translation set
  const t = translations[lang] || translations.es; // Fallback to 'es'

  if (!messageKey || !t[messageKey]) {
    return null;
  }

  const messageData = t[messageKey];

  return (
    <div className="m-4 p-4 rounded-2xl text-center">
      {/* Icon based on message type */}
      {messageKey === 'reset' ? (
        <Mail className="w-8 h-8 mx-auto text-green-700" />
      ) : (
        <LucideUserCheck className="w-8 h-8 mx-auto text-green-700" />
      )}
      
      <p className="mt-2 text-gl text-green-700">
        <span className="font-semibold">{messageData.title}</span> {messageData.message}
      </p>
    </div>
  )
}

export default function LoginPage() {
  // 1. Obtener el idioma de la URL usando useParams()
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es' if not found

  return (
    <div className="bg-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto flex flex-col items-center sm:w-full sm:max-w-md">
        {/* Pasamos 'lang' al MessageBanner para que pueda cargar las traducciones */}
        <Suspense fallback={null}>
          <MessageBanner lang={lang} />
        </Suspense>
        <Image
          src="/assets/logo2.svg"
          alt="Recovery Care Solutions"
          width={180}
          height={80}
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Pasamos la variable 'lang' al LoginForm */}
          <LoginForm lang={lang}/>
        </div>
      </div>
    </div>
  )
}