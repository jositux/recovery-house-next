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
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }).refine((val) => val.trim().length >= 8, {
    message: "La contraseña debe tener al menos 8 caracteres no vacíos.",
  })
})

type UpdateUserFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  initialValues?: Partial<z.infer<typeof formSchema>>
}

export default function UpdateUserForm({ onSubmit, initialValues }: UpdateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  //const [formattedDate, setFormattedDate] = useState("") //Removed

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialValues?.first_name || "",
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      birthDate: initialValues?.birthDate || "",
      phone: initialValues?.phone || "",
      emergencyPhone: initialValues?.emergencyPhone || "",
      address: initialValues?.address || "",
      email: initialValues?.email || "",
      password: initialValues?.password || ""
    },
  })


  const handleRegisterSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
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
                    <Input 
                      placeholder="Nombre" 
                      {...field} 
                      required
                   
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
                  <FormLabel>Apellido <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Apellido" 
                      {...field} 
                      required
                     
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input 
                      placeholder="Dirección, Calle #" 
                      {...field} 
                      required
                    
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
                  <FormLabel>Telefono<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Telefono" 
                      {...field} 
                      required
                     
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
                  <FormLabel>Tel. de emergencia <span className="text-red-500"></span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tel. de emergencia" 
                      {...field} 
                     
                    />
                  </FormControl>
                  <FormMessage />
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
                      aria-describedby="email-error"
                    
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
                  <FormLabel htmlFor="password">Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        required
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


        <Button 
          type="submit" 
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label="Complete registration"
        >
          Guardar Cambios
        </Button>
      </form>
    </Form>
  )
}

