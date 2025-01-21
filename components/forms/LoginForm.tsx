"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { loginService, LoginCredentials } from "@/services/loginService"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const router = useRouter()

  const loginSchema = z.object({
    email: z.string().email({
      message: "Por favor ingresa un email válido."
    }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres."
    })
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    setAuthError(null) // Limpiar mensajes de error previos
    try {
      const response = await loginService.login(values as LoginCredentials)
    
      localStorage.setItem('expires', response.data.expires)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('access_token', response.data.access_token)

      router.push('/rooms')
    } catch (error) {
      if (axios.isAxiosError(error)) {
  
        if (error.response?.status === 401) {
          // Mostrar el mensaje de error específico
          setAuthError('Verifica usuario y/o contraseña')
        } else {
          // Manejar otros códigos de error
          setAuthError(
            `Error: ${error.response?.status || "Sin código"} - ${error.response?.statusText || "Sin mensaje"}`
          )
        }
      } else {
       
        /*setAuthError("Ocurrió un error inesperado. Intenta de nuevo.")*/
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {authError && (
          <p className="text-red-500 text-sm mt-2 mb-2" role="alert">
            {authError}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-[#4A7598] hover:bg-[#3A5F7A]"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </Form>
  )
}
