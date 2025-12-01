"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Imports necesarios para la traducción interna
import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";


// ===============================================================
// ✅ 1. ESQUEMA BASE ESTÁTICO EXPORTADO PARA TIPADO DEL PADRE
// ===============================================================
// Este esquema no tiene mensajes de error definidos y es seguro de importar
// en el componente padre para tipar la función onSubmit.
export const formSchemaBase = z.object({
  email: z.string().email(),
  password: z.string().min(8).refine((val) => val.trim().length >= 8),
  acceptTerms: z.boolean().refine((val) => val === true),
});

// 🌐 Definición de tipos para el esquema
export type FormSchema = z.infer<typeof formSchemaBase>

// ===============================================================
// 2. LÓGICA DE TRADUCCIÓN INTERNA
// ===============================================================

// 📝 Define la estructura de las propiedades de traducción
type TranslationText = {
  emailInvalid: string;
  passwordMin: string;
  passwordNonEmpty: string;
  termsRequired: string;
  
  emailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  acceptTermsPrefix: string;
  termsLink: string;
  registerButton: string;
  registering: string;
  ariaLabel: string;
};

// 📚 Objeto de Traducciones con Tipado Estructural
const translations: Record<string, TranslationText> = {
  es: {
    // Zod Messages
    emailInvalid: "Por favor ingresa un email válido.",
    passwordMin: "La contraseña debe tener al menos 8 caracteres.",
    passwordNonEmpty: "La contraseña debe tener al menos 8 caracteres no vacíos.",
    termsRequired: "Debes aceptar los términos y condiciones para continuar.",
    
    // UI Texts
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    acceptTermsPrefix: "Acepto los",
    termsLink: "Términos y Condiciones de la Plataforma",
    registerButton: "Registrarme",
    registering: "Registrando",
    ariaLabel: "Completar registro",
  },
  en: { 
    // Zod Messages
    emailInvalid: "Please enter a valid email.",
    passwordMin: "Password must be at least 8 characters.",
    passwordNonEmpty: "Password must be at least 8 non-empty characters.",
    termsRequired: "You must accept the terms and conditions to proceed.",
    
    // UI Texts
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordPlaceholder: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    acceptTermsPrefix: "I accept the",
    termsLink: "Platform Terms and Conditions",
    registerButton: "Register",
    registering: "Registering",
    ariaLabel: "Complete registration",
  },
};

// 📝 Función para crear el esquema de Zod dinámicamente, SOBRESCRIBIENDO MENSAJES
const createFormSchema = (texts: TranslationText) => {
  return formSchemaBase.extend({
    email: z.string().email({
      message: texts.emailInvalid,
    }),
    password: z
      .string()
      .min(8, {
        message: texts.passwordMin,
      })
      .refine((val) => val.trim().length >= 8, {
        message: texts.passwordNonEmpty,
      }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: texts.termsRequired,
    }),
  });
}

// ===============================================================
// 3. COMPONENTE REACT
// ===============================================================

type SimpleRegisterFormProps = {
  onSubmit: (values: FormSchema) => void
  initialValues?: Partial<FormSchema>
}

export default function SimpleRegisterForm({ onSubmit, initialValues }: SimpleRegisterFormProps) {
  // Obtener el idioma de los parámetros de ruta
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  
  // Seleccionar el objeto de traducción
  const texts = translations[lang as keyof typeof translations] || translations.en; 

  const [showPassword, setShowPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Crear el esquema de Zod traducido usando useMemo
  const formSchema = useMemo(() => createFormSchema(texts), [texts]);

  // Inicializar useForm con el esquema traducido
  const form = useForm<FormSchema>({
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

  const handleRegisterSubmit = async (values: FormSchema) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Usar el objeto `texts` en el JSX
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
                  {texts.emailLabel} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder={texts.emailLabel}
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
                  {texts.passwordLabel} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={texts.passwordPlaceholder}
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
                      aria-label={showPassword ? texts.hidePassword : texts.showPassword}
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
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-[#39759E] focus:ring-[#39759E] focus:ring-2 cursor-pointer mt-0.5"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      {texts.acceptTermsPrefix}{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#39759E] hover:text-[#3a5a77] underline font-medium"
                      >
                        {texts.termsLink}
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
          aria-label={texts.ariaLabel}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {texts.registering}
            </>
          ) : (
            texts.registerButton
          )}
        </Button>
      </form>
    </Form>
  )
}