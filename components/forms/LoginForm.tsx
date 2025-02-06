"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { useRouter } from "next/navigation"
import { loginService, type LoginCredentials } from "@/services/loginService"
import { getCurrentUser, type User } from "@/services/userService"
import Link from "next/link"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const router = useRouter()

  const loginSchema = z.object({
    email: z.string().email({
      message: "Por favor ingresa un email válido.",
    }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres.",
    }),
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

      localStorage.setItem("expires", response.data.expires)
      localStorage.setItem("refresh_token", response.data.refresh_token)
      localStorage.setItem("access_token", response.data.access_token)

      const currentUser: User = await getCurrentUser(response.data.access_token)
      localStorage.setItem("nombre", currentUser.first_name + " " + currentUser.last_name)

      window.dispatchEvent(new Event("storage"))

      // Verificar el initialRole y redirigir
      const initialRole = localStorage.getItem("initialRole")
      switch (initialRole) {
        case "Patient":
          router.push("/w-visitante")
          break
        case "PropertyOwner":
          router.push("/w-host")
          break
        case "ServiceProvider":
          router.push("/w-proveedor")
          break
        default:
          router.push("/rooms")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setAuthError("Verifica usuario y/o contraseña")
        } else {
          setAuthError(
            `Error: ${error.response?.status || "Sin código"} - ${error.response?.statusText || "Sin mensaje"}`,
          )
        }
      } else {
        setAuthError("Verifica usuario y/o contraseña")
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
                  <Input type={showPassword ? "text" : "password"} placeholder="Tu contraseña" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
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
        <div className="text-sm">
          <Link href="/user/request-password" className="text-[#39759E] hover:underline">
            ¿Has olvidado la contraseña?
          </Link>
        </div>
        <Button type="submit" className="w-full bg-[#39759E] hover:bg-[#39759E]" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
        <div className="text-sm text-center">
          <Link href="/register" className="text-[#39759E] hover:underline">
            ¿Aún no tienes cuenta? Regístrate
          </Link>
        </div>
      </form>
    </Form>
  )
}

