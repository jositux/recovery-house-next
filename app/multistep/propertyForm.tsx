"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/FileUpload"
import CoverPhotoUpload from "@/components/CoverPhotoUpload"
import { LocationSelector } from "@/components/ui/location-selector"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { MultiSelectCase } from "@/components/MultiSelectCase"
import { Building2, Home, Save, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useCallback } from "react"

const OpenStreetMapSelector = dynamic(() => import("@/components/OSMSelector").then((mod) => mod.default), {
  ssr: false,
})

import type { LocationDetails } from "@/components/OSMSelector"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(6, "El la descripcion es requerida."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string().min(1, "El código postal es requerido."),
  address: z.string(),
  fullAddress: z.string().min(5, "La direccion debe tener por lo menos 5 letras."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  mainImage: z.string().min(1, "La foto de la propiedad es obligatoria."),
  RNTFile: z.string().min(1, "El archivo RNT es obligatorio."),
  taxIdEINFile: z.string().min(1, "El archivo TAX ID es obligatorio."),
  hostName: z.string().min(1, "El nombre es obligatorio."),
  guestComments: z.string().min(1, "El campo es obligatorio."),
})

export type FormValues = z.infer<typeof formSchema>

interface PropertyFormProps {
  onSubmit: (values: FormValues) => void
  isSubmitting: boolean
  initialValues: Partial<FormValues>
}

export default function PropertyForm({ onSubmit, isSubmitting, initialValues }: PropertyFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  const handleImageIdChange = useCallback(
    (newImageId: string) => {
      form.setValue("mainImage", newImageId)
      form.clearErrors("mainImage")
    },
    [form],
  )

  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as keyof FormValues,value as FormValues[keyof FormValues], { shouldValidate: false })
        }
      })
    }
  }, [initialValues, form])

  const handleLocationSelected = useCallback(
    (details: LocationDetails) => {
      form.setValue("address", details.address)
      form.setValue("latitude", details.lat)
      form.setValue("longitude", details.lng)
      form.setValue("postalCode", details.postalCode)
    },
    [form],
  )

  const defaultLocation = {
    address: initialValues.address || "",
    lat: initialValues.latitude || 0,
    lng: initialValues.longitude || 0,
    postalCode: initialValues.postalCode || "",
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la propiedad</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la propiedad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto de la Propiedad</FormLabel>
              <FormControl>
                <CoverPhotoUpload defaultImageId={field.value} onImageIdChange={handleImageIdChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe tu propiedad</FormLabel>
              <FormControl>
                <Textarea
                  className="h-full min-h-[100px]"
                  placeholder="Describe las características de la propiedad"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <MultiSelectCase onChange={(selectedIds) => console.log("Selected options:", selectedIds)} />

        <LocationSelector
          defaultCountry={""}
          defaultState={""}
          defaultCity={""}
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
        />

        <FormField
          control={form.control}
          name="fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Legal</FormLabel>
              <FormControl>
                <Input placeholder="Dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <OpenStreetMapSelector onLocationSelected={handleLocationSelected} defaultLocation={defaultLocation} />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Propiedad</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UserTypeCard
                    icon={Home}
                    title="Estancia"
                    description="Alojamiento para estancias cortas"
                    selected={field.value === "Stay"}
                    onClick={() => field.onChange("Stay")}
                    aria-label="Select Stay as property type"
                  />
                  <UserTypeCard
                    icon={Building2}
                    title="Casa de Recuperación"
                    description="Alojamiento para recuperación post-operatoria"
                    selected={field.value === "RecoveryHouse"}
                    onClick={() => field.onChange("RecoveryHouse")}
                    aria-label="Select Recovery as property type"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxIdEIN"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Impuestos Tax ID/EIN</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Tax ID/EIN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="RNTFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Archivo RNT</FormLabel>
                <FormControl>
                  <FileUpload
                    id={field.value}
                    filename_download=""
                    onUploadSuccess={(response) => {
                      form.setValue("RNTFile", response.id)
                      form.clearErrors("RNTFile")
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdEINFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Archivo de Impuestos TAX ID</FormLabel>
                <FormControl>
                  <FileUpload
                    id={field.value}
                    filename_download=""
                    onUploadSuccess={(response) => {
                      form.setValue("taxIdEINFile", response.id)
                      form.clearErrors("taxIdEINFile")
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hostName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del anfitrión</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Nombre del anfitrión" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestComments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios para el huésped</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Escribe un mensaje de bienvenida o instrucciones para tus huéspedes"
                      {...field}
                      className="h-full min-h-[100px]"
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
          className="w-full mx-auto bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Save className="animate-spin" />
              GUARDANDO...
            </>
          ) : (
            <>
              <ArrowRight />
              SIGUIENTE
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

