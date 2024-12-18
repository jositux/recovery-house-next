"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { ImageUpload } from "@/components/ui/image-upload"
import { amenities, AmenityId } from "@/data/amenities"
import { roomsService, RoomData } from '@/services/roomsService';

const getPropertyIdFromLocalStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('propertyId');
  }
  return null;
};

const roomSchema = z.object({
  beds: z.string().min(1, "Requerido"),
  capacity: z.string().min(1, "Requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  amenities: z.array(z.custom<AmenityId>()),
  pricePerNight: z.string().min(1, "Requerido"),
  nightAvailability: z.boolean().default(false),
  photo: z.object({
    id: z.string(),
    filename: z.string(),
    url: z.string()
  }).nullable().optional(),
})

const formSchema = z.object({
  rooms: z.array(roomSchema)
})

export type RoomConfigurationFormValues = z.infer<typeof formSchema>

interface RoomConfigurationFormProps {
  numberOfRooms: number
  onSubmit: (values: RoomConfigurationFormValues) => void
  onBack: (values: RoomConfigurationFormValues) => void
  initialValues?: RoomConfigurationFormValues
}

const defaultRoomValues = {
  beds: "",
  capacity: "",
  description: "",
  amenities: [],
  pricePerNight: "",
  nightAvailability: false,
  photo: null
}

export function RoomConfigurationForm({ numberOfRooms, onSubmit, onBack, initialValues }: RoomConfigurationFormProps) {
  const [activeTab, setActiveTab] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RoomConfigurationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rooms: Array(numberOfRooms).fill(defaultRoomValues)
    },
  })

  useEffect(() => {
    if (initialValues) {
      const updatedRooms = initialValues.rooms.map(room => ({
        ...room,
        photo: room.photo || null
      }));
      while (updatedRooms.length < numberOfRooms) {
        updatedRooms.push(defaultRoomValues);
      }
      form.reset({ rooms: updatedRooms.slice(0, numberOfRooms) });
    } else {
      form.reset({ rooms: Array(numberOfRooms).fill(defaultRoomValues) });
    }
  }, [numberOfRooms, initialValues, form])

  const handleSubmit = async (values: RoomConfigurationFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const propertyId = getPropertyIdFromLocalStorage();
    if (!propertyId) {
      setErrorMessage("No se pudo encontrar el ID de la propiedad. Por favor, vuelva atrás y complete el formulario de la propiedad.");
      setIsSubmitting(false);
      return;
    }

    try {
      const roomsData: RoomData[] = values.rooms.map(room => ({
        name: `Room ${values.rooms.indexOf(room) + 1}`,
        number: (values.rooms.indexOf(room) + 1).toString(),
        beds: parseInt(room.beds),
        capacity: parseInt(room.capacity),
        description: room.description,
        pricePerNigth: room.pricePerNight,
        mainImage: room.photo ? { id: room.photo.id } : { id: "" },
        photos: room.photo ? [{ id: room.photo.id }] : [],
        services: room.amenities.map(amenity => ({ key: amenity })),
        extraTags: []
      }));

      const createdRooms = await roomsService.createRooms(propertyId, roomsData);
      console.log('Rooms created:', createdRooms);
      onSubmit(values);
    } catch (error) {
      console.error('Error creating rooms:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al crear las habitaciones");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex justify-center gap-4 w-full">
            {Array.from({ length: numberOfRooms }).map((_, index) => (
              <TabsTrigger key={index} value={(index + 1).toString()} className="size-10 rounded-full border data-[state=active]:border-[#4A7598] data-[state=active]:text-[#4A7598] data-[state=active]:bg-transparent">
                {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {Array.from({ length: numberOfRooms }).map((_, index) => (
            <TabsContent key={index} value={(index + 1).toString()}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`rooms.${index}.beds`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de camas</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="Ej: 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`rooms.${index}.capacity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de personas</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="Ej: 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`rooms.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe la habitación</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las características principales de la habitación"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Amenidades / Servicios</h3>
                  <FormField
                    control={form.control}
                    name={`rooms.${index}.amenities`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-4">
                            {amenities.map((amenity) => (
                              <UserTypeCard
                                key={amenity.id}
                                icon={amenity.icon}
                                title={amenity.label}
                                description=""
                                selected={field.value.includes(amenity.id)}
                                onClick={() => {
                                  const updatedValue = field.value.includes(amenity.id)
                                    ? field.value.filter(id => id !== amenity.id)
                                    : [...field.value, amenity.id];
                                  field.onChange(updatedValue);
                                }}
                                aria-label={`Toggle ${amenity.label} amenity`}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`rooms.${index}.photo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto de la habitación</FormLabel>
                      <FormControl>
                        <ImageUpload
                          onChange={(fileData) => {
                            form.setValue(`rooms.${index}.photo`, fileData || null);
                          }}
                          onRemove={() => {
                            form.setValue(`rooms.${index}.photo`, null);
                          }}
                          value={field.value || undefined}
                        />
                      </FormControl>
                      <FormDescription>
                        Sube una foto de la habitación.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.pricePerNight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio noche</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Ej: 100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.nightAvailability`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Calendario de disponibilidad nocturna
                        </FormLabel>
                        <FormDescription>
                          Activa esta opción si la habitación está disponible para reservas nocturnas
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between space-x-4">
          <Button type="button" variant="outline" onClick={() => {
            const currentValues = form.getValues();
            const roomsWithPhotos = currentValues.rooms.map(room => ({
              ...room,
              photo: room.photo || null
            }));
            onBack({ rooms: roomsWithPhotos });
          }}>
            Atrás
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>
      </form>
    </Form>
  )
}

