"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useParams, useRouter } from "next/navigation" // Importamos useParams
import { type Locale } from "@/lib/i18n" 

// 💡 Importaciones para el nuevo manejo de archivos (asumiendo rutas)
import { FileUpload, type FileUploadHandle } from "./file-upload";
import { uploadFile } from "@/services/fileUploadService"
import { deleteFile } from "@/services/deleteFileService"
// ------------------------------------------------------------------------

import { LocationSelector } from "@/components/ui/location-selector"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { getExtraTags } from "@/services/extraTagsService"
import { getProvidersByUserId } from "@/services/providerCollectionService"
import { getCurrentUser } from "@/services/userService"
import { Loader2, Check, Eye, Edit, Save } from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Fraunces } from "next/font/google"
import type { ProviderData } from "@/services/providerService"

const fraunces = Fraunces({ subsets: ["latin"] })

// 💡 Datos por defecto para los FileUpload
const defaultRNTFile = {
  id: "",
  filename_download: "",
}
const defaultTaxFile = {
  id: "",
  filename_download: "",
}
// ------------------------------------------------------------------------

// --- Translation Data ---

interface RegisterServiceTranslation {
  // General
  pageTitle: string;
  loadingServiceCheck: string;

  // Existing Service Card
  cardTitle: string;
  cardDescription: string;
  nextSteps: string;
  reviewInfo: string;
  updateDetails: string;
  keepUpdated: string;
  viewButton: string;
  editButton: string;

  // Form Labels & Placeholders
  legalInfoTitle: string;
  taxIdEINLabel: string;
  taxIdEINPlaceholder: string;
  RNTFileLabel: string;
  TaxIdEINFileLabel: string;
  serviceInfoTitle: string;
  serviceNameLabel: string;
  serviceNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  servicesOfferedTitle: string;
  locationTitle: string;

  // Buttons & Alerts
  registeringButton: string;
  continueButton: string;
  errorNoToken: string;
  errorRNTRequired: string;
  errorTaxRequired: string;
  errorRNTUpload: string;
  errorTaxUpload: string;
  errorRegistrationGeneric: string;

  // Zod Validation Errors
  validationName: string;
  validationEmail: string;
  validationPhone: string;
  validationCountry: string;
  validationState: string;
  validationCity: string;
  validationDescription: string;
  validationTaxIdEIN: string;
  validationRNTFile: string;
  validationTaxIdEINFile: string;
}

