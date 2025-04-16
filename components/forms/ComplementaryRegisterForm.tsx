"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, Building2, Stethoscope, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleTermsCheckbox } from "@/components/ui/simple-terms-checkbox"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CalendarBirth } from "@/components/CalendarBirth"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { cn } from "@/lib/utils"

// Removed email and password from schema
export const complementaryFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  birthDate: z.string().min(10, {
    message: "La fecha de nacimiento es requerida",
  }),
  phone: z.string().min(2, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  emergencyPhone: z.string().min(0, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  address: z.string().min(2, {
    message: "El domicilio debe tener al menos 2 caracteres.",
  }),
  initialRole: z.enum(["Patient", "PropertyOwner", "ServiceProvider"], {
    required_error: "Por favor selecciona un tipo de usuario.",
  }),
})

type ComplementaryRegisterFormProps = {
  onSubmit: (values: z.infer<typeof complementaryFormSchema>) => void
  initialValues?: Partial<z.infer<typeof complementaryFormSchema>>
}

export default function ComplementaryRegisterForm({ onSubmit, initialValues }: ComplementaryRegisterFormProps) {
  // Removed showPassword state
  //const [formattedDate, setFormattedDate] = useState("") //Removed
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  const form = useForm<z.infer<typeof complementaryFormSchema>>({
    resolver: zodResolver(complementaryFormSchema),
    defaultValues: {
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      birthDate: initialValues?.birthDate || "",
      phone: initialValues?.phone || "",
      emergencyPhone: initialValues?.emergencyPhone || "",
      address: initialValues?.address || "",
      // Removed email and password defaults
      initialRole: initialValues?.initialRole || "Patient",
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

  // Removed specific check for email as it's no longer in the schema
  const isFieldInvalid = (fieldName: keyof z.infer<typeof complementaryFormSchema>) => {
    return touchedFields.has(fieldName) && !!errors[fieldName]
  }

  const handleRegisterSubmit = async (values: z.infer<typeof complementaryFormSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-8">
        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">Información Personal</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      {...field}
                      required
                      className={cn(isFieldInvalid("first_name") && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apellido <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apellido"
                      {...field}
                      required
                      className={cn(isFieldInvalid("last_name") && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">Información de contacto</h2>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Domicilio <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dirección, Calle #"
                    {...field}
                    required
                    className={cn(isFieldInvalid("address") && "border-red-500 focus-visible:ring-red-500")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Telefono"
                    {...field}
                    required
                    className={cn(isFieldInvalid("phone") && "border-red-500 focus-visible:ring-red-500")}
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tel. de emergencia <span className="text-red-500"></span>
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Tel. de emergencia"
                    {...field}
                    className={cn(isFieldInvalid("emergencyPhone") && "border-red-500 focus-visible:ring-red-500")}
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">
            Fecha de nacimiento <span className="text-red-500">*</span>
          </h2>
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CalendarBirth onChange={field.onChange} initialValue={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-muted-foreground">Debes tener al menos 18 años para registrarte.</p>
        </div>

        {/* Removed Security section (email and password fields) */}

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">Tipo de usuario</h2>
          <FormField
            control={form.control}
            name="initialRole"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <div className="grid grid-cols-1 gap-3">
                    <UserTypeCard
                      icon={User}
                      title="Paciente"
                      description="Encuentra el lugar ideal para tu recuperación. Espacios cómodos, seguros y adaptados a tus necesidades."
                      selected={field.value === "Patient"}
                      onClick={() => field.onChange("Patient")}
                      aria-label="Select patient as user type"
                    />
                    <UserTypeCard
                      icon={Building2}
                      title="Propietario"
                      description="Convierte tu espacio en un hogar de bienestar. Ayuda a otros mientras generas ingresos."
                      selected={field.value === "PropertyOwner"}
                      onClick={() => field.onChange("PropertyOwner")}
                      aria-label="Select property owner as user type"
                    />
                    <UserTypeCard
                      icon={Stethoscope}
                      title="Proveedor de servicio"
                      description="Ofrece tus servicios especializados y acompaña a quienes buscan recuperarse."
                      selected={field.value === "ServiceProvider"}
                      onClick={() => field.onChange("ServiceProvider")}
                      aria-label="Select service provider as user type"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <SimpleTermsCheckbox onAccept={handleTermsAccept} />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label="Complete registration"
          disabled={!termsAccepted || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando perfil
            </>
          ) : (
            "Actualizar perfil"
          )}
        </Button>
      </form>
    </Form>
  )
}
