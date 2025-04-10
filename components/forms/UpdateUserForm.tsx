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

export const formSchema = z.object({
  id: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  first_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  birthDate: z.string().min(10, {
    message: "La fecha de nacimiento es requerida",
  }),
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
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
  password: z.string().optional()
})

type FormFields = {
  id: string;
  first_name: string;
  last_name: string;
  birthDate: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  password?: string;
};

type UpdateUserFormProps = {
  onSubmit: (values: FormFields) => void
  initialValues?: Partial<FormFields>
  formSchema?: z.ZodType<FormFields>
}

export default function UpdateUserForm({ onSubmit, initialValues, formSchema: customFormSchema }: UpdateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const schemaToUse = customFormSchema || formSchema;
  
  const form = useForm<z.infer<typeof schemaToUse>>({
    resolver: zodResolver(schemaToUse),
    defaultValues: {
      id: initialValues?.id || "",
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      birthDate: initialValues?.birthDate || "",
      phone: initialValues?.phone || "",
      emergencyPhone: initialValues?.emergencyPhone || "",
      address: initialValues?.address || "",
      email: initialValues?.email || "",
      password: "" 
    },
  })

  const handleRegisterSubmit = async (values: z.infer<typeof schemaToUse>) => {
    const requiredFields = ['id', 'first_name', 'last_name', 'birthDate', 'phone', 'address', 'email'];
    const emptyFields = requiredFields.filter(field => !values[field as keyof typeof values]);

    if (emptyFields.length > 0) {
      console.warn("Empty required fields detected:", emptyFields);
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // espera mínimo 2s
    onSubmit(values);
  };

  return (
    <Form {...form}>
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p className="font-bold">Por favor corrige los siguientes errores:</p>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>{error?.message as string}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} required />
                  </FormControl>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Apellido" {...field} required />
                  </FormControl>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Informacion de contacto</h2>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Dirección, Calle #" {...field} required />
                </FormControl>
                <FormMessage className="text-red-600 font-medium mt-1" />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Telefono" {...field} required />
                  </FormControl>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tel. de emergencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Tel. de emergencia" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Seguridad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...field}
                      required
                      disabled={true}
                      className="bg-gray-100"
                      aria-describedby="email-error"
                    />
                  </FormControl>
                  <FormMessage id="email-error" aria-live="polite" className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Contraseña (opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Dejar vacío para no cambiar"
                        {...field}
                        aria-describedby="password-strength"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">Deja en blanco para mantener la contraseña actual. Si la cambias, deberás iniciar sesión nuevamente.</p>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label="Guardar Cambios"
          disabled={form.formState.isSubmitting}
          onClick={() => {
            if (Object.keys(form.formState.errors).length > 0) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </Form>
  )
}