const translations: Record<string, RegisterServiceTranslation> = {
  es: {
    pageTitle: "Registra tu servicio",
    loadingServiceCheck: "Verificando servicios...",

    cardTitle: "Ya tienes un servicio registrado",
    cardDescription: "Ya cuentas con un servicio activo en la plataforma. Puedes revisarlo o editarlo según tus necesidades.",
    nextSteps: "Próximos pasos:",
    reviewInfo: "Revisa la información de tu servicio",
    updateDetails: "Actualiza tus detalles si es necesario",
    keepUpdated: "Mantén tu perfil actualizado para atraer más clientes",
    viewButton: "Ver",
    editButton: "Editar",

    legalInfoTitle: "Información Legal",
    taxIdEINLabel: "Tax ID/EIN",
    taxIdEINPlaceholder: "Tax ID/EIN",
    RNTFileLabel: "Archivo RNT",
    TaxIdEINFileLabel: "Archivo de Impuestos TAX ID",
    serviceInfoTitle: "Información del Servicio",
    serviceNameLabel: "Nombre del Servicio",
    serviceNamePlaceholder: "Ej. Peluquería Pedrito",
    emailLabel: "Email",
    emailPlaceholder: "Correo electrónico",
    phoneLabel: "Teléfono",
    phonePlaceholder: "Número de teléfono",
    descriptionLabel: "Descripción del Servicio",
    descriptionPlaceholder: "Describe las características",
    servicesOfferedTitle: "Servicios Ofrecidos",
    locationTitle: "¿Dónde ofrece su servicio?",

    registeringButton: "Registrando...",
    continueButton: "Continuar",
    errorNoToken: "No se encontró el token de acceso. Por favor inicia sesión nuevamente.",
    errorRNTRequired: "El archivo RNT es obligatorio.",
    errorTaxRequired: "El archivo TAX ID es obligatorio.",
    errorRNTUpload: "Error al cargar el archivo RNT. Intenta de nuevo.",
    errorTaxUpload: "Error al cargar el archivo TAX ID. Intenta de nuevo.",
    errorRegistrationGeneric: "Error al registrar el servicio. Por favor intenta de nuevo.",

    validationName: "El nombre es requerido.",
    validationEmail: "Debe ser un email válido.",
    validationPhone: "El teléfono es requerido.",
    validationCountry: "Por favor selecciona un país.",
    validationState: "Por favor selecciona un estado.",
    validationCity: "Por favor selecciona una ciudad.",
    validationDescription: "La descripción es requerida.",
    validationTaxIdEIN: "El TAX ID es requerido.",
    validationRNTFile: "El archivo RNT es obligatorio.",
    validationTaxIdEINFile: "El archivo TAX ID es obligatorio.",
  },
  en: {
    pageTitle: "Add your service",
    loadingServiceCheck: "Checking services...",

    cardTitle: "You already have a registered service",
    cardDescription: "You already have an active service on the platform. You can review it or edit it as needed.",
    nextSteps: "Next steps:",
    reviewInfo: "Review your service information",
    updateDetails: "Update your details if necessary",
    keepUpdated: "Keep your profile updated to attract more customers",
    viewButton: "View",
    editButton: "Edit",

    legalInfoTitle: "Legal Information",
    taxIdEINLabel: "Tax ID/EIN",
    taxIdEINPlaceholder: "Tax ID/EIN",
    RNTFileLabel: "RNT File",
    TaxIdEINFileLabel: "TAX ID File",
    serviceInfoTitle: "Service Information",
    serviceNameLabel: "Service Name",
    serviceNamePlaceholder: "Ex. Pedrito's Hair Salon",
    emailLabel: "Email",
    emailPlaceholder: "Email address",
    phoneLabel: "Phone",
    phonePlaceholder: "Phone number",
    descriptionLabel: "Service Description",
    descriptionPlaceholder: "Describe the characteristics",
    servicesOfferedTitle: "Services Offered",
    locationTitle: "Where do you offer your service?",

    registeringButton: "Registering...",
    continueButton: "Continue",
    errorNoToken: "Access token not found. Please log in again.",
    errorRNTRequired: "The RNT file is mandatory.",
    errorTaxRequired: "The TAX ID file is mandatory.",
    errorRNTUpload: "Error uploading the RNT file. Please try again.",
    errorTaxUpload: "Error uploading the TAX ID file. Please try again.",
    errorRegistrationGeneric: "Error registering the service. Please try again.",

    validationName: "Name is required.",
    validationEmail: "Must be a valid email.",
    validationPhone: "Phone is required.",
    validationCountry: "Please select a country.",
    validationState: "Please select a state.",
    validationCity: "Please select a city.",
    validationDescription: "Description is required.",
    validationTaxIdEIN: "The TAX ID is required.",
    validationRNTFile: "The RNT file is mandatory.",
    validationTaxIdEINFile: "The TAX ID file is mandatory.",
  }
}

