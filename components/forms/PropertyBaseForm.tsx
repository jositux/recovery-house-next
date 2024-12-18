"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { TaxFormUpload } from "@/components/ui/tax-form-upload"
import { LocationSelector } from "@/components/ui/location-selector"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { Building2, Home } from 'lucide-react'
import { useRef, useState, useEffect } from "react"
import { propertyService, PropertyData } from '@/services/propertyService'

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string().min(1, "El código postal es requerido."),
  street: z.string().min(1, "La calle es requerida."),
  number: z.string().min(1, "El número es requerido."),
  fullAddress: z.string().min(5, "La dirección completa debe tener al menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.number().int().positive(),
  photos: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    url: z.string()
  })).max(1, "Solo se permite una foto por propiedad.").default([]),
  taxIdEINFile: z.object({
    id: z.string(),
    filename: z.string(),
    url: z.string()
  }).nullable().optional(),
})

export type PropertyBaseFormValues = z.infer<typeof formSchema>;

interface PropertyBaseFormProps {
  onSubmit: (values: PropertyBaseFormValues, propertyId?: string) => void
  initialValues?: Partial<PropertyBaseFormValues>
}

export function PropertyBaseForm({ onSubmit, initialValues }: PropertyBaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [originalValues, setOriginalValues] = useState<PropertyBaseFormValues | null>(null);

  const form = useForm<PropertyBaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      country: initialValues?.country || "",
      state: initialValues?.state || "",
      city: initialValues?.city || "",
      postalCode: initialValues?.postalCode || "",
      street: initialValues?.street || "",
      number: initialValues?.number || "",
      fullAddress: initialValues?.fullAddress || "",
      latitude: initialValues?.latitude || null,
      longitude: initialValues?.longitude || null,
      type: initialValues?.type || "Stay",
      taxIdEIN: initialValues?.taxIdEIN || 0,
      photos: initialValues?.photos || [],
      taxIdEINFile: initialValues?.taxIdEINFile || null,
    },
  })

  const locationSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedPropertyId = localStorage.getItem('propertyId');
    if (storedPropertyId) {
      setPropertyId(storedPropertyId);
    }

    if (initialValues) {
      setOriginalValues(initialValues as PropertyBaseFormValues);
    }
  }, [initialValues]);

  const handleSubmit = async (values: PropertyBaseFormValues) => {
    console.log("handleSubmit function called with values:", values);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formattedData: PropertyData = {
        name: values.name,
        country: values.country,
        region: "default", 
        state: values.state,
        city: values.city,
        postalCode: values.postalCode,
        street: values.street,
        number: values.number,
        fullAddress: values.fullAddress,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
        type: values.type,
        taxIdEIN: values.taxIdEIN,
        photos: values.photos.map(photo => ( { id: photo.id } )),
        taxIdEINFile: values.taxIdEINFile ? {  id: values.taxIdEINFile.id  } : null,
      };

      let response;
      if (propertyId) {
        // Check if data has changed
        if (JSON.stringify(values) !== JSON.stringify(originalValues)) {
          console.log("Updating property with ID:", propertyId);
          response = await propertyService.updateProperty(propertyId, formattedData);
          console.log("Propiedad actualizada: Tu propiedad ha sido actualizada correctamente.");
        } else {
          console.log("No changes detected, skipping update");
          onSubmit(values, propertyId);
          return;
        }
      } else {
        console.log("Creating new property");
        response = await propertyService.createProperty(formattedData);
        setPropertyId(response.id);
        localStorage.setItem('propertyId', response.id);
        console.log("Propiedad creada: Tu propiedad ha sido registrada correctamente.");
      }

      console.log('Property created/updated:', response);
      onSubmit(values, response.id);
    } catch (error) {
      console.error('Error creating/updating property:', error);
      if (error instanceof Error) {
        const errorMsg = error.message || "Ha ocurrido un error. Por favor, intenta nuevamente.";
        console.error("Error al crear/actualizar la propiedad:", errorMsg);
        setErrorMessage(errorMsg);
      } else {
        const errorMsg = "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.";
        console.error("Error al crear/actualizar la propiedad:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

        <div ref={locationSectionRef}>
          <LocationSelector
            defaultCountry={form.getValues("country")}
            defaultState={form.getValues("state")}
            defaultCity={form.getValues("city")}
            onChange={({ country, state, city }) => {
              form.setValue("country", country);
              form.setValue("state", state);
              form.setValue("city", city);
            }}
            error={{
              country: form.formState.errors.country?.message,
              state: form.formState.errors.state?.message,
              city: form.formState.errors.city?.message,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Código Postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la calle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Número de la propiedad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección Completa</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitud"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitud"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              <FormLabel>Tax ID/EIN</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Tax ID/EIN"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto de la Propiedad</FormLabel>
              <FormControl>
                <ImageUpload
                  onChange={(fileData) => {
                    form.setValue("photos", fileData ? [fileData] : [])
                  }}
                  onRemove={() => {
                    form.setValue("photos", [])
                  }}
                  value={field.value[0] || null}
                />
              </FormControl>
              <FormDescription>
                Sube una foto de tu propiedad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxIdEINFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID/EIN File</FormLabel>
              <FormControl>
                <TaxFormUpload
                  onChange={(fileData) => {
                    form.setValue("taxIdEINFile", fileData);
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && (
          <div className="text-red-500 mb-4">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar formulario'}
      </Button>
    </form>
  </Form>
)
}

