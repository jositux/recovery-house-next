"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, Building2, Stethoscope, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CalendarBirth } from "@/components/CalendarBirth"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { cn } from "@/lib/utils"

// Imports necesarios para la traducción interna
import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";


// ===============================================================
// ✅ 1. ESQUEMA BASE ESTÁTICO EXPORTADO PARA TIPADO DEL PADRE
// ===============================================================
// Este esquema base es para que el componente padre pueda tipar su función onSubmit.
export const complementaryFormSchemaBase = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  birthDate: z.string().min(10),
  phone: z.string().min(2),
  emergencyPhone: z.string().min(0), // El min(0) permite que sea opcional, la validación se centra en la longitud mínima si se provee.
  address: z.string().min(2),
  initialRole: z.enum(["Patient", "PropertyOwner", "ServiceProvider"]),
});

// 🌐 Definición de tipos para el esquema
export type FormSchema = z.infer<typeof complementaryFormSchemaBase>

// ===============================================================
// 2. LÓGICA DE TRADUCCIÓN INTERNA
// ===============================================================

// 📝 Define la estructura de las propiedades de traducción
type TranslationText = {
  // Zod Messages
  nameMin: string;
  lastNameMin: string;
  birthDateRequired: string;
  phoneMin: string;
  emergencyPhoneMin: string;
  addressMin: string;
  roleRequired: string;

  // UI Texts
  personalInfoTitle: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  
  contactInfoTitle: string;
  addressLabel: string;
  addressPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emergencyPhoneLabel: string;
  emergencyPhonePlaceholder: string;

  birthDateTitle: string;
  ageDisclaimer: string;

  userTypeTitle: string;
  rolePatientTitle: string;
  rolePatientDesc: string;
  rolePropertyOwnerTitle: string;
  rolePropertyOwnerDesc: string;
  roleServiceProviderTitle: string;
  roleServiceProviderDesc: string;
  
  buttonUpdate: string;
  buttonUpdating: string;
  ariaLabelUpdate: string;
};

// 📚 Objeto de Traducciones
const translations: Record<string, TranslationText> = {
  es: {
    // Zod Messages
    nameMin: "El nombre debe tener al menos 2 caracteres.",
    lastNameMin: "El apellido debe tener al menos 2 caracteres.",
    birthDateRequired: "La fecha de nacimiento es requerida.",
    phoneMin: "El Teléfono debe tener al menos 2 caracteres.",
    emergencyPhoneMin: "El Teléfono debe tener al menos 2 caracteres.",
    addressMin: "El domicilio debe tener al menos 2 caracteres.",
    roleRequired: "Por favor selecciona un tipo de usuario.",

    // UI Texts
    personalInfoTitle: "Información Personal",
    firstNameLabel: "Nombre",
    firstNamePlaceholder: "Nombre",
    lastNameLabel: "Apellido",
    lastNamePlaceholder: "Apellido",

    contactInfoTitle: "Información de contacto",
    addressLabel: "Domicilio",
    addressPlaceholder: "Dirección, Calle #",
    phoneLabel: "Teléfono",
    phonePlaceholder: "Teléfono",
    emergencyPhoneLabel: "Tel. de emergencia",
    emergencyPhonePlaceholder: "Tel. de emergencia",

    birthDateTitle: "Fecha de nacimiento",
    ageDisclaimer: "Debes tener al menos 18 años para registrarte.",

    userTypeTitle: "Tipo de usuario",
    rolePatientTitle: "Paciente",
    rolePatientDesc: "Encuentra el lugar ideal para tu recuperación. Espacios cómodos, seguros y adaptados a tus necesidades.",
    rolePropertyOwnerTitle: "Propietario",
    rolePropertyOwnerDesc: "Convierte tu espacio en un hogar de bienestar. Ayuda a otros mientras generas ingresos.",
    roleServiceProviderTitle: "Proveedor de servicio",
    roleServiceProviderDesc: "Ofrece tus servicios especializados y acompaña a quienes buscan recuperarse.",
    
    buttonUpdate: "Actualizar perfil",
    buttonUpdating: "Actualizando perfil",
    ariaLabelUpdate: "Completar registro",
  },
  en: { 
    // Zod Messages
    nameMin: "First name must be at least 2 characters.",
    lastNameMin: "Last name must be at least 2 characters.",
    birthDateRequired: "Birth date is required.",
    phoneMin: "Phone must be at least 2 characters.",
    emergencyPhoneMin: "Phone must be at least 2 characters.",
    addressMin: "Address must be at least 2 characters.",
    roleRequired: "Please select a user type.",

    // UI Texts
    personalInfoTitle: "Personal Information",
    firstNameLabel: "First Name",
    firstNamePlaceholder: "First Name",
    lastNameLabel: "Last Name",
    lastNamePlaceholder: "Last Name",

    contactInfoTitle: "Contact Information",
    addressLabel: "Address",
    addressPlaceholder: "Address, Street #",
    phoneLabel: "Phone",
    phonePlaceholder: "Phone",
    emergencyPhoneLabel: "Emergency Phone",
    emergencyPhonePlaceholder: "Emergency Phone",

    birthDateTitle: "Date of Birth",
    ageDisclaimer: "You must be at least 18 years old to register.",

    userTypeTitle: "User Type",
    rolePatientTitle: "Patient",
    rolePatientDesc: "Find the ideal place for your recovery. Comfortable, safe spaces adapted to your needs.",
    rolePropertyOwnerTitle: "Property Owner",
    rolePropertyOwnerDesc: "Turn your space into a home of well-being. Help others while generating income.",
    roleServiceProviderTitle: "Service Provider",
    roleServiceProviderDesc: "Offer your specialized services and support those seeking recovery.",

    buttonUpdate: "Update Profile",
    buttonUpdating: "Updating Profile",
    ariaLabelUpdate: "Complete registration",
  },
};

