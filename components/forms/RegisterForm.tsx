"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Building2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleTermsCheckbox } from "@/components/ui/simple-terms-checkbox";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarBirth } from "@/components/CalendarBirth";
import { UserTypeCard } from "@/components/ui/user-type-card";
import { cn } from "@/lib/utils";

export const formSchema = z.object({
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
  password: z
    .string()
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .refine((val) => val.trim().length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres no vacíos.",
    }),
  initialRole: z.enum(["Patient", "PropertyOwner", "ServiceProvider"], {
    required_error: "Por favor selecciona un tipo de usuario.",
  }),
});

type RegisterFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  initialValues?: Partial<z.infer<typeof formSchema>>;
};

export default function RegisterForm({
  onSubmit,
  initialValues,
}: RegisterFormProps) {

  const [showPassword, setShowPassword] = useState(false);
  //const [formattedDate, setFormattedDate] = useState("") //Removed
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [termsAccepted, setTermsAccepted] = useState(false);
  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      birthDate: initialValues?.birthDate || "",
      phone: initialValues?.phone || "",
      emergencyPhone: initialValues?.emergencyPhone || "",
      address: initialValues?.address || "",
      email: initialValues?.email || "",
      password: initialValues?.password || "",
      initialRole: initialValues?.initialRole || "Patient",
    },
  });

  const {
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === "change") {
        setTouchedFields((prev) => new Set(prev).add(name as string));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const isFieldInvalid = (fieldName: string) => {
    if (fieldName === "email") {
      return touchedFields.has("email") && !!errors.email;
    }
    return (
      touchedFields.has(fieldName) && !!errors[fieldName as keyof typeof errors]
    );
  };

  const handleRegisterSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleRegisterSubmit)}
        className="space-y-8"
      >
        <div className="space-y-4 p-4 bg-white rounded-xl">
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
                      className={cn(
                        isFieldInvalid("first_name") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
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
                      className={cn(
                        isFieldInvalid("last_name") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
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
                    className={cn(
                      isFieldInvalid("firstName") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
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
                      className={cn(
                        isFieldInvalid("firstName") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
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
                      className={cn(
                        isFieldInvalid("lastName") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
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
                  <CalendarBirth
                    onChange={field.onChange}
                    initialValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-muted-foreground">
            Debes tener al menos 18 años para registrarte.
          </p>
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">Seguridad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={cn(
                        isFieldInvalid("email") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
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
                        className={cn(
                          isFieldInvalid("newPassword") &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
          disabled={!termsAccepted}
        >
          Continuar
        </Button>
      </form>
    </Form>
  );
}
