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

import { type Locale } from "@/lib/i18n"
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { MultiImageUploader } from "../components/multi-image-uploader"
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

import { CancellationPolicyDialogContent } from "@/components/popups/cancellation-policy-dialog-content"
import { ModificationPolicyDialogContent } from "@/components/popups/modification-policy-dialog-content"


// =================================================================
// 🚀 EXPORTACIÓN DE ESQUEMA (Movido fuera del componente)
// =================================================================

// Función para crear el esquema dinámicamente con el idioma
export const createFormSchema = (isSpanish: boolean) => { // ✅ Exportado
  const nameRequired = isSpanish ? "El nombre es requerido" : "Name Required";
  const roomNumberRequired = isSpanish ? "El número de habitación es requerido" : "Room number required";
  const descriptionRequired = isSpanish ? "La descripción es requerida" : "Description required";
  const quantityRequired = isSpanish ? "Debe seleccionar cantidad" : "Must select quantity";
  const max99Beds = isSpanish ? "Máximo 99 camas" : "Maximum 99 beds";
  const max99Capacity = isSpanish ? "Capacidad máxima 99" : "Maximum capacity 99";
  const checkinRequired = isSpanish ? "Seleccione horario de check-in" : "Select check-in time";
  const checkoutRequired = isSpanish ? "Seleccione horario de check-out" : "Select check-out time";
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

      photos: z.array(z.string()).default([]),
      imageFiles: z.array(z.any()).optional(),

      extraTags: z.array(z.string()).min(1, { message: extraTagRequired }),
      servicesTags: z.array(z.string()).min(1, { message: serviceTagRequired }),
      descriptionService: z.string(),
    })
    .refine(
      (data) => {
        // La validación original de precios se hará en handleSubmit, 
        // pero esta refine se puede mantener para validaciones genéricas.
        if (data.singleBeds === 0 && data.doubleBeds === 0) {
          return true
        }
        return true
      },
      {
        message: priceRefineError,
        path: ["privateRoomPrice"], // Se cambió el path para ser más específico
      },
    )
}

// 💡 EXPORTACIÓN DE TIPO: Exporta el tipo inferido del esquema
export type RoomFormData = z.infer<ReturnType<typeof createFormSchema>>;

// =================================================================
// 📚 Traducciones Fijas
// =================================================================

