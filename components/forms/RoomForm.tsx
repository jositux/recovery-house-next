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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import GalleryUpload from "@/components/GalleryUpload";
import { CollectionExtraTags } from "@/components/collectionExtraTags";
import { CollectionServiceTags } from "@/components/collectionServiceTags";
import { getExtraTags } from "@/services/extraTagsService";
import { getServiceTags } from "@/services/serviceTagsService";
import useTags from "@/hooks/useTags";

import Link from "next/link";
//import { getRandomValues } from "crypto";

const formSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  roomNumber: z.string().min(1, { message: "Campo requerido" }),
  description: z.string().min(1, { message: "Campo Obligatorio" }),
  beds: z.number().int().positive().max(99, { message: "Maximum 99 beds" }),
  capacity: z
    .number()
    .int()
    .positive()
    .max(99, { message: "Maximum capacity 99" }),
  pricePerNight: z
    .number()
    .positive({ message: "El precio debe ser mayor a 0" }),
  cleaningFee: z.number().positive({ message: "El precio debe ser mayor a 0" }),
  photos: z.array(z.string()).min(1, { message: "Cargar al menos 1 Foto" }),
  extraTags: z
    .array(z.string())
    .min(1, { message: "Elegir por lo menos un servicio extra" }),
  servicesTags: z
    .array(z.string())
    .min(1, { message: "Elegir por lo menos un servicio base" }),
  descriptionService: z.string(),
});

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
      beds: initialValues?.beds || 1,
      capacity: initialValues?.capacity || 1,
      pricePerNight: initialValues?.pricePerNight || 0,
      cleaningFee: initialValues?.cleaningFee || 0,
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

  async function handleSubmit(values: FormData) {
    try {
      await onSubmit(values);
      toast({
        title: "Enhorabuena!",
        description: "Se ha guardado la habitación",
        variant: "default",
      });
      //form.reset()
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Por favor chequea bien todos los datos",
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
                  <FormLabel>Nombre de habitación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Habitación del lago" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ingresa una descripción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Camas</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))} // CONVIERTE EL STRING A NÚMERO
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la cantidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad Máxima</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))} // CONVIERTE EL STRING A NÚMERO
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Elige el máximo de personas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="pricePerNight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio x Noche</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    onFocus={() => {
                      if (field.value === 0) {
                        field.onChange("");
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cleaningFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de Limpieza</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    onFocus={() => {
                      if (field.value === 0) {
                        field.onChange("");
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/*
        <FormField
          control={form.control}
          name="mainImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter main image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />*/}
        <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fotos de la habitación</FormLabel>
                <FormControl>
                  <GalleryUpload
                    initialIds={field.value} // Inicializa con las fotos actuales
                    onGalleryChange={(newGallery: string[]) => {
                      console.log(newGallery);
                      field.onChange(newGallery); // Actualiza el valor del campo photos
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
                        field.onChange(newTags); // Solo actualiza si hay un cambio
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
                <FormLabel>Servicios Extra</FormLabel>
                <FormControl>
                  <CollectionExtraTags
                    onChange={(newTags: string[]) => {
                      if (
                        JSON.stringify(newTags) !== JSON.stringify(field.value)
                      ) {
                        field.onChange(newTags); // Solo actualiza si hay un cambio
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
                <FormLabel>Escribe algo más sobre los servicios</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Si necesitas explicar más sobre tus servicios, escribe aquí"
                    {...field}
                  />
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
  );
}
