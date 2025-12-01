"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import Image from "next/image"
import { type Locale } from "@/lib/i18n"

const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(100, "La contraseña no puede tener más de 100 caracteres")

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

function ResetPasswordForm({ token, isSpanish }: { token: string, isSpanish: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    const { password } = values

    try {
      const response = await fetch("/webapi/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) throw new Error(isSpanish ? "No se pudo restablecer la contraseña" : "Failed to reset password")
      else router.push(`/login?message=${isSpanish ? "reset-ok" : "reset-ok"}`)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isSpanish ? "Nueva Contraseña" : "New Password"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isSpanish ? "Ingresa tu nueva contraseña" : "Enter your new password"}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isSpanish ? "Confirmar Contraseña" : "Confirm Password"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={isSpanish ? "Confirma tu nueva contraseña" : "Confirm your new password"}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{isSpanish ? "Restablecer Contraseña" : "Reset Password"}</Button>
      </form>
    </Form>
  )
}

function ResetPasswordContent({ isSpanish }: { isSpanish: boolean }) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  if (!token) return <div>{isSpanish ? "Token no válido o no proporcionado." : "Invalid or missing token."}</div>

  return <ResetPasswordForm token={token} isSpanish={isSpanish} />
}

export default function ResetPasswordPage() {
  const params = useParams()
  const lang = (params.lang as Locale) || "es"
  const isSpanish = lang === "es"

  return (
    <div className="flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <Image src="/assets/logo2.svg" alt="Recovery Care Solutions" width={180} height={80} />
      <div className="w-full max-w-md m-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSpanish ? "Restablecer Contraseña" : "Reset Password"}
        </h1>
        <Suspense fallback={<div>{isSpanish ? "Cargando..." : "Loading..."}</div>}>
          <ResetPasswordContent isSpanish={isSpanish} />
        </Suspense>
      </div>
    </div>
  )
}
