"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, InfoIcon, AlertCircle, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { MultiImageUploader } from "./components/multi-image-uploader"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { CollectionServiceTags } from "@/components/collectionServiceTags"
import { getExtraTags } from "@/services/extraTagsService"
import { getServiceTags } from "@/services/serviceTagsService"
import { fetchStayData, type Stay } from "@/services/stayService"

import useTags from "@/hooks/useTags"

import Link from "next/link"
import { useEffect, useState } from "react"

import RoomTypeSelector from "./components/room-type-selector"

import { CheckinCheckoutSection } from "./components/checkin-checkout-section"
import { BudgetFlexibleDiscounts } from "./components/budget-flexible-discounts"

import { CancellationPolicyDialogContent } from "./components/cancellation-policy-dialog-content"
import { ModificationPolicyDialogContent } from "./components/modification-policy-dialog-content"

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

    isPrivate: z.boolean(),

    singleBeds: z.coerce
      .number()
      .min(0, { message: "Debe seleccionar cantidad" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    doubleBeds: z.coerce
      .number()
      .min(0, { message: "Debe seleccionar cantidad" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    beds: z.coerce
      .number()
      .min(0)
      .max(99, { message: "Máximo 99 camas" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    capacity: z.coerce
      .number()
      .min(0)
      .max(99, { message: "Capacidad máxima 99" })
      .transform((val) => (isNaN(val) ? 1 : val)),

    privateRoomPrice: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),
    privateRoomCleaning: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),

    sharedRoomPrice: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),
    sharedRoomCleaning: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),

    bedType: z.string(),
    bedName: z.string(),

    checkinTime: z.string().min(1, { message: "Seleccione horario de check-in" }),
    checkoutTime: z.string().min(1, { message: "Seleccione horario de check-out" }),

    shortStayDiscount: z.string().default("0"),
    mediumStayDiscount: z.string().default("0"),
    longStayDiscount: z.string().default("0"),

    photos: z.array(z.string()).default([]),
    imageFiles: z.array(z.any()).optional(),

    extraTags: z.array(z.string()).min(1, { message: "Elija al menos un servicio adicional" }),
    servicesTags: z.array(z.string()).min(1, { message: "Elija al menos un servicio básico" }),
    descriptionService: z.string(),
  })
  .refine(
    (data) => {
      if (data.singleBeds === 0 && data.doubleBeds === 0) {
        return true
      }
      return true
    },
    {
      message: "Los precios por noche deben ser mayores que 0",
      path: ["pricePerNight"],
    },
  )

type FormData = z.infer<typeof formSchema>

interface RoomFormProps {
  onSubmit: (data: FormData) => void
  initialValues?: Partial<FormData>
  isUploading?: boolean
}

interface DiscountData {
  shortStayDiscounts: string[]
  mediumStayDiscounts: string[]
  longStayDiscounts: string[]
  defaultShortStayDiscount: string
  defaultMediumStayDiscount: string
  defaultLongStayDiscount: string
  shortStayRange: { min: number; max: number | null }
  mediumStayRange: { min: number; max: number | null }
  longStayRange: { min: number; max: number | null }
}

