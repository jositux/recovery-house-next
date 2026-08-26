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
import Link from "next/link"

// --- Translation Interfaces and Data ---

interface LoginTranslation {
  emailLabel: string
  passwordLabel: string
  emailPlaceholder: string
  passwordPlaceholder: string
  emailInvalid: string
  passwordMinLength: string
  showPassword: string
  hidePassword: string
  forgotPassword: string
  noAccount: string
  noAccountLink: string
  submitButton: string
  loadingButton: string
  authErrorGeneric: string
  authError401: string
  authErrorOther: (status: number | string, text: string) => string
}

const translations: Record<string, LoginTranslation> = {
  es: {
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    emailPlaceholder: "tu@email.com",
    passwordPlaceholder: "Tu contraseña",
    emailInvalid: "Por favor ingresa un email válido.",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    forgotPassword: "¿Has olvidado la contraseña?",
    noAccount: "¿Aún no tienes cuenta?",
    noAccountLink: "Regístrate",
    submitButton: "Iniciar sesión",
    loadingButton: "Iniciando sesión...",
    authErrorGeneric: "Verifica usuario y/o contraseña",
    authError401: "Verifica usuario y/o contraseña",
    authErrorOther: (status, text) => `Error: ${status} - ${text}`,
  },
  en: {
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "Your password",
    emailInvalid: "Please enter a valid email.",
    passwordMinLength: "The password must be at least 6 characters long.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot your password?",
    noAccount: "Don't have an account yet?",
    noAccountLink: "Register",
    submitButton: "Log in",
    loadingButton: "Logging in...",
    authErrorGeneric: "Check username and/or password",
    authError401: "Check username and/or password",
    authErrorOther: (status, text) => `Error: ${status} - ${text}`,
  },
}

// --- Component Props Update ---

interface LoginFormProps {
    lang: string;
}

export function LoginForm({ lang }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const router = useRouter()

  // Select the current translation object
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en"
  const t = translations[currentLangKey]

  // Dynamic Zod Schema using translations
  const loginSchema = z.object({
    email: z.string().email({
      message: t.emailInvalid,
    }),
    password: z.string().min(6, {
      message: t.passwordMinLength,
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
      const { user: currentUser, expires } = await loginService.login(values as LoginCredentials)
      // Los tokens reales quedan en cookies httpOnly (los setea /api/auth/login).
      // Acá solo guardamos un marcador no sensible para que el resto de la app
      // (guards de "¿hay sesión?" y el middleware de páginas) sepan que hay sesión activa.
      localStorage.setItem("expires", expires)
      localStorage.setItem("refresh_token", "active")
      localStorage.setItem("access_token", "active")

      document.cookie = `access_token=active; path=/; max-age=${60*60*24*7}` // 7 days
      document.cookie = `refresh_token=active; path=/; max-age=${60*60*24*30}` // 30 days

      const nombre = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim();

      localStorage.setItem("nombre", nombre);
      document.cookie = `nombre=${encodeURIComponent(nombre)}; path=/; max-age=${60*60*24*7}` //7 days

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

      // Redirect to complementary registration if first_name or last_name is missing
      if (!currentUser.first_name || !currentUser.last_name) {
        router.push("/perfil")
        return
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setAuthError(t.authError401)
        } else if (error.response?.status === 429 && error.response?.data?.message) {
          setAuthError(error.response.data.message)
        } else {
          setAuthError(
            t.authErrorOther(
              error.response?.status || "Sin código",
              error.response?.statusText || "Sin mensaje"
            ),
          )
        }
      } else {
        // Fallback for non-Axios errors
        setAuthError(t.authErrorGeneric)
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
              <FormLabel>{t.emailLabel}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t.emailPlaceholder} {...field} />
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
              <FormLabel>{t.passwordLabel}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? t.hidePassword : t.showPassword}</span>
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
          <Link href={`/${lang}/user/request-password`} className="text-[#39759E] hover:underline">
            {t.forgotPassword}
          </Link>
        </div>
        <Button type="submit" className="w-full bg-[#39759E] hover:bg-[#39759E]" disabled={isLoading}>
          {isLoading ? t.loadingButton : t.submitButton}
        </Button>
        <div className="text-sm text-center">
          {t.noAccount}{" "}
          <Link href={`/${lang}/registro`} className="text-[#39759E] hover:underline">
            {t.noAccountLink}
          </Link>
        </div>
      </form>
    </Form>
  )
}