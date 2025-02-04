"use client"

import { Suspense } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/forms/LoginForm"
import { useSearchParams } from "next/navigation"
import {LucideUserCheck, Mail } from 'lucide-react'

function MessageBanner() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  if (message === "aceptado") {
    return (

      <div className="m-4 p-4 rounded-2xl text-center">
      <LucideUserCheck className="w-8 h-8 mx-auto text-green-700" />
      <p className="mt-2 text-gl text-green-700">
      ¡Bienvenido! Puedes empezar a usar el sistema.   </p>
    </div>
    
    )
  }

  if (message === "reset") {
    return (
      <div className="m-4 p-4 rounded-2xl text-center">
      <Mail className="w-8 h-8 mx-auto text-green-700" />
      <p className="mt-2 text-gl text-green-700">
      Atención: Revisa tu casilla de Email para recuperar tu contraseña.   </p>
    </div>
    )
  }

  if (message === "reset-ok") {
    return (
      <div className="m-4 p-4 rounded-2xl text-center">
      <LucideUserCheck className="w-8 h-8 mx-auto text-green-700" />
      <p className="mt-2 text-gl text-green-700">
      Puedes ingresar con tu nueva contraseña.   </p>
    </div>
      
    )
  }

  return null
}

export default function LoginPage() {
  return (
    <div className="bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto flex flex-col items-center sm:w-full sm:max-w-md">
        <Suspense fallback={null}>
          <MessageBanner />
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
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