type TranslationText = {
  // Titles & Labels
  accommodationNameLabel: string;
  accommodationNamePlaceholder: string;
  numberLabel: string;
  numberPlaceholder: string;
  descriptionLabel: string;
  checkinCheckoutTitle: string;
  checkinCheckoutDesc: string;
  photosLabel: string;
  photosRequiredError: string;
  basicServicesLabel: string;
  additionalServicesLabel: string;
  additionalServicesInfoLabel: string;
  additionalServicesInfoPlaceholder: string;
  
  // Policies
  policiesTitle: string;
  flexiblePayment: string;
  advanceBadge: string;
  flexiblePaymentDesc: string;
  viewCancellationPolicies: string;
  cancellationPoliciesTitle: string;
  cancellationPoliciesDesc: string;
  viewModificationPolicies: string;
  modificationPoliciesTitle: string;
  modificationPoliciesDesc: string;

  // Buttons & Actions
  cancelButton: string;
  saveButton: string;
  savingMessage: string;
  uploadingMessage: string;
  
  // Validation Messages (Runtime)
  priceError: string;
  pricePerBedError: string;
  cleaningFeeNegativeError: string;
  mustSelectBedError: string;
  genericError: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    accommodationNameLabel: "Nombre del alojamiento",
    accommodationNamePlaceholder: "Ej. Habitación con Vista al Lago",
    numberLabel: "Número",
    numberPlaceholder: "Ej. 1D",
    descriptionLabel: "Descripción",
    checkinCheckoutTitle: "Horarios de Check-in y Check-out",
    checkinCheckoutDesc: "Establece los horarios estándar para la llegada y salida de los huéspedes.",
    photosLabel: "Fotos",
    photosRequiredError: "Debe subir al menos 1 foto",
    basicServicesLabel: "Servicios Básicos",
    additionalServicesLabel: "Servicios Adicionales",
    additionalServicesInfoLabel: "Información Adicional de Servicios",
    additionalServicesInfoPlaceholder: "Si necesita explicar más sobre sus servicios, escriba aquí",
    
    policiesTitle: "Políticas de Recovery Care Solutions",
    flexiblePayment: "Pago Flexible",
    advanceBadge: "Anticipo 10%",
    flexiblePaymentDesc: "Se permite al huésped pagar un anticipo del 10% para asegurar la reserva y completar el pago más adelante, con anulación gratuita en las primeras 24 horas. Para estadías largas (+10 noches), este anticipo es reembolsable bajo ciertas condiciones según las políticas de la plataforma Recovery Care Solutions.",
    viewCancellationPolicies: "Ver Políticas de Anulación",
    cancellationPoliciesTitle: "Políticas de Anulación de Reserva",
    cancellationPoliciesDesc: "Detalles sobre las condiciones de cancelación para diferentes tipos de estadía.",
    viewModificationPolicies: "Ver Políticas de Modificación",
    modificationPoliciesTitle: "Políticas de Modificación de Reserva",
    modificationPoliciesDesc: "Detalles sobre las condiciones para modificar una reserva existente.",
    
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    savingMessage: "Guardando...",
    uploadingMessage: "Subiendo Fotos...",
    
    priceError: "El precio por noche debe ser mayor que 0",
    pricePerBedError: "El precio por noche por cama debe ser mayor que 0",
    cleaningFeeNegativeError: "La tarifa de limpieza no puede ser negativa",
    mustSelectBedError: "Debe seleccionar al menos una cama",
    genericError: "Por favor revise todos los datos",
  },
  en: {
    accommodationNameLabel: "Accommodation Name",
    accommodationNamePlaceholder: "Ex. Room with Lake View",
    numberLabel: "Number",
    numberPlaceholder: "Ex. 1D",
    descriptionLabel: "Description",
    checkinCheckoutTitle: "Check-in and Check-out Times",
    checkinCheckoutDesc: "Set the standard times for guest arrival and departure.",
    photosLabel: "Photos",
    photosRequiredError: "You must upload at least 1 photo",
    basicServicesLabel: "Basic Services",
    additionalServicesLabel: "Additional Services",
    additionalServicesInfoLabel: "Additional Service Information",
    additionalServicesInfoPlaceholder: "If you need to explain more about your services, write here",
    
    policiesTitle: "Recovery Care Solutions Policies",
    flexiblePayment: "Flexible Payment",
    advanceBadge: "10% Advance",
    flexiblePaymentDesc: "The guest is allowed to pay a 10% advance to secure the booking and complete the payment later, with free cancellation within the first 24 hours. For long stays (+10 nights), this advance is refundable under certain conditions according to the Recovery Care Solutions platform policies.",
    viewCancellationPolicies: "View Cancellation Policies",
    cancellationPoliciesTitle: "Booking Cancellation Policies",
    cancellationPoliciesDesc: "Details on cancellation conditions for different stay types.",
    viewModificationPolicies: "View Modification Policies",
    modificationPoliciesTitle: "Booking Modification Policies",
    modificationPoliciesDesc: "Details on the conditions for modifying an existing booking.",
    
    cancelButton: "Cancel",
    saveButton: "Save",
    savingMessage: "Saving...",
    uploadingMessage: "Uploading Photos...",
    
    priceError: "Price per night must be greater than 0",
    pricePerBedError: "Price per night per bed must be greater than 0",
    cleaningFeeNegativeError: "Cleaning fee cannot be negative",
    mustSelectBedError: "You must select at least one bed",
    genericError: "Please check all data",
  },
};
// =================================================================