export default function RegisterServicePage() {
  // 1. Obtener el idioma de la URL
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es' if not found
  const t = translations[lang] || translations.es; // Seleccionar traducción

  const [isCheckingServices, setIsCheckingServices] = useState(true)
  const [hasExistingService, setHasExistingService] = useState(false)
  const [extraTags, setExtraTags] = useState<
    {
      id: string
      name: string
      name_en: string
      icon: string
      enable_property: boolean
      enable_services: boolean
    }[]
  >([])

  const router = useRouter()

  // 💡 Refs y Estados para el manejo de archivos (RNT File)
  const RNTFileRef = useRef<FileUploadHandle>(null)
  const [RNTFileToUpload, setRNTFileToUpload] = useState<File | null>(null)
  const [RNTFileToDelete, setRNTFileToDelete] = useState<string | undefined>(undefined)

  // 💡 Refs y Estados para el manejo de archivos (TAX ID File)
  const taxFileRef = useRef<FileUploadHandle>(null)
  const [taxFileToUpload, setTaxFileToUpload] = useState<File | null>(null)
  const [taxFileToDelete, setTaxFileToDelete] = useState<string | undefined>(undefined)
  // ------------------------------------------------------------------------

  // Zod Schema using dynamic translations
  const formSchema = z.object({
    name: z.string().min(1, t.validationName),
    email: z.string().email(t.validationEmail),
    phone: z.string().min(1, t.validationPhone),
    country: z.string().min(1, t.validationCountry),
    state: z.string().min(1, t.validationState),
    city: z.string().min(1, t.validationCity),
    membership: z.string(),
    description: z.string().min(6, t.validationDescription),
    taxIdEIN: z.string().min(1, t.validationTaxIdEIN),
    RNTFile: z.string().min(1, t.validationRNTFile),
    taxIdEINFile: z.string().min(1, t.validationTaxIdEINFile),
    extraTags: z.array(z.string()),
    serviceTags: z.array(z.string()).default([]),
    subscriptionPrice: z.string().default(""),
    subscriptionType: z.string().default(""),
    price: z.string().default(""),
  })

  type FormValues = z.infer<typeof formSchema>


  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        // Mejor usar console.error y redirigir
        console.error(t.errorNoToken); 
        router.push(`/${lang}/login`)

        return
      }

      try {
        const currentUser = await getCurrentUser(token)
        const data = await getProvidersByUserId(currentUser.id, token)

        if (data.length > 0) {
          setHasExistingService(true)
        }
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error)
      } finally {
        setIsCheckingServices(false)
      }
    }

    checkAuthAndFetchData()
  }, [router, t]) // Dependencia 't' para el errorNoToken

  useEffect(() => {
    const loadTags = async () => {
      try {
        const extraTagsData = await getExtraTags()
        setExtraTags(extraTagsData)
      } catch (error) {
        console.error(error)
      }
    }
    loadTags()
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      membership: "bronze",
      taxIdEIN: "",
      RNTFile: defaultRNTFile.id, // Inicializa con ID vacío
      taxIdEINFile: defaultTaxFile.id, // Inicializa con ID vacío
      extraTags: [],
      serviceTags: [],
    },
  })

  const { setValue, setError } = form


  const selectedExtraTags = useWatch({
    control: form.control,
    name: "extraTags",
  })

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      if (JSON.stringify(tags) !== JSON.stringify(selectedExtraTags)) {
        setValue("extraTags", tags, { shouldDirty: true })
      }
    },
    [selectedExtraTags, setValue],
  )



  // 💡 Nuevo manejador de cambio para RNTFile
  const handleRNTFileChange = (file: File | null, fileIdToDelete: string | undefined) => {
    setRNTFileToUpload(file)
    setRNTFileToDelete(fileIdToDelete)
    if (file || fileIdToDelete) {
      form.clearErrors("RNTFile")
      form.setValue("RNTFile", file ? "pending-upload" : fileIdToDelete || "")
    } else {
      form.setValue("RNTFile", "")
    }
  }

  // 💡 Nuevo manejador de cambio para TaxFile
  const handleTaxFileChange = (file: File | null, fileIdToDelete: string | undefined) => {
    setTaxFileToUpload(file)
    setTaxFileToDelete(fileIdToDelete)
    if (file || fileIdToDelete) {
      form.clearErrors("taxIdEINFile")
      form.setValue("taxIdEINFile", file ? "pending-upload" : fileIdToDelete || "")
    } else {
      form.setValue("taxIdEINFile", "")
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    // 1. Obtener el token de acceso
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      console.error(t.errorNoToken)
      router.push(`/${lang}/login`)
      setIsSubmitting(false)
      return
    }

    // 2. Validar archivos requeridos usando la referencia
    const isRNTFileValid = RNTFileRef.current?.validate()
    const isTaxFileValid = taxFileRef.current?.validate()

    if (!isRNTFileValid) {
      setError("RNTFile", { message: t.errorRNTRequired })
      setIsSubmitting(false)
      return
    }
    if (!isTaxFileValid) {
      setError("taxIdEINFile", { message: t.errorTaxRequired })
      setIsSubmitting(false)
      return
    }

    // 3. Obtener IDs actuales antes de cargar/eliminar
    let finalRNTFileId = RNTFileRef.current?.getCurrentFileId() || ""
    let finalTaxFileId = taxFileRef.current?.getCurrentFileId() || ""

    try {
      // 4. ELIMINACIÓN: Eliminar archivos marcados para borrado
      if (RNTFileToDelete) {
        await deleteFile(RNTFileToDelete, accessToken)
      }
      if (taxFileToDelete) {
        await deleteFile(taxFileToDelete, accessToken)
      }

      // 5. CARGA: Subir nuevos archivos y actualizar IDs
      if (RNTFileToUpload) {
        const uploadResponse = await uploadFile(RNTFileToUpload)
        finalRNTFileId = uploadResponse.id
      }

      if (taxFileToUpload) {
        const uploadResponse = await uploadFile(taxFileToUpload)
        finalTaxFileId = uploadResponse.id
      }
      
      // 6. Validación final de IDs (por si la carga falló silenciosamente)
      if (!finalRNTFileId) {
        console.error(t.errorRNTUpload)
        setError("RNTFile", { message: t.errorRNTUpload })
        setIsSubmitting(false)
        return
      }
      if (!finalTaxFileId) {
        console.error(t.errorTaxUpload)
        setError("taxIdEINFile", { message: t.errorTaxUpload })
        setIsSubmitting(false)
        return
      }


      // 7. Preparar y enviar los datos del proveedor con los IDs finales
      const providerData: ProviderData = {
        userId: "",
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        state: values.state,
        city: values.city,
        description: values.description,
        membership: "bronze",
        taxIdEIN: values.taxIdEIN,
        RNTFile: finalRNTFileId, // ID Final
        taxIdEINFile: finalTaxFileId, // ID Final
        extraTags: values.extraTags,
        serviceTags: values.serviceTags,
        subscriptionPrice: values.subscriptionPrice || "",
        subscriptionType: values.subscriptionType || "",
        price: values.price || "",
      }

      localStorage.setItem("new_service", JSON.stringify(providerData))
      // router.push(`/mi-panel/mi-servicio`) // Descomentar al integrar la API real
      router.push(`/${lang}/subscriptions`)

    } catch (error) {
      console.error("Error al registrar el servicio o manejar archivos:", error)
      // Mensaje de error genérico en la UI
      setError("name", { message: t.errorRegistrationGeneric })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se eliminan los manejadores antiguos (handleRNTFileUpload, handleTaxFileUpload, etc.)

  if (isCheckingServices) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#39759E]" />
          <p className="text-muted-foreground">{t.loadingServiceCheck}</p>
        </div>
      </div>
    )
  }

  if (hasExistingService) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center p-4">
        <Card className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <Check className="mr-2" size={24} />
              {t.cardTitle}
            </CardTitle>
            <CardDescription className="text-blue-100"></CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              {t.cardDescription}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 mb-2">{t.nextSteps}</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  {t.reviewInfo}
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  {t.updateDetails}
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  {t.keepUpdated}
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-4 w-full">
              <Link href={`/${lang}/mi-panel/mi-servicio`} passHref className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="mr-2" size={16} />
                 {t.viewButton}
                </Button>
              </Link>
              <Link href={`/${lang}/mi-panel/editar-servicio`} passHref className="w-full">
                <Button variant="default" className="w-full">
                  <Edit className="mr-2" size={16} />
                  {t.editButton}
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
      <h1
            className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-8`}
          >
            {t.pageTitle}
          </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t.legalInfoTitle}</h2>
              <FormField
                control={form.control}
                name="taxIdEIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.taxIdEINLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.taxIdEINPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="RNTFile"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        {/* 💡 FileUpload con ref, onChange y lang */}
                        <FileUpload
                          ref={RNTFileRef}
                          label={t.RNTFileLabel}
                          defaultFile={defaultRNTFile}
                          onChange={handleRNTFileChange}
                          error={form.formState.errors.RNTFile?.message}
                          lang={lang}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxIdEINFile"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        {/* 💡 FileUpload con ref, onChange y lang */}
                        <FileUpload
                          ref={taxFileRef}
                          label={t.TaxIdEINFileLabel}
                          defaultFile={defaultTaxFile}
                          onChange={handleTaxFileChange}
                          error={form.formState.errors.taxIdEINFile?.message}
                          lang={lang}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
                <h2 className="text-lg">{t.serviceInfoTitle}</h2>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.serviceNameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.serviceNamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.emailLabel}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t.emailPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.phoneLabel}</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder={t.phonePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.descriptionLabel}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.descriptionPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <FormField
                control={form.control}
                name="extraTags"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg">{t.servicesOfferedTitle}</FormLabel>
                    <Controller
                      control={form.control}
                      name="extraTags"
                      render={() => (
                        <CollectionExtraTags
                          onChange={handleTagsChange}
                          extraTags={extraTags}
                          initialSelectedTags={selectedExtraTags}
                          enable="services"
                          lang={lang} // Pasamos la prop lang
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t.locationTitle}</h2>
              <LocationSelector
                onChange={({ country, state, city }) => {
                  form.setValue("country", country)
                  form.setValue("state", state)
                  form.setValue("city", city)
                }}
                error={{
                  country: form.formState.errors.country?.message,
                  state: form.formState.errors.state?.message,
                  city: form.formState.errors.city?.message,
                }}
                lang={lang} // Pasamos la prop lang
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t.registeringButton}
                </>
              ) : (
                <>
                  <Save />
                  {t.continueButton}
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}