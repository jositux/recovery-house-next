"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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
//import { cn } from "@/lib/utils"

// Imports necesarios para la traducción interna
import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";


// ===============================================================
// 1. ESQUEMA BASE ESTÁTICO EXPORTADO
// ===============================================================
export const formSchemaBase = z.object({
  id: z.string().min(2),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  birthDate: z.string().min(10),
  email: z.string().email(),
  phone: z.string().min(2),
  emergencyPhone: z.string().min(0),
  address: z.string().min(2),
  password: z.string().optional()
});

export type FormFields = z.infer<typeof formSchemaBase>

// ===============================================================
// 2. LÓGICA DE TRADUCCIÓN INTERNA
// ===============================================================

type TranslationText = {
  // Zod Messages
  nameMin: string;
  lastNameMin: string;
  birthDateRequired: string;
  emailInvalid: string;
  phoneMin: string;
  emergencyPhoneMin: string;
  addressMin: string;

  // UI Texts
  alertTitle: string;
  alertListPrefix: string;
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
  securityTitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordHint: string;
  hidePassword: string;
  showPassword: string;
  buttonSave: string;
  buttonSaving: string;
  ariaLabelSave: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    nameMin: "El nombre debe tener al menos 2 caracteres.",
    lastNameMin: "El apellido debe tener al menos 2 caracteres.",
    birthDateRequired: "La fecha de nacimiento es requerida.",
    emailInvalid: "Por favor ingresa un email válido.",
    phoneMin: "El Teléfono debe tener al menos 2 caracteres.",
    emergencyPhoneMin: "El Teléfono debe tener al menos 2 caracteres.",
    addressMin: "El domicilio debe tener al menos 2 caracteres.",

    alertTitle: "Por favor corrige los siguientes errores:",
    alertListPrefix: "",
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
    securityTitle: "Seguridad",
    emailLabel: "Email",
    emailPlaceholder: "Email",
    passwordLabel: "Contraseña (opcional)",
    passwordPlaceholder: "Dejar vacío para no cambiar",
    passwordHint: "Deja en blanco para mantener la contraseña actual. Si la cambias, deberás iniciar sesión nuevamente.",
    hidePassword: "Ocultar contraseña",
    showPassword: "Mostrar contraseña",
    buttonSave: "Guardar Cambios",
    buttonSaving: "Guardando...",
    ariaLabelSave: "Guardar Cambios",
  },
  en: { 
    nameMin: "First name must be at least 2 characters.",
    lastNameMin: "Last name must be at least 2 characters.",
    birthDateRequired: "Birth date is required.",
    emailInvalid: "Please enter a valid email.",
    phoneMin: "Phone must be at least 2 characters.",
    emergencyPhoneMin: "Phone must be at least 2 characters.",
    addressMin: "Address must be at least 2 characters.",

    alertTitle: "Please correct the following errors:",
    alertListPrefix: "",
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
    securityTitle: "Security",
    emailLabel: "Email",
    emailPlaceholder: "Email",
    passwordLabel: "Password (optional)",
    passwordPlaceholder: "Leave blank not to change",
    passwordHint: "Leave blank to keep the current password. If you change it, you will need to log in again.",
    hidePassword: "Hide password",
    showPassword: "Show password",
    buttonSave: "Save Changes",
    buttonSaving: "Saving...",
    ariaLabelSave: "Save Changes",
  },
};

const createUpdateFormSchema = (texts: TranslationText) => {
  return formSchemaBase.extend({
    id: z.string().min(2, { message: texts.nameMin }),
    first_name: z.string().min(2, { message: texts.nameMin }),
    last_name: z.string().min(2, { message: texts.lastNameMin }),
    birthDate: z.string().min(10, { message: texts.birthDateRequired }),
    email: z.string().email({ message: texts.emailInvalid }),
    phone: z.string().min(2, { message: texts.phoneMin }),
    emergencyPhone: z.string().min(0, { message: texts.emergencyPhoneMin }),
    address: z.string().min(2, { message: texts.addressMin }),
    password: z.string().optional()
  });
};

// ===============================================================
// 3. COMPONENTE REACT
// ===============================================================

type UpdateUserFormProps = {
  onSubmit: (values: FormFields) => void
  initialValues?: Partial<FormFields>
  formSchema?: z.ZodType<FormFields> 
}

export default function UpdateUserForm({ onSubmit, initialValues, formSchema: customFormSchema }: UpdateUserFormProps) {
  // Obtener el idioma de los parámetros de ruta
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  
  // Seleccionar el objeto de traducción
  const texts = translations[lang as keyof typeof translations] || translations.en; 

  const [showPassword, setShowPassword] = useState(false)
  
  const translatedSchema = useMemo(() => createUpdateFormSchema(texts), [texts]);
  const schemaToUse = customFormSchema || translatedSchema;
  
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

  const handleRegisterSubmit = async (values: FormFields) => {
    const requiredFields = ['id', 'first_name', 'last_name', 'birthDate', 'phone', 'address', 'email'];
    const emptyFields = requiredFields.filter(field => !values[field as keyof typeof values]);

    if (emptyFields.length > 0) {
      console.warn("Empty required fields detected:", emptyFields);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(values);
  };

  return (
    <Form {...form}>
      {/* 🛑 CORRECCIÓN: Se envuelve la lógica condicional y el formulario 
         dentro de un solo Fragmento (<>), asegurando que <Form> solo reciba un hijo. */}
      <> 
        {/* 1. Bloque de Alerta de Errores */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p className="font-bold">{texts.alertTitle}</p>
            <ul className="mt-2 list-disc pl-5">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  {texts.alertListPrefix}{error?.message as string}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 2. Formulario Principal */}
        <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.firstNameLabel} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder={texts.firstNamePlaceholder} {...field} required />
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
                    <FormLabel>{texts.lastNameLabel} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder={texts.lastNamePlaceholder} {...field} required />
                    </FormControl>
                    <FormMessage className="text-red-600 font-medium mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">{texts.contactInfoTitle}</h2>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{texts.addressLabel} <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder={texts.addressPlaceholder} {...field} required />
                  </FormControl>
                  <FormMessage className="text-red-600 font-medium mt-1" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.phoneLabel}<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder={texts.phonePlaceholder} {...field} required />
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
                    <FormLabel>{texts.emergencyPhoneLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={texts.emergencyPhonePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage className="text-red-600 font-medium mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Campos ocultos */}
          <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem className="hidden"><FormControl><Input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="id" render={({ field }) => (<FormItem className="hidden"><FormControl><Input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>)} />

          <div className="space-y-4">
            <h2 className="text-lg font-medium">{texts.securityTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">{texts.emailLabel} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder={texts.emailPlaceholder}
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
                    <FormLabel htmlFor="password">{texts.passwordLabel}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={texts.passwordPlaceholder}
                          {...field}
                          aria-describedby="password-strength"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? texts.hidePassword : texts.showPassword}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-xs text-gray-500">{texts.passwordHint}</p>
                    <FormMessage className="text-red-600 font-medium mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#39759E] hover:bg-[#39759E]"
            aria-label={texts.ariaLabelSave}
            disabled={form.formState.isSubmitting}
            onClick={() => {
              if (Object.keys(form.formState.errors).length > 0) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {form.formState.isSubmitting ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {texts.buttonSaving}
              </>
            ) : (
              texts.buttonSave
            )}
          </Button>
        </form>
      </> {/* Cierre del Fragmento */}
    </Form>
  )
}