export default function RoomForm({ onSubmit, initialValues, isUploading = false }: RoomFormProps) {
  const { toast } = useToast()

  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [checkinTime, setCheckinTime] = useState(initialValues?.checkinTime || "15:00")
  const [checkoutTime, setCheckoutTime] = useState(initialValues?.checkoutTime || "11:00")

  const [shortStayDiscount, setShortStayDiscount] = useState(initialValues?.shortStayDiscount || "0")
  const [mediumStayDiscount, setMediumStayDiscount] = useState(initialValues?.mediumStayDiscount || "0")
  const [longStayDiscount, setLongStayDiscount] = useState(initialValues?.longStayDiscount || "0")

  const [discountData, setDiscountData] = useState<DiscountData | null>(null)

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token") ?? ""
    if (!accessToken) return

    const loadData = async () => {
      try {
        const stays: Stay[] = await fetchStayData(accessToken)

        const shortStay = stays.find((s) => s.type === "short")
        const mediumStay = stays.find((s) => s.type === "medium")
        const longStay = stays.find((s) => s.type === "long")

        setDiscountData({
          shortStayDiscounts: shortStay?.discounts.map((d) => d.percentage.toString()) ?? ["0"],
          mediumStayDiscounts: mediumStay?.discounts.map((d) => d.percentage.toString()) ?? ["0"],
          longStayDiscounts: longStay?.discounts.map((d) => d.percentage.toString()) ?? ["0"],
          defaultShortStayDiscount: shortStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultMediumStayDiscount: mediumStay?.discounts[0]?.percentage.toString() ?? "0",
          defaultLongStayDiscount: longStay?.discounts[0]?.percentage.toString() ?? "0",
          shortStayRange: {
            min: shortStay?.minNights ?? 1,
            max: shortStay?.maxNights ?? 5,
          },
          mediumStayRange: {
            min: mediumStay?.minNights ?? 6,
            max: mediumStay?.maxNights ?? 9,
          },
          longStayRange: {
            min: longStay?.minNights ?? 10,
            max: longStay?.maxNights ?? null,
          },
        })
      } catch (err) {
        console.error("Error cargando descuentos:", err)
      }
    }

    loadData()
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialValues?.id || "",
      propertyId: initialValues?.propertyId || "",
      name: initialValues?.name || "",
      roomNumber: initialValues?.roomNumber || "",
      description: initialValues?.description || "",

      isPrivate: initialValues?.isPrivate !== undefined ? initialValues.isPrivate : true,

      singleBeds: initialValues?.singleBeds || 0,
      doubleBeds: initialValues?.doubleBeds || 0,

      beds: initialValues?.beds || 0,
      capacity: initialValues?.capacity || 1,

      privateRoomPrice: initialValues?.privateRoomPrice || 0,
      privateRoomCleaning: initialValues?.privateRoomCleaning || 0,

      sharedRoomPrice: initialValues?.sharedRoomPrice || 0,
      sharedRoomCleaning: initialValues?.sharedRoomCleaning || 0,

      bedType: initialValues?.bedType || "single",
      bedName: initialValues?.bedName || "",

      checkinTime: initialValues?.checkinTime || "15:00",
      checkoutTime: initialValues?.checkoutTime || "11:00",

      shortStayDiscount: initialValues?.shortStayDiscount || "0",
      mediumStayDiscount: initialValues?.mediumStayDiscount || "0",
      longStayDiscount: initialValues?.longStayDiscount || "0",

      photos: initialValues?.photos || [],
      imageFiles: [],
      extraTags: initialValues?.extraTags || [],
      servicesTags: initialValues?.servicesTags || [],
      descriptionService: initialValues?.descriptionService || "",
    },
    mode: "onTouched",
  })

  const { extraTags, serviceTags } = useTags("extraTags", "servicesTags", getExtraTags, getServiceTags)

  const isPrivate = form.watch("isPrivate")
  const singleBeds = form.watch("singleBeds")
  const doubleBeds = form.watch("doubleBeds")

  useEffect(() => {
    form.setValue("checkinTime", checkinTime)
  }, [checkinTime, form])

  useEffect(() => {
    form.setValue("checkoutTime", checkoutTime)
  }, [checkoutTime, form])

  useEffect(() => {
    form.setValue("mediumStayDiscount", mediumStayDiscount)
  }, [mediumStayDiscount, form])

  useEffect(() => {
    form.setValue("longStayDiscount", longStayDiscount)
  }, [longStayDiscount, form])

  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds
    form.setValue("beds", totalBeds)

    const estimatedCapacity = singleBeds + doubleBeds * 2
    form.setValue("capacity", estimatedCapacity)

    if (isPrivate && totalBeds === 0) {
      form.setValue("privateRoomPrice", 0)
      form.setValue("privateRoomCleaning", 0)
    }

    if (totalBeds > 0) {
      form.clearErrors("beds")
      form.clearErrors("capacity")
      form.clearErrors("singleBeds")
      form.clearErrors("doubleBeds")
    }
  }, [singleBeds, doubleBeds, form, isPrivate])

  async function handleSubmit(values: FormData) {
    console.log(values)

    if (imageFiles.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debe subir al menos 1 foto",
        variant: "destructive",
      })
      return
    }

    try {
      const processedValues = {
        ...values,
        singleBeds: Number(values.singleBeds) || 0,
        doubleBeds: Number(values.doubleBeds) || 0,
        beds: Number(values.beds) || 0,
        capacity: Number(values.capacity) || 1,
        privateRoomPrice: Number(values.privateRoomPrice) || 0,
        privateRoomCleaning: Number(values.privateRoomCleaning) || 0,
        sharedRoomPrice: Number(values.sharedRoomPrice) || 0,
        sharedRoomCleaning: Number(values.sharedRoomCleaning) || 0,
        imageFiles: imageFiles,
      }

      if (processedValues.isPrivate) {
        if (processedValues.privateRoomPrice <= 0) {
          form.setError("privateRoomPrice", {
            type: "manual",
            message: "El precio por noche debe ser mayor que 0",
          })
          document.getElementById("privateRoomPrice")?.focus()
          return
        }

        if (processedValues.singleBeds === 0 && processedValues.doubleBeds === 0) {
          toast({
            title: "Error de validación",
            description: "Debe seleccionar al menos una cama",
            variant: "destructive",
          })
          return
        }

        if (processedValues.privateRoomCleaning < 0) {
          form.setError("privateRoomCleaning", {
            type: "manual",
            message: "La tarifa de limpieza no puede ser negativa",
          })
          document.getElementById("privateRoomCleaning")?.focus()
          return
        }
      } else {
        if (processedValues.sharedRoomPrice <= 0) {
          form.setError("sharedRoomPrice", {
            type: "manual",
            message: "El precio por noche por cama debe ser mayor que 0",
          })
          document.getElementById("sharedRoomPrice")?.focus()
          return
        }

        if (processedValues.sharedRoomCleaning < 0) {
          form.setError("sharedRoomCleaning", {
            type: "manual",
            message: "La tarifa de limpieza por cama no puede ser negativa",
          })
          document.getElementById("sharedRoomCleaning")?.focus()
          return
        }
      }

      await onSubmit(processedValues)
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
                  <FormLabel>Nombre del alojamiento</FormLabel>
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
                  <FormLabel>Número</FormLabel>
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
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    error={!!form.formState.errors.description}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <RoomTypeSelector
          control={form.control}
          isPrivate={isPrivate}
          singleBeds={singleBeds}
          doubleBeds={doubleBeds}
          watch={form.watch}
          setValue={form.setValue}
        />

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Horarios de Check-in y Check-out</h3>
            <p className="text-sm text-gray-600">
              Establece los horarios estándar para la llegada y salida de los huéspedes.
            </p>
            <CheckinCheckoutSection
              checkinTime={checkinTime}
              setCheckinTime={setCheckinTime}
              checkoutTime={checkoutTime}
              setCheckoutTime={setCheckoutTime}
              defaultCheckinTime="15:00"
              defaultCheckoutTime="11:00"
            />
            <FormField
              control={form.control}
              name="checkinTime"
              render={() => (
                <FormItem className="hidden">
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkoutTime"
              render={() => (
                <FormItem className="hidden">
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <BudgetFlexibleDiscounts
          shortStayDiscount={shortStayDiscount}
          setShortStayDiscount={setShortStayDiscount}
          mediumStayDiscount={mediumStayDiscount}
          setMediumStayDiscount={setMediumStayDiscount}
          longStayDiscount={longStayDiscount}
          setLongStayDiscount={setLongStayDiscount}
          shortStayDiscounts={discountData?.shortStayDiscounts}
          mediumStayDiscounts={discountData?.mediumStayDiscounts}
          longStayDiscounts={discountData?.longStayDiscounts}
          defaultShortStayDiscount={discountData?.defaultShortStayDiscount}
          defaultMediumStayDiscount={discountData?.defaultMediumStayDiscount}
          defaultLongStayDiscount={discountData?.defaultLongStayDiscount}
          shortStayRange={discountData?.shortStayRange}
          mediumStayRange={discountData?.mediumStayRange}
          longStayRange={discountData?.longStayRange}
        />

        <FormField
          control={form.control}
          name="shortStayDiscount"
          render={() => (
            <FormItem className="hidden">
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mediumStayDiscount"
          render={() => (
            <FormItem className="hidden">
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longStayDiscount"
          render={() => (
            <FormItem className="hidden">
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormItem>
            <FormLabel>Fotos</FormLabel>
            <FormControl>
              <MultiImageUploader
                maxImages={6}
                onImagesChange={(files) => {
                  setImageFiles(files)
                  // Clear photos validation error when images are selected
                  if (files.length > 0) {
                    form.clearErrors("photos")
                  }
                }}
              />
            </FormControl>
            {imageFiles.length === 0 && <p className="text-sm text-destructive mt-2">Debe subir al menos 1 foto</p>}
          </FormItem>
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

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormLabel>Políticas de Recovery Care Solutions</FormLabel>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-800 text-sm">Pago Flexible</span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Anticipo 10%
                </span>
              </div>

              <p className="text-xs text-gray-600">
                Se permite al huésped pagar un <strong>anticipo del 10%</strong> para asegurar la reserva y completar el
                pago más adelante, con anulación gratuita en las primeras 24 horas. Para estadías largas (+10 noches),
                este anticipo es reembolsable bajo ciertas condiciones según las políticas de la plataforma Recovery
                Care Solutions.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Ver Políticas de Anulación
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Políticas de Anulación de Reserva</DialogTitle>
                  <DialogDescription>
                    Detalles sobre las condiciones de cancelación para diferentes tipos de estadía.
                  </DialogDescription>
                </DialogHeader>
                <CancellationPolicyDialogContent />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Ver Políticas de Modificación
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Políticas de Modificación de Reserva</DialogTitle>
                  <DialogDescription>
                    Detalles sobre las condiciones para modificar una reserva existente.
                  </DialogDescription>
                </DialogHeader>
                <ModificationPolicyDialogContent />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 mt-4 p-4 md:p-0">
          <Link href={`/mi-panel/propiedades/${initialValues?.propertyId}/`} className="flex-1 w-full">
            <Button variant="outline" type="button" className="w-full text-sm px-4 py-3 h-full bg-transparent">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isUploading}
            className="flex-1 w-full text-sm px-4 py-3 bg-[#39759E] h-full"
          >
            {form.formState.isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Subiendo Fotos..." : "Guardando..."}
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
