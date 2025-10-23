"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ✅ Esquema con Zod (email, password y términos)
export const formSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
  }),
  password: z
    .string()
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .refine((val) => val.trim().length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres no vacíos.",
    }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones para continuar.",
  }),
})

type SimpleRegisterFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  initialValues?: Partial<z.infer<typeof formSchema>>
}

export default function SimpleRegisterForm({ onSubmit, initialValues }: SimpleRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialValues?.email || "",
      password: initialValues?.password || "",
      acceptTerms: initialValues?.acceptTerms ?? false,
    },
  })

  const {
    watch,
    formState: { errors },
  } = form

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === "change" && name) {
        setTouchedFields((prev) => new Set(prev).add(name))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const isFieldInvalid = (fieldName: string) => {
    return touchedFields.has(fieldName) && !!errors[fieldName as keyof typeof errors]
  }

  const handleRegisterSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* 📧 Campo Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...field}
                    required
                    aria-describedby="email-error"
                    className={cn(isFieldInvalid("email") && "border-red-500 focus-visible:ring-red-500")}
                  />
                </FormControl>
                <FormMessage id="email-error" aria-live="polite" />
              </FormItem>
            )}
          />

          {/* 🔒 Campo Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      required
                      className={cn(isFieldInvalid("password") && "border-red-500 focus-visible:ring-red-500")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ✅ Checkbox de Términos */}
        <div className="mt-8 mb-2 bg-white">
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row items-start space-x-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)} // 👈 clave para que funcione con Zod
                      className="h-5 w-5 rounded border-gray-300 text-[#39759E] focus:ring-[#39759E] focus:ring-2 cursor-pointer mt-0.5"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Acepto los{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#39759E] hover:text-[#3a5a77] underline font-medium"
                      >
                        Términos y Condiciones de la Plataforma
                      </a>
                    </FormLabel>
                  </div>
                </div>
                <FormMessage className="mt-2" />
              </FormItem>
            )}
          />
        </div>

        {/* 🔘 Botón de registro */}
        <Button
          type="submit"
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label="Complete registration"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando
            </>
          ) : (
            "Registrarme"
          )}
        </Button>
      </form>
    </Form>
  )
}
