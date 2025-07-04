"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Import the RichTextEditor component
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

import GalleryUpload from "@/components/GalleryUpload";
import { CollectionExtraTags } from "@/components/collectionExtraTags";
import { CollectionServiceTags } from "@/components/collectionServiceTags";
import { getExtraTags } from "@/services/extraTagsService";
import { getServiceTags } from "@/services/serviceTagsService";
import useTags from "@/hooks/useTags";

import Link from "next/link";
import { useEffect } from "react";

// Importar el nuevo componente
import RoomTypeSelector from "./room-type-selector";

// Function to pluralize words in Spanish
export const pluralize = (
  quantity: number,
  singular: string,
  plural: string
) => {
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`;
};

export const formSchema = z
  .object({
    id: z.string(),
    propertyId: z.string(),
    name: z.string().min(1, { message: "El nombre es requerido" }),
    roomNumber: z
      .string()
      .min(1, { message: "El número de habitación es requerido" }),
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

    // Total beds and capacity - Modificado para aceptar 0 sin mostrar error
    beds: z.coerce
      .number()
      .min(0)
      .max(99, { message: "Máximo 99 camas" })
      .transform((val) => (isNaN(val) ? 0 : val)),
    capacity: z.coerce
      .number()
      .min(0)
      .max(99, { message: "Capacidad máxima 99" })
      .transform((val) => (isNaN(val) ? 0 : val)),

    // Pricing for PRIVATE room - CAMPOS COMPLETAMENTE INDEPENDIENTES
    privateRoomPrice: z.coerce
      .number()
      .transform((val) => (isNaN(val) ? 0 : val)),
    privateRoomCleaning: z.coerce
      .number()
      .transform((val) => (isNaN(val) ? 0 : val)),

    // Pricing for SHARED room - CAMPOS COMPLETAMENTE INDEPENDIENTES
    sharedRoomPrice: z.coerce
      .number()
      .transform((val) => (isNaN(val) ? 0 : val)),
    sharedRoomCleaning: z.coerce
      .number()
      .transform((val) => (isNaN(val) ? 0 : val)),

    bedType: z.string(),
    bedName: z.string(),

    // Other fields
    photos: z.array(z.string()).min(1, { message: "Suba al menos 1 foto" }),
    extraTags: z
      .array(z.string())
      .min(1, { message: "Elija al menos un servicio adicional" }),
    servicesTags: z
      .array(z.string())
      .min(1, { message: "Elija al menos un servicio básico" }),
    descriptionService: z.string(),
  })
  .refine(
    (data) => {
      // Si no hay camas, no validamos precios
      if (data.singleBeds === 0 && data.doubleBeds === 0) {
        return true;
      }

      return true;
    },
    {
      message: "Los precios por noche deben ser mayores que 0",
      path: ["pricePerNight"], // Este campo mostrará el error
    }
  );

type FormData = z.infer<typeof formSchema>;

interface RoomFormProps {
  onSubmit: (data: FormData) => void;
  initialValues?: Partial<FormData>;
}

export default function RoomForm({ onSubmit, initialValues }: RoomFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialValues?.id || "",
      propertyId: initialValues?.propertyId || "",
      name: initialValues?.name || "",
      roomNumber: initialValues?.roomNumber || "",
      description: initialValues?.description || "",

      // Room type defaults
      isPrivate:
        initialValues?.isPrivate !== undefined ? initialValues.isPrivate : true,

      // Beds configuration
      singleBeds: initialValues?.singleBeds || 0,
      doubleBeds: initialValues?.doubleBeds || 0,

      // Total beds and capacity
      beds: initialValues?.beds || 0,
      capacity: initialValues?.capacity || 0,

      // Pricing for PRIVATE room - 2 campos separados
      privateRoomPrice: initialValues?.privateRoomPrice || 0,
      privateRoomCleaning: initialValues?.privateRoomCleaning || 0,

      // Pricing for SHARED room - 2 campos separados
      sharedRoomPrice: initialValues?.sharedRoomPrice || 0,
      sharedRoomCleaning: initialValues?.sharedRoomCleaning || 0,

      bedType: initialValues?.bedType || "single",
      bedName: initialValues?.bedName || "",

      // Other fields
      photos: initialValues?.photos || [],
      extraTags: initialValues?.extraTags || [],
      servicesTags: initialValues?.servicesTags || [],
      descriptionService: initialValues?.descriptionService || "",
    },
    mode: "onTouched",
  });

  const { extraTags, serviceTags } = useTags(
    "extraTags",
    "servicesTags",
    getExtraTags,
    getServiceTags
  );

  // Get current value of isPrivate
  const isPrivate = form.watch("isPrivate");
  const singleBeds = form.watch("singleBeds");
  const doubleBeds = form.watch("doubleBeds");

  // Update total beds when single or double beds change
  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds;
    form.setValue("beds", totalBeds);

    // Also update capacity based on beds
    // Assuming 1 person per single bed and 2 per double bed
    const estimatedCapacity = singleBeds + doubleBeds * 2;
    form.setValue("capacity", estimatedCapacity);

    // Limpiar precios en modo privado cuando no hay camas
    if (isPrivate && totalBeds === 0) {
      form.setValue("privateRoomPrice", 0);
      form.setValue("privateRoomCleaning", 0);
    }

    // Limpiar errores cuando se seleccionan camas
    if (totalBeds > 0) {
      form.clearErrors("beds");
      form.clearErrors("capacity");
      form.clearErrors("singleBeds");
      form.clearErrors("doubleBeds");
    }
  }, [singleBeds, doubleBeds, form]);

  // Modificar la validación en el handleSubmit para manejar correctamente los precios según el tipo de habitación
  async function handleSubmit(values: FormData) {
    console.log(values);
    try {
      // Asegurar que todos los campos numéricos sean números
      const processedValues = {
        ...values,
        singleBeds: Number(values.singleBeds) || 0,
        doubleBeds: Number(values.doubleBeds) || 0,
        beds: Number(values.beds) || 0,
        capacity: Number(values.capacity) || 0,
        privateRoomPrice: Number(values.privateRoomPrice) || 0,
        privateRoomCleaning: Number(values.privateRoomCleaning) || 0,
        sharedRoomPrice: Number(values.sharedRoomPrice) || 0,
        sharedRoomCleaning: Number(values.sharedRoomCleaning) || 0,
      };

      // Validación adicional según el tipo de habitación

      // Validación de precios según el tipo de habitación
      // Validación de precios SOLO para el tipo activo
      if (processedValues.isPrivate) {
        // Validación SOLO para habitación privada
        if (processedValues.privateRoomPrice <= 0) {
          form.setError("privateRoomPrice", {
            type: "manual",
            message: "El precio por noche debe ser mayor que 0",
          });
          document.getElementById("privateRoomPrice")?.focus();
          return;
        }

        // Validar que haya al menos una cama
        if (
          processedValues.singleBeds === 0 &&
          processedValues.doubleBeds === 0
        ) {
          toast({
            title: "Error de validación",
            description: "Debe seleccionar al menos una cama",
            variant: "destructive",
          });
          return;
        }

        if (processedValues.privateRoomCleaning < 0) {
          form.setError("privateRoomCleaning", {
            type: "manual",
            message: "La tarifa de limpieza no puede ser negativa",
          });
          document.getElementById("privateRoomCleaning")?.focus();
          return;
        }
      } else {
        // Validación SOLO para habitación compartida
        if (processedValues.sharedRoomPrice <= 0) {
          form.setError("sharedRoomPrice", {
            type: "manual",
            message: "El precio por noche por cama debe ser mayor que 0",
          });
          document.getElementById("sharedRoomPrice")?.focus();
          return;
        }

        if (processedValues.sharedRoomCleaning < 0) {
          form.setError("sharedRoomCleaning", {
            type: "manual",
            message: "La tarifa de limpieza por cama no puede ser negativa",
          });
          document.getElementById("sharedRoomCleaning")?.focus();
          return;
        }
      }

      await onSubmit(processedValues);
      toast({
        title: "¡Felicidades!",
        description: "La habitación ha sido guardada",
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Por favor revise todos los datos",
        variant: "destructive",
      });
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
                    <Input
                      placeholder="Ej. Habitación con Vista al Lago"
                      {...field}
                    />
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
                <FormLabel>Fotos</FormLabel>
                <FormControl>
                  <GalleryUpload
                    initialIds={field.value}
                    onGalleryChange={(newGallery: string[]) => {
                      console.log(newGallery);
                      field.onChange(newGallery);
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
                      if (
                        JSON.stringify(newTags) !== JSON.stringify(field.value)
                      ) {
                        field.onChange(newTags);
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
                      if (
                        JSON.stringify(newTags) !== JSON.stringify(field.value)
                      ) {
                        field.onChange(newTags);
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
                  <Textarea
                    placeholder="Si necesita explicar más sobre sus servicios, escriba aquí"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 mt-4 p-4 md:p-0">
          <Link
            href={`/propiedades/${initialValues?.propertyId}/`}
            className="flex-1 w-full"
          >
            <Button
              variant="outline"
              type="button"
              className="w-full text-sm px-4 py-3 h-full"
            >
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
  );
}