interface RoomFormProps {
  onSubmit: (data: RoomFormData) => void // Usamos el tipo exportado
  initialValues?: Partial<RoomFormData> // Usamos el tipo exportado
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

  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Por defecto 'es'
  const isSpanish = lang === "es";
  const texts = translations[lang] || translations.en; // 🌐 Traducción

  // 1. Crear el esquema de forma dinámica basado en el idioma
  const formSchema = createFormSchema(isSpanish);
  
  // 2. Definir el tipo FormData usando el esquema dinámico
  type FormData = z.infer<typeof formSchema>;


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

  // 3. Pasar el esquema dinámico a useForm
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
        title: isSpanish ? "Error de validación" : "Validation Error",
        description: texts.photosRequiredError,
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
            message: texts.priceError,
          })
          document.getElementById("privateRoomPrice")?.focus()
          return
        }

        if (processedValues.singleBeds === 0 && processedValues.doubleBeds === 0) {
          toast({
            title: isSpanish ? "Error de validación" : "Validation Error",
            description: texts.mustSelectBedError,
            variant: "destructive",
          })
          return
        }

        if (processedValues.privateRoomCleaning < 0) {
          form.setError("privateRoomCleaning", {
            type: "manual",
            message: texts.cleaningFeeNegativeError,
          })
          document.getElementById("privateRoomCleaning")?.focus()
          return
        }
      } else {
        if (processedValues.sharedRoomPrice <= 0) {
          form.setError("sharedRoomPrice", {
            type: "manual",
            message: texts.pricePerBedError,
          })
          document.getElementById("sharedRoomPrice")?.focus()
          return
        }

        if (processedValues.sharedRoomCleaning < 0) {
          form.setError("sharedRoomCleaning", {
            type: "manual",
            message: texts.cleaningFeeNegativeError,
          })
          document.getElementById("sharedRoomCleaning")?.focus()
          return
        }
      }

      await onSubmit(processedValues)
    } catch (error) {
      console.log(error)
      toast({
        title: isSpanish ? "Error" : "Error",
        description: texts.genericError,
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
                  <FormLabel>{texts.accommodationNameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={texts.accommodationNamePlaceholder} {...field} />
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
                  <FormLabel>{texts.numberLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={texts.numberPlaceholder} {...field} />
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
                <FormLabel>{texts.descriptionLabel}</FormLabel>
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
          lang={lang} 
        />

        <div className="space-y-4 p-4 bg-white rounded-xl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {texts.checkinCheckoutTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {texts.checkinCheckoutDesc}
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
          lang={lang} 
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
            <FormLabel>{texts.photosLabel}</FormLabel>
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
                lang={lang}
              />
            </FormControl>
            {imageFiles.length === 0 && <p className="text-sm text-destructive mt-2">{texts.photosRequiredError}</p>}
          </FormItem>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="servicesTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.basicServicesLabel}</FormLabel>
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
                <FormLabel>{texts.additionalServicesLabel}</FormLabel>
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
                <FormLabel>{texts.additionalServicesInfoLabel}</FormLabel>
                <FormControl>
                  <Textarea placeholder={texts.additionalServicesInfoPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormLabel>{texts.policiesTitle}</FormLabel>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-800 text-sm">{texts.flexiblePayment}</span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {texts.advanceBadge}
                </span>
              </div>

              <p className="text-xs text-gray-600">
                {texts.flexiblePaymentDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {texts.viewCancellationPolicies}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{texts.cancellationPoliciesTitle}</DialogTitle>
                  <DialogDescription>
                    {texts.cancellationPoliciesDesc}
                  </DialogDescription>
                </DialogHeader>
                <CancellationPolicyDialogContent lang={lang}/>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  {texts.viewModificationPolicies}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{texts.modificationPoliciesTitle}</DialogTitle>
                  <DialogDescription>
                    {texts.modificationPoliciesDesc}
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
              {texts.cancelButton}
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
                {isUploading ? texts.uploadingMessage : texts.savingMessage}
              </>
            ) : (
              texts.saveButton
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}