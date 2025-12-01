"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, InfoIcon, AlertCircle, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// Import the RichTextEditor component
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

import { MultiImageUploaderWithIds } from "../components/multi-image-uploader-with-ids"
import { CollectionExtraTags } from "@/components/collectionExtraTags"
import { CollectionServiceTags } from "@/components/collectionServiceTags"
import { getExtraTags } from "@/services/extraTagsService"
import { getServiceTags } from "@/services/serviceTagsService"
import { fetchStayData, type Stay } from "@/services/stayService"

import useTags from "@/hooks/useTags"

import Link from "next/link"
import { useEffect, useState } from "react"

import RoomTypeSelector from "../components/room-type-selector"

import { CheckinCheckoutSection } from "../components/checkin-checkout-section"
import { BudgetFlexibleDiscounts } from "../components/budget-flexible-discounts"

import { CancellationPolicyDialogContent } from "@/components/popups/cancellation-policy-dialog-content"
import { ModificationPolicyDialogContent } from "@/components/popups/modification-policy-dialog-content"

// Definición simple de tipos de idioma para referencia 
import { type Locale } from "@/lib/i18n"
import { useParams } from "next/navigation";

// Function to pluralize words in Spanish
export const pluralize = (quantity: number, singular: string, plural: string) => {
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`
}

// === FUNCIÓN PARA CREAR EL ESQUEMA DINÁMICO ===
const createFormSchema = (isSpanish: boolean) => {
  const nameRequired = isSpanish ? "El nombre es requerido" : "Name Required";
  const roomNumberRequired = isSpanish ? "El número de habitación es requerido" : "Room number required";
  const descriptionRequired = isSpanish ? "La descripción es requerida" : "Description required";
  const quantityRequired = isSpanish ? "Debe seleccionar cantidad" : "Must select quantity";
  const max99Beds = isSpanish ? "Máximo 99 camas" : "Maximum 99 beds";
  const max99Capacity = isSpanish ? "Capacidad máxima 99" : "Maximum capacity 99";
  const checkinRequired = isSpanish ? "Seleccione horario de check-in" : "Select check-in time";
  const checkoutRequired = isSpanish ? "Seleccione horario de check-out" : "Select check-out time";
  const photoRequired = isSpanish ? "Suba al menos 1 foto" : "Upload at least 1 photo";
  const extraTagRequired = isSpanish ? "Elija al menos un servicio adicional" : "Choose at least one extra service";
  const serviceTagRequired = isSpanish ? "Elija al menos un servicio básico" : "Choose at least one basic service";
  const priceRefineError = isSpanish ? "Los precios por noche deben ser mayores que 0" : "Prices per night must be greater than 0";

  return z
    .object({
      id: z.string(),
      propertyId: z.string(),
      name: z.string().min(1, { message: nameRequired }),
      roomNumber: z.string().min(1, { message: roomNumberRequired }),
      description: z.string().min(1, { message: descriptionRequired }),

      isPrivate: z.boolean(),

      singleBeds: z.coerce
        .number()
        .min(0, { message: quantityRequired })
        .transform((val) => (isNaN(val) ? 0 : val)),
      doubleBeds: z.coerce
        .number()
        .min(0, { message: quantityRequired })
        .transform((val) => (isNaN(val) ? 0 : val)),

      beds: z.coerce
        .number()
        .min(0)
        .max(99, { message: max99Beds })
        .transform((val) => (isNaN(val) ? 0 : val)),

      capacity: z.coerce
        .number()
        .min(0)
        .max(99, { message: max99Capacity })
        .transform((val) => (isNaN(val) ? 1 : val)),

      privateRoomPrice: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),
      privateRoomCleaning: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),

      sharedRoomPrice: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),
      sharedRoomCleaning: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)),

      bedType: z.string(),
      bedName: z.string(),

      checkinTime: z.string().min(1, { message: checkinRequired }),
      checkoutTime: z.string().min(1, { message: checkoutRequired }),

      shortStayDiscount: z.string().default("0"),
      mediumStayDiscount: z.string().default("0"),
      longStayDiscount: z.string().default("0"),

      photos: z.array(z.string()).min(1, { message: photoRequired }),
      extraTags: z.array(z.string()).min(1, { message: extraTagRequired }),
      servicesTags: z.array(z.string()).min(1, { message: serviceTagRequired }),
      descriptionService: z.string(),
    })
    .refine(
      (data) => {
        // La validación interna de precios se mueve a handleSubmit
        if (data.singleBeds === 0 && data.doubleBeds === 0) {
          return true
        }
        return true
      },
      {
        message: priceRefineError,
        path: ["pricePerNight"],
      },
    )
}

// === INFERENCIA DE TIPO PARA FormData ===
// Inferir el tipo de datos que se enviará del esquema dinámico
type FormData = z.infer<
  ReturnType<typeof createFormSchema>
>;

// El tipo FormData se usa aquí para tipar correctamente las props
interface RoomFormProps {
  onSubmit: (data: FormData) => void // ✅ 'any' reemplazado por 'FormData'
  initialValues?: Partial<FormData> // ✅ Uso de FormData
  onImagesChange?: (files: File[], existingIds: string[], markedForDeletion: string[]) => void
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

export default function RoomForm({ onSubmit, initialValues, onImagesChange }: RoomFormProps) {
  const { toast } = useToast()
  
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Por defecto 'es'
  const isSpanish = lang === "es";

  // 1. Crear el esquema de forma dinámica basado en el idioma
  const formSchema = createFormSchema(isSpanish);
  
  // 2. FormData ya está tipado arriba
  // type FormData = z.infer<typeof formSchema>; // NO NECESARIO AQUÍ


  // State for check-in/check-out times
  const [checkinTime, setCheckinTime] = useState(initialValues?.checkinTime || "15:00")
  const [checkoutTime, setCheckoutTime] = useState(initialValues?.checkoutTime || "11:00")

  // State for discounts
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

  // 3. Pasar el esquema dinámico a useForm
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
      beds: initialValues?.beds || 0,
      capacity: initialValues?.capacity || 1,

      // Pricing for PRIVATE room - 2 campos separados
      privateRoomPrice: initialValues?.privateRoomPrice || 0,
      privateRoomCleaning: initialValues?.privateRoomCleaning || 0,

      // Pricing for SHARED room - 2 campos separados
      sharedRoomPrice: initialValues?.sharedRoomPrice || 0,
      sharedRoomCleaning: initialValues?.sharedRoomCleaning || 0,

      bedType: initialValues?.bedType || "single",
      bedName: initialValues?.bedName || "",

      // Check-in/Check-out defaults
      checkinTime: initialValues?.checkinTime || "15:00",
      checkoutTime: initialValues?.checkoutTime || "11:00",

      // Discount defaults
      shortStayDiscount: initialValues?.shortStayDiscount || "0",
      mediumStayDiscount: initialValues?.mediumStayDiscount || "0",
      longStayDiscount: initialValues?.longStayDiscount || "0",

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

  // Update form values when check-in/check-out times change
  useEffect(() => {
    form.setValue("checkinTime", checkinTime)
  }, [checkinTime, form])

  useEffect(() => {
    form.setValue("checkoutTime", checkoutTime)
  }, [checkoutTime, form])

  // Update form values when discounts change
  useEffect(() => {
    form.setValue("mediumStayDiscount", mediumStayDiscount)
  }, [mediumStayDiscount, form])

  useEffect(() => {
    form.setValue("longStayDiscount", longStayDiscount)
  }, [longStayDiscount, form])

  // Update total beds when single or double beds change
  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds
    form.setValue("beds", totalBeds)

    // Also update capacity based on beds
    const estimatedCapacity = singleBeds + doubleBeds * 2
    form.setValue("capacity", estimatedCapacity)

    // Limpiar precios en modo privado cuando no hay camas
    if (isPrivate && totalBeds === 0) {
      form.setValue("privateRoomPrice", 0)
      form.setValue("privateRoomCleaning", 0)
    }

    // Limpiar errores cuando se seleccionan camas
    if (totalBeds > 0) {
      form.clearErrors("beds")
      form.clearErrors("capacity")
      form.clearErrors("singleBeds")
      form.clearErrors("doubleBeds")
    }
  }, [singleBeds, doubleBeds, form, isPrivate])

  // Modificar la validación en el handleSubmit para manejar correctamente los precios según el tipo de habitación
  async function handleSubmit(values: FormData) {
    console.log(values)
    try {
      // Asegurar que todos los campos numéricos sean números
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
      }

      // Validación de precios SOLO para el tipo activo
      if (processedValues.isPrivate) {
        // Validación SOLO para habitación privada
        if (processedValues.privateRoomPrice <= 0) {
          form.setError("privateRoomPrice", {
            type: "manual",
            message: isSpanish ? "El precio por noche debe ser mayor que 0" : "Price per night must be greater than 0",
          })
          document.getElementById("privateRoomPrice")?.focus()
          return
        }

        // Validar que haya al menos una cama
        if (processedValues.singleBeds === 0 && processedValues.doubleBeds === 0) {
          toast({
            title: isSpanish ? "Error de validación" : "Validation Error",
            description: isSpanish ? "Debe seleccionar al menos una cama" : "You must select at least one bed",
            variant: "destructive",
          })
          return
        }

        if (processedValues.privateRoomCleaning < 0) {
          form.setError("privateRoomCleaning", {
            type: "manual",
            message: isSpanish ? "La tarifa de limpieza no puede ser negativa" : "Cleaning fee cannot be negative",
          })
          document.getElementById("privateRoomCleaning")?.focus()
          return
        }
      } else {
        // Validación SOLO para habitación compartida
        if (processedValues.sharedRoomPrice <= 0) {
          form.setError("sharedRoomPrice", {
            type: "manual",
            message: isSpanish ? "El precio por noche por cama debe ser mayor que 0" : "Price per night per bed must be greater than 0",
          })
          document.getElementById("sharedRoomPrice")?.focus()
          return
        }

        if (processedValues.sharedRoomCleaning < 0) {
          form.setError("sharedRoomCleaning", {
            type: "manual",
            message: isSpanish ? "La tarifa de limpieza por cama no puede ser negativa" : "Cleaning fee per bed cannot be negative",
          })
          document.getElementById("sharedRoomCleaning")?.focus()
          return
        }
      }

      await onSubmit(processedValues)
      toast({
        title: isSpanish ? "¡Felicidades!" : "Success!",
        description: isSpanish ? "La habitación ha sido guardada" : "The room has been saved",
        variant: "default",
      })
    } catch (error) {
      console.log(error)
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "Por favor revise todos los datos" : "Please check all data",
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
                  <FormLabel>{isSpanish ? "Nombre del alojamiento" : "Accommodation Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder={isSpanish ? "Ej. Habitación con Vista al Lago" : "Ex. Room with Lake View"} {...field} />
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
                  <FormLabel>{isSpanish ? "Número" : "Number"}</FormLabel>
                  <FormControl>
                    <Input placeholder={isSpanish ? "Ej. 1D" : "Ex. 1D"} {...field} />
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
                <FormLabel>{isSpanish ? "Descripción" : "Description"}</FormLabel>
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

        {/* Room Type Selection */}
        <RoomTypeSelector
          control={form.control}
          isPrivate={isPrivate}
          singleBeds={singleBeds}
          doubleBeds={doubleBeds}
          watch={form.watch}
          setValue={form.setValue}
          lang={lang}
           // Pasar isSpanish si el componente RoomTypeSelector necesita traducción
        />

        {/* Check-in/Check-out Section */}
        <div className="space-y-4 p-4 bg-white rounded-xl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isSpanish ? "Horarios de Check-in y Check-out" : "Check-in and Check-out Times"}
            </h3>
            <p className="text-sm text-gray-600">
              {isSpanish ? "Establece los horarios estándar para la llegada y salida de los huéspedes." : "Set the standard times for guest arrival and departure."}
            </p>
            <CheckinCheckoutSection
              checkinTime={checkinTime}
              setCheckinTime={setCheckinTime}
              checkoutTime={checkoutTime}
              setCheckoutTime={setCheckoutTime}
              defaultCheckinTime="15:00"
              defaultCheckoutTime="11:00"
              lang={lang}
            />
            {/* Display form validation errors for check-in/check-out */}
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

        {/* Componente de descuentos */}
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
          lang={lang}
          // Pasar isSpanish si el componente necesita traducción interna
        />

        {/* Hidden form fields for discounts validation */}
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
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isSpanish ? "Fotos" : "Photos"}</FormLabel>
                <FormControl>
                  <MultiImageUploaderWithIds
                    maxImages={6}
                    defaultImageIds={field.value}
                    onImagesChange={(files, existingIds, markedForDeletion) => {
                      // Pass the data to parent component
                      onImagesChange?.(files, existingIds, markedForDeletion)

                      // Calculate visible existing IDs (not marked for deletion)
                      const visibleIds = existingIds.filter((id) => !markedForDeletion.includes(id))

                      // Create array with existing IDs + placeholders for new files
                      const totalImages = [...visibleIds, ...files.map((_, index) => `new-file-${index}`)]

                      field.onChange(totalImages)
                    }}
                    lang={lang}
                     // Pasar isSpanish si el componente necesita traducción
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
                <FormLabel>{isSpanish ? "Servicios Básicos" : "Basic Services"}</FormLabel>
                <FormControl>
                  <CollectionServiceTags
                    onChange={(newTags: string[]) => {
                      if (JSON.stringify(newTags) !== JSON.stringify(field.value)) {
                        field.onChange(newTags)
                      }
                    }}
                    servicesTags={serviceTags || []}
                    initialSelectedTags={field.value}
                    lang={lang}
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
                <FormLabel>{isSpanish ? "Servicios Adicionales" : "Additional Services"}</FormLabel>
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
                    lang={lang}
                   // Pasar isSpanish si el componente necesita traducción
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
                <FormLabel>{isSpanish ? "Información Adicional de Servicios" : "Additional Service Information"}</FormLabel>
                <FormControl>
                  <Textarea placeholder={isSpanish ? "Si necesita explicar más sobre sus servicios, escriba aquí" : "If you need to explain more about your services, write here"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormLabel>{isSpanish ? "Políticas de Recovery Care Solutions" : "Recovery Care Solutions Policies"}</FormLabel>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-800 text-sm">{isSpanish ? "Pago Flexible" : "Flexible Payment"}</span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {isSpanish ? "Anticipo 10%" : "10% Advance"}
                </span>
              </div>

              <p className="text-xs text-gray-600">
                {isSpanish
                  ? "Se permite al huésped pagar un anticipo del 10% para asegurar la reserva y completar el pago más adelante, con anulación gratuita en las primeras 24 horas. Para estadías largas (+10 noches), este anticipo es reembolsable bajo ciertas condiciones según las políticas de la plataforma Recovery Care Solutions."
                  : "The guest is allowed to pay a 10% advance to secure the booking and complete the payment later, with free cancellation within the first 24 hours. For long stays (+10 nights), this advance is refundable under certain conditions according to the Recovery Care Solutions platform policies."}
              </p>
            </div>
          </div>

          {/* Contenedor para los botones de políticas */}
          <div className="flex flex-col md:flex-row gap-3 w-full">
            {/* Botón para Políticas de Anulación */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {isSpanish ? "Ver Políticas de Anulación" : "View Cancellation Policies"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isSpanish ? "Políticas de Anulación de Reserva" : "Booking Cancellation Policies"}</DialogTitle>
                  <DialogDescription>
                    {isSpanish ? "Detalles sobre las condiciones de cancelación para diferentes tipos de estadía." : "Details on cancellation conditions for different stay types."}
                  </DialogDescription>
                </DialogHeader>
                <CancellationPolicyDialogContent  lang={lang}/>
              </DialogContent>
            </Dialog>

            {/* Botón para Políticas de Modificación */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  {isSpanish ? "Ver Políticas de Modificación" : "View Modification Policies"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isSpanish ? "Políticas de Modificación de Reserva" : "Booking Modification Policies"}</DialogTitle>
                  <DialogDescription>
                    {isSpanish ? "Detalles sobre las condiciones para modificar una reserva existente." : "Details on the conditions for modifying an existing booking."}
                  </DialogDescription>
                </DialogHeader>
                <ModificationPolicyDialogContent lang={lang}/>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 mt-4 p-4 md:p-0">
          <Link href={`/mi-panel/propiedades/${initialValues?.propertyId}/`} className="flex-1 w-full">
            <Button variant="outline" type="button" className="w-full text-sm px-4 py-3 h-full bg-transparent">
              {isSpanish ? "Cancelar" : "Cancel"}
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
                {isSpanish ? "Guardando..." : "Saving..."}
              </>
            ) : (
              isSpanish ? "Guardar" : "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}