// 📝 Función para crear el esquema de Zod dinámicamente, SOBRESCRIBIENDO MENSAJES
const createComplementaryFormSchema = (texts: TranslationText) => {
  return complementaryFormSchemaBase.extend({
    first_name: z.string().min(2, {
      message: texts.nameMin,
    }),
    last_name: z.string().min(2, {
      message: texts.lastNameMin,
    }),
    birthDate: z.string().min(10, {
      message: texts.birthDateRequired,
    }),
    phone: z.string().min(2, {
      message: texts.phoneMin,
    }),
    emergencyPhone: z.string().min(0, {
      message: texts.emergencyPhoneMin, // Aunque sea min(0), el mensaje se traduce
    }),
    address: z.string().min(2, {
      message: texts.addressMin,
    }),
    initialRole: z.enum(["Patient", "PropertyOwner", "ServiceProvider"], {
      required_error: texts.roleRequired,
    }),
  });
}

// ===============================================================
// 3. COMPONENTE REACT
// ===============================================================

type PerfilRegisterFormProps = {
  onSubmit: (values: FormSchema) => void
  initialValues?: Partial<FormSchema>
}

export default function PerfilRegisterForm({ onSubmit, initialValues }: PerfilRegisterFormProps) {
  // Obtener el idioma de los parámetros de ruta
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  
  // Seleccionar el objeto de traducción
  const texts = translations[lang as keyof typeof translations] || translations.en; 

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Crear el esquema de Zod traducido usando useMemo
  const complementaryFormSchema = useMemo(() => createComplementaryFormSchema(texts), [texts]);

  // Inicializar useForm con el esquema traducido
  const form = useForm<FormSchema>({
    resolver: zodResolver(complementaryFormSchema),
    defaultValues: {
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      birthDate: initialValues?.birthDate || "",
      phone: initialValues?.phone || "",
      emergencyPhone: initialValues?.emergencyPhone || "",
      address: initialValues?.address || "",
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

  const isFieldInvalid = (fieldName: keyof FormSchema) => {
    return touchedFields.has(fieldName) && !!errors[fieldName]
  }

  const handleRegisterSubmit = async (values: FormSchema) => {
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
          <h2 className="text-lg font-medium">{texts.personalInfoTitle}</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {texts.firstNameLabel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={texts.firstNamePlaceholder}
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
                    {texts.lastNameLabel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={texts.lastNamePlaceholder}
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
          <h2 className="text-lg font-medium">{texts.contactInfoTitle}</h2>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    {texts.addressLabel} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={texts.addressPlaceholder}
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
                    {texts.phoneLabel}<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder={texts.phonePlaceholder}
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
                    {texts.emergencyPhoneLabel} <span className="text-red-500"></span>
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder={texts.emergencyPhonePlaceholder}
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
            {texts.birthDateTitle} <span className="text-red-500">*</span>
          </h2>
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CalendarBirth onChange={field.onChange} initialValue={field.value} lang={lang}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-muted-foreground">{texts.ageDisclaimer}</p>
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <h2 className="text-lg font-medium">{texts.userTypeTitle}</h2>
          <FormField
            control={form.control}
            name="initialRole"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <div className="grid grid-cols-1 gap-3">
                    <UserTypeCard
                      icon={User}
                      title={texts.rolePatientTitle}
                      description={texts.rolePatientDesc}
                      selected={field.value === "Patient"}
                      onClick={() => field.onChange("Patient")}
                      aria-label="Select patient as user type"
                    />
                    <UserTypeCard
                      icon={Building2}
                      title={texts.rolePropertyOwnerTitle}
                      description={texts.rolePropertyOwnerDesc}
                      selected={field.value === "PropertyOwner"}
                      onClick={() => field.onChange("PropertyOwner")}
                      aria-label="Select property owner as user type"
                    />
                    <UserTypeCard
                      icon={Stethoscope}
                      title={texts.roleServiceProviderTitle}
                      description={texts.roleServiceProviderDesc}
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

        <Button
          type="submit"
          className="w-full bg-[#39759E] hover:bg-[#39759E]"
          aria-label={texts.ariaLabelUpdate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {texts.buttonUpdating}
            </>
          ) : (
            texts.buttonUpdate
          )}
        </Button>
      </form>
    </Form>
  )
}