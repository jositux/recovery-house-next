"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/FileUpload"
import { LocationSelector } from "@/components/ui/location-selector"
import type { ProviderData } from "@/services/providerService"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { getExtraTags } from "@/services/extraTagsService"
import { useRouter } from "next/navigation"
import { getProvidersByUserId } from "@/services/providerCollectionService"
import { getCurrentUser } from "@/services/userService"
import { Loader2, Check, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Debe ser un email válido."),
  phone: z.string().min(1, "El teléfono es requerido."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  membership: z.string(),
  description: z.string().min(6, "La descripción es requerida."),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  RNTFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo RNT es obligatorio.",
  }),
  taxIdEINFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo TAX ID es obligatorio.",
  }),
  extraTags: z.array(z.string()),
  serviceTags: z.array(z.string()).default([]),
  subscriptionPrice: z.string().default(""),
  subscriptionType: z.string().default(""),
  price: z.string().default(""),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterServicePage() {
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

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const currentUser = await getCurrentUser(token)
        const data = await getProvidersByUserId(currentUser.id, token)

        if (data.length > 0) {
          setHasExistingService(true)
          router.push(`/mi-panel/mi-servicio`)
        }
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error)
      } finally {
        setIsCheckingServices(false)
      }
    }

    checkAuthAndFetchData()
  }, [router])

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

  const [RNTFileData, setRNTFileData] = useState<{
    id: string
    filename_download: string
  }>({ id: "", filename_download: "" })

  const [TaxFileData, setTaxFileData] = useState<{
    id: string
    filename_download: string
  }>({ id: "", filename_download: "" })

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
      RNTFile: "",
      taxIdEINFile: "",
      extraTags: [],
      serviceTags: [],
    },
  })

  const { setValue } = form

  const handleTagsChange = (tags: string[]) => {
    if (JSON.stringify(tags) !== JSON.stringify(selectedExtraTags)) {
      setValue("extraTags", tags, { shouldDirty: true })
    }
  }

  const selectedExtraTags = useWatch({
    control: form.control,
    name: "extraTags",
  })

  const onSubmit = async (values: FormValues) => {
    if (!values.RNTFile || !values.taxIdEINFile) {
      console.error("Faltan archivos obligatorios.")
      return
    }

    setIsSubmitting(true)
    try {
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
        RNTFile: values.RNTFile,
        taxIdEINFile: values.taxIdEINFile,
        extraTags: values.extraTags,
        serviceTags: values.serviceTags,
        subscriptionPrice: values.subscriptionPrice || "",
        subscriptionType: values.subscriptionType || "",
        price: values.price || "",
      }

      localStorage.setItem("new_service", JSON.stringify(providerData))
      //router.push(`/mi-panel/mi-servicio`)
      router.push(`/subscriptions`)
    } catch (error) {
      console.error("Error al registrar el servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRNTFileUpload = (response: { id: string; filename_download: string }) => {
    setRNTFileData(response)
    form.setValue("RNTFile", response.id)
    form.clearErrors("RNTFile")
  }

  const handleTaxFileUpload = (response: { id: string; filename_download: string }) => {
    setTaxFileData(response)
    form.setValue("taxIdEINFile", response.id)
    form.clearErrors("taxIdEINFile")
  }

  const handleRNTFileClear = () => {
    setRNTFileData({ id: "", filename_download: "" })
    form.setValue("RNTFile", "")
  }

  const handleTaxFileClear = () => {
    setTaxFileData({ id: "", filename_download: "" })
    form.setValue("taxIdEINFile", "")
  }

  if (isCheckingServices) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#39759E]" />
          <p className="text-muted-foreground">Verificando servicios...</p>
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
              Servicio Cargado
            </CardTitle>
            <CardDescription className="text-blue-100"></CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Has completado exitosamente el registro de tu servicio. Ahora puedes editarlo según tus necesidades.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 mb-2">Próximos pasos:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  Revisa la información de tu servicio
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  Actualiza tus detalles si es necesario
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  Mantén tu perfil actualizado para atraer más clientes
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-4 w-full">
              <Link href="/mi-panel/mi-servicio" passHref className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="mr-2" size={16} />
                 Ver
                </Button>
              </Link>
              <Link href="/mi-panel/editar-servicio" passHref className="w-full">
                <Button variant="default" className="w-full">
                  <Edit className="mr-2" size={16} />
                  Editar
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
            Registra tu servicio
          </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">Información Legal</h2>
              <FormField
                control={form.control}
                name="taxIdEIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID/EIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID/EIN" {...field} />
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
                      <FormLabel>RNT File</FormLabel>
                      <FormControl>
                        <FileUpload
                          id={RNTFileData.id}
                          filename_download={RNTFileData.filename_download}
                          onUploadSuccess={handleRNTFileUpload}
                          onClearFile={handleRNTFileClear}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxIdEINFile"
                  render={() => (
                    <FormItem>
                      <FormLabel>TAX ID File</FormLabel>
                      <FormControl>
                        <FileUpload
                          id={TaxFileData.id}
                          filename_download={TaxFileData.filename_download}
                          onUploadSuccess={handleTaxFileUpload}
                          onClearFile={handleTaxFileClear}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Servicio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Peluquería Pedrito" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Correo electrónico" {...field} />
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
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Número de teléfono" {...field} />
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
                    <FormControl>
                      <Textarea placeholder="Describe las características" {...field} />
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
                    <FormLabel className="text-lg">Servicios Ofrecidos</FormLabel>
                    <Controller
                      control={form.control}
                      name="extraTags"
                      render={() => (
                        <CollectionExtraTags
                          onChange={handleTagsChange}
                          extraTags={extraTags}
                          initialSelectedTags={selectedExtraTags}
                          enable="services"
                          lang="es"
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">Dónde ofrece su servicio?</h2>
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
                lang="es"
              />
            </div>
            <Button type="submit" className="w-full bg-[#39759E]" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Continuar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
