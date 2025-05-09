"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import GalleryUpload from "@/components/GalleryUpload"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { CollectionServiceTags } from "@/components/collectionServiceTags"
import { getExtraTags } from "@/services/extraTagsService"
import { getServiceTags } from "@/services/serviceTagsService"
import useTags from "@/hooks/useTags"

import Link from "next/link"
import { useEffect } from "react"

// Importar el nuevo componente
import RoomTypeSelector from "./room-type-selector"

// Function to pluralize words in Spanish
export const pluralize = (quantity: number, singular: string, plural: string) => {
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`
}

export const formSchema = z
  .object({
    id: z.string(),
    propertyId: z.string(),
    name: z.string().min(1, { message: "El nombre es requerido" }),
    roomNumber: z.string().min(1, { message: "El número de habitación es requerido" }),
    description: z.string().min(1, { message: "La descripción es requerida" }),

    // Room type fields from previous component
    isPrivate: z.boolean(),

    // Beds configuration
    singleBeds: z.coerce
      .number()
      .min(0, { message: "Debe seleccionar cantidad" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    doubleBeds: z.coerce
      .number()
      .min(0, { message: "Debe seleccionar cantidad" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    // Total beds and capacity
    beds: z.coerce
      .number()
      .int()
      .positive()
      .max(99, { message: "Máximo 99 camas" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    capacity: z.coerce
      .number()
      .int()
      .positive()
      .max(99, { message: "Capacidad máxima 99" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    // Pricing for private room - ahora condicional basado en isPrivate
    pricePerNight: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),
    cleaningFee: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),

    // Pricing for shared room
    singleBedPrice: z.coerce
      .number()
      .min(0, { message: "El precio no puede ser negativo" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    singleBedCleaningPrice: z.coerce
      .number()
      .min(0, { message: "El precio no puede ser negativo" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    doubleBedPrice: z.coerce
      .number()
      .min(0, { message: "El precio no puede ser negativo" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    doubleBedCleaningPrice: z.coerce
      .number()
      .min(0, { message: "El precio no puede ser negativo" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    // Other fields
    photos: z.array(z.string()).min(1, { message: "Suba al menos 1 foto" }),
    extraTags: z.array(z.string()).min(1, { message: "Elija al menos un servicio adicional" }),
    servicesTags: z.array(z.string()).min(1, { message: "Elija al menos un servicio básico" }),
    descriptionService: z.string(),
  })
  .refine(
    (data) => {
      // Si es habitación privada, validar que los precios sean positivos
      if (data.isPrivate) {
        return data.pricePerNight > 0 && data.cleaningFee > 0
      }
      // Si es compartida, validar que al menos un tipo de cama tenga precio positivo
      return (
        (data.singleBeds > 0 && data.singleBedPrice > 0 && data.singleBedCleaningPrice > 0) ||
        (data.doubleBeds > 0 && data.doubleBedPrice > 0 && data.doubleBedCleaningPrice > 0)
      )
    },
    {
      message: "Los precios deben ser mayores que 0 según el tipo de habitación",
      path: ["pricePerNight"], // Este campo mostrará el error
    },
  )

type FormData = z.infer<typeof formSchema>

interface RoomFormProps {
  onSubmit: (data: FormData) => void
  initialValues?: Partial<FormData>
}

export default function RoomForm({ onSubmit, initialValues }: RoomFormProps) {
  const { toast } = useToast()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialValues?.id || "",
      propertyId: initialValues?.propertyId || "",
      name: initialValues?.name || "",
      roomNumber: initialValues?.roomNumber || "",
      description: initialValues?.description || "",

      // Room type defaults
      isPrivate: initialValues?.isPrivate !== undefined ? initialValues.isPrivate : true,

      // Beds configuration
      singleBeds: initialValues?.singleBeds || 0,
      doubleBeds: initialValues?.doubleBeds || 0,

      // Total beds and capacity
      beds: initialValues?.beds || 1,
      capacity: initialValues?.capacity || 1,

      // Pricing for private room
      pricePerNight: initialValues?.pricePerNight || 0,
      cleaningFee: initialValues?.cleaningFee || 0,

      // Pricing for shared room
      singleBedPrice: initialValues?.singleBedPrice || 0,
      singleBedCleaningPrice: initialValues?.singleBedCleaningPrice || 0,
      doubleBedPrice: initialValues?.doubleBedPrice || 0,
      doubleBedCleaningPrice: initialValues?.doubleBedCleaningPrice || 0,

      // Other fields
      photos: initialValues?.photos || [],
      extraTags: initialValues?.extraTags || [],
      servicesTags: initialValues?.servicesTags || [],
      descriptionService: initialValues?.descriptionService || "",
    },
    mode: "onTouched",
  })

  const { extraTags, serviceTags } = useTags("extraTags", "servicesTags", getExtraTags, getServiceTags)

  // Get current value of isPrivate
  const isPrivate = form.watch("isPrivate")
  const singleBeds = form.watch("singleBeds")
  const doubleBeds = form.watch("doubleBeds")

  // Update total beds when single or double beds change
  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds
    form.setValue("beds", totalBeds)

    // Also update capacity based on beds
    // Assuming 1 person per single bed and 2 per double bed
    const estimatedCapacity = singleBeds + doubleBeds * 2
    form.setValue("capacity", estimatedCapacity)
  }, [singleBeds, doubleBeds, form])

  // Modificar la validación en el handleSubmit para manejar correctamente los precios según el tipo de habitación
  async function handleSubmit(values: FormData) {
    try {
      // Asegurar que todos los campos numéricos sean números
      const processedValues = {
        ...values,
        singleBeds: Number(values.singleBeds),
        doubleBeds: Number(values.doubleBeds),
        beds: Number(values.beds),
        capacity: Number(values.capacity),
        pricePerNight: Number(values.pricePerNight),
        cleaningFee: Number(values.cleaningFee),
        singleBedPrice: Number(values.singleBedPrice),
        singleBedCleaningPrice: Number(values.singleBedCleaningPrice),
        doubleBedPrice: Number(values.doubleBedPrice),
        doubleBedCleaningPrice: Number(values.doubleBedCleaningPrice),
      }

      // Validación adicional según el tipo de habitación
      if (processedValues.isPrivate) {
        if (processedValues.pricePerNight <= 0 || processedValues.cleaningFee <= 0) {
          toast({
            title: "Error de validación",
            description:
              "Para habitaciones privadas, el precio por noche y la tarifa de limpieza deben ser mayores que 0",
            variant: "destructive",
          })
          return
        }
      } else {
        // Para habitaciones compartidas, validar que al menos un tipo de cama tenga precio
        const hasSingleBeds = processedValues.singleBeds > 0
        const hasDoubleBeds = processedValues.doubleBeds > 0
        const hasSingleBedPrice = processedValues.singleBedPrice > 0 && processedValues.singleBedCleaningPrice > 0
        const hasDoubleBedPrice = processedValues.doubleBedPrice > 0 && processedValues.doubleBedCleaningPrice > 0

        if ((hasSingleBeds && !hasSingleBedPrice) || (hasDoubleBeds && !hasDoubleBedPrice)) {
          toast({
            title: "Error de validación",
            description: "Cada tipo de cama seleccionada debe tener un precio por noche y de limpieza",
            variant: "destructive",
          })
          return
        }
      }

      await onSubmit(processedValues)
      toast({
        title: "¡Felicidades!",
        description: "La habitación ha sido guardada",
        variant: "default",
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Por favor revise todos los datos",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[65%_30%] gap-4 p-4 bg-white rounded-xl">
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Habitación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Habitación con Vista al Lago" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Habitación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 1D" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ingrese una descripción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Room Type Selection */}
        <RoomTypeSelector
          control={form.control}
          isPrivate={isPrivate}
          singleBeds={singleBeds}
          doubleBeds={doubleBeds}
          watch={form.watch}
          setValue={form.setValue}
        />

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fotos de la Habitación</FormLabel>
                <FormControl>
                  <GalleryUpload
                    initialIds={field.value}
                    onGalleryChange={(newGallery: string[]) => {
                      console.log(newGallery)
                      field.onChange(newGallery)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="servicesTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servicios Básicos</FormLabel>
                <FormControl>
                  <CollectionServiceTags
                    onChange={(newTags: string[]) => {
                      if (JSON.stringify(newTags) !== JSON.stringify(field.value)) {
                        field.onChange(newTags)
                      }
                    }}
                    servicesTags={serviceTags || []}
                    initialSelectedTags={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="extraTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servicios Adicionales</FormLabel>
                <FormControl>
                  <CollectionExtraTags
                    onChange={(newTags: string[]) => {
                      if (JSON.stringify(newTags) !== JSON.stringify(field.value)) {
                        field.onChange(newTags)
                      }
                    }}
                    extraTags={extraTags || []}
                    initialSelectedTags={field.value}
                    enable="property"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Información Adicional de Servicios</FormLabel>
                <FormControl>
                  <Textarea placeholder="Si necesita explicar más sobre sus servicios, escriba aquí" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 mt-4 p-4 md:p-0">
          <Link href={`/propiedades/${initialValues?.propertyId}/`} className="flex-1 w-full">
            <Button variant="outline" type="button" className="w-full text-sm px-4 py-3 h-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex-1 w-full text-sm px-4 py-3 bg-[#39759E] h-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
