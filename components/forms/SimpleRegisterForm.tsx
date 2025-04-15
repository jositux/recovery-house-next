"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react" // Removed User, Building2, Stethoscope
import { Button } from "@/components/ui/button"
// Removed SimpleTermsCheckbox import

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// Removed CalendarBirth import
// Removed UserTypeCard import
import { cn } from "@/lib/utils"

// Simplified schema for email and password only
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
})

// Renamed props type
type SimpleRegisterFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  initialValues?: Partial<z.infer<typeof formSchema>>
}

// Renamed component and props
export default function SimpleRegisterForm({ onSubmit, initialValues }: SimpleRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Removed termsAccepted state and handler

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Removed other default values
      email: initialValues?.email || "",
      password: initialValues?.password || "",
    },
  })

  const {
    watch,
    formState: { errors },
  } = form

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === "change") {
        setTouchedFields((prev) => new Set(prev).add(name as string))
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const isFieldInvalid = (fieldName: string) => {
    if (fieldName === "email") {
      return touchedFields.has("email") && !!errors.email
    }
    return touchedFields.has(fieldName) && !!errors[fieldName as keyof typeof errors]
  }

  const handleRegisterSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Directly call onSubmit without checking termsAccepted
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      {/* Removed outer space-y-8 from form */}
      <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-6">
        {/* Removed Name, Contact Info, Birth Date sections */}

        <div className="space-y-4 p-4 bg-white rounded-xl">
          {/* Removed Security heading */}
          {/* Changed grid layout */}
          <div className="space-y-4">
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
                        aria-describedby="password-strength"
                        // Changed invalid field check from newPassword to password
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
        </div>

        {/* Removed User Type section */}
        {/* Removed Terms Checkbox section */}

        <Button
          type="submit"
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label="Complete registration"
          // Removed termsAccepted check from disabled condition
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando
            </>
          ) : (
            "Registrar"
          )}
        </Button>
      </form>
    </Form>
  )
}
