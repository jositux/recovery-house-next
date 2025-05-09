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

const formSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  roomNumber: z.string().min(1, { message: "Room number is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  beds: z.number().int().positive().max(99, { message: "Maximum 99 beds" }),
  capacity: z
    .number()
    .int()
    .positive()
    .max(99, { message: "Maximum capacity 99" }),
  pricePerNight: z
    .number()
    .positive({ message: "Price per night must be a positive number" }),
  cleaningFee: z
    .number()
    .positive({ message: "Cleaning fee must be a positive number" }),
  photos: z
    .array(z.string())
    .min(1, { message: "At least one photo is required" }),
  extraTags: z
    .array(z.string())
    .min(1, { message: "At least one extratag is required" }),
  servicesTags: z
    .array(z.string())
    .min(1, { message: "At least one service is required" }),
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
        title: "Success",
        description: "Room information has been saved successfully.",
        variant: "default",
      });
      //form.reset()
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Please check the information and try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-7">
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
          <div className="col-span-3">
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter room description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectValue placeholder="Elegir Cantidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
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
                <FormLabel>Máximo de personas</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))} // CONVIERTE EL STRING A NÚMERO
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir cantidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 4, 6, 8, 10,20].map((num) => (
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
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
              <FormLabel>Costo por Limpieza</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Photos URLs</FormLabel>
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
        <FormField
          control={form.control}
          name="extraTags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extra Tags</FormLabel>
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
          name="servicesTags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services Tags</FormLabel>
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
                  initialSelectedTags={['all-included']}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </form>
    </Form>
  );
